"use client";

import React, { useState, useEffect, useRef } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import { useCart } from "@/app/context/CartContext";
import { CheckCircle, Wallet, Banknote, QrCode, Ticket, X, ArrowRight, ArrowLeft, Loader2, MapPin, ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { QRCodeSVG } from 'qrcode.react';

// ✅ Gunakan URL Produksi Railway
const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

export default function PaymentPage() {
  const { cartItems, clearCart } = useCart();
  const router = useRouter();
  const qrSectionRef = useRef<HTMLDivElement>(null);
  
  // State UI
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'cash'>('cash');
  const [sessionData, setSessionData] = useState<any>(null);

  // State Promo
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("checkout_session");
    if (!data || cartItems.length === 0) {
        router.push("/menu");
    } else {
        setSessionData(JSON.parse(data));
    }
  }, [cartItems, router]);

  // Perhitungan Harga
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11; 
  const serviceFee = 2000;
  const total = Math.max(0, subtotal + tax + serviceFee - discountAmount);

  const handleSelectPayment = (method: 'qris' | 'cash') => {
    setPaymentMethod(method);
    if (method === 'qris') {
        setTimeout(() => {
            qrSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setIsCheckingPromo(true);
    setPromoMessage(null);

    try {
        const res = await fetch(`${BACKEND_URL}/api/promos/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ code: promoCodeInput, total_amount: subtotal })
        });
        const json = await res.json();
        if (json.success) {
            setDiscountAmount(json.data.discount_amount);
            setAppliedPromoCode(json.data.code);
            setPromoMessage({ type: 'success', text: `Yeay! Hemat Rp ${json.data.discount_amount.toLocaleString('id-ID')}` });
        } else {
            setDiscountAmount(0);
            setAppliedPromoCode("");
            setPromoMessage({ type: 'error', text: json.message });
        }
    } catch (error) {
        setPromoMessage({ type: 'error', text: "Gagal terhubung ke server." });
    } finally {
        setIsCheckingPromo(false);
    }
  };

  const removePromo = () => {
    setDiscountAmount(0);
    setAppliedPromoCode("");
    setPromoMessage(null);
    setPromoCodeInput("");
  };

  // 🔥 Helper Gambar (Sesuai dengan Dashboard & Admin)
  const getImageUrl = (path: string) => {
    if (!path) return "/Image/placeholder.png";
    if (path.startsWith("http")) return path;
    
    let cleanPath = path.replace('public/', '');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    if (!cleanPath.startsWith('/storage') && !cleanPath.startsWith('/images') && !cleanPath.startsWith('/maps')) {
        cleanPath = '/storage' + cleanPath;
    }
    return `${BACKEND_URL}${cleanPath}`;
  };

  // --- FUNGSI CHECKOUT ---
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
        const token = localStorage.getItem("token");

        // ✅ MAP DATA ITEM AGAR SAMA DENGAN MEGA RESET V2 (unit_price, subtotal, product_id)
        const mappedItems = cartItems.map(item => ({
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            subtotal: item.price * item.quantity,
            variants: item.selectedVariant || null,
            modifiers: [] // Kirim array kosong jika tidak ada modifier
        }));

        const payload = {
            items: mappedItems,
            type: sessionData.type,         
            seat_id: sessionData.seat_id,   
            payment_method: paymentMethod,  
            guest_name: "", 
            promo_code: appliedPromoCode || null,
            discount_amount: discountAmount 
        };

        const res = await fetch(`${BACKEND_URL}/api/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` }) 
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memproses pesanan.");

        clearCart(); 
        localStorage.removeItem("checkout_session"); 
        
        alert(`Pesanan Berhasil! Nomor Order: ${data.order_number}`);
        router.push("/activity"); // 👈 Redirect ke activity untuk pantau status

    } catch (error: any) {
        alert("Terjadi Kesalahan: " + error.message);
    } finally {
        setIsProcessing(false);
    }
  };

  if (!sessionData) return <div className="min-h-screen bg-navy-900 flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={40} /></div>;

  const qrisValue = `GETCHA-PAYMENT:${total}`; 

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <NavbarDashboard />

      <div className="container mx-auto px-6 md:px-12 pt-32">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                <ArrowLeft className="text-navy-900" />
            </button>
            <h1 className="text-3xl font-serif font-bold text-navy-900 uppercase">Finalize Order</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order Type</p>
                    <h3 className="font-bold text-navy-900 text-lg flex items-center gap-2 mt-1">
                        {sessionData.type === 'dine_in' ? <><MapPin size={18} /> Dine In</> : <><Wallet size={18}/> Take Away</>}
                    </h3>
                </div>
                {sessionData.seat_id && (
                    <div className="text-right">
                         <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Table</p>
                         <p className="font-bold text-gold-500 text-2xl">{sessionData.seat_id}</p>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-gold-500" /> Order Items
              </h3>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.internalId} className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg relative overflow-hidden shrink-0 border border-gray-100">
                          <Image src={getImageUrl(item.image)} alt={item.name} fill className="object-contain p-1" unoptimized/>
                      </div>
                      <div>
                        <p className="font-bold text-navy-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity}x @ Rp {item.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="font-medium text-navy-900 text-sm">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-96 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300">
                <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <Wallet size={20} className="text-gold-500" /> Payment Method
                </h3>
                <div className="space-y-3">
                    <button 
                        onClick={() => handleSelectPayment('qris')} 
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300
                        ${paymentMethod === 'qris' ? 'border-navy-900 bg-navy-900 text-white shadow-lg' : 'border-gray-200 hover:border-gray-300 text-navy-900 bg-white'}`}
                    >
                        <div className="flex items-center gap-3">
                            <QrCode size={20} className={paymentMethod === 'qris' ? 'text-gold-500' : 'text-navy-900'}/>
                            <span className="font-bold text-sm">QRIS</span>
                        </div>
                    </button>

                    <div ref={qrSectionRef} className={`overflow-hidden transition-all duration-500 ${paymentMethod === 'qris' ? 'max-h-[400px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                         <div className="bg-white border-2 border-dashed border-navy-900 p-6 rounded-xl flex flex-col items-center justify-center">
                            <QRCodeSVG value={qrisValue} size={160} level={"H"} />
                            <div className="mt-3 text-center">
                                <p className="font-bold text-lg text-navy-900">Rp {total.toLocaleString('id-ID')}</p>
                                <p className="text-[10px] text-gray-400">Scan to Pay</p>
                            </div>
                         </div>
                    </div>

                    <button 
                        onClick={() => handleSelectPayment('cash')} 
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300
                        ${paymentMethod === 'cash' ? 'border-navy-900 bg-navy-900 text-white shadow-lg' : 'border-gray-200 hover:border-gray-300 text-navy-900 bg-white'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Banknote size={20} className={paymentMethod === 'cash' ? 'text-gold-500' : 'text-navy-900'}/>
                            <span className="font-bold text-sm">Cash / Kasir</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-navy-900 flex items-center gap-2 text-sm mb-2">
                    <Ticket size={16} className="text-gold-500" /> Promo Code
                </h3>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="KODE PROMO" 
                        value={promoCodeInput} 
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())} 
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none uppercase font-bold"
                    />
                    <button onClick={handleApplyPromo} disabled={isCheckingPromo} className="bg-navy-900 text-white px-4 py-2 rounded-lg text-xs font-bold">
                        {isCheckingPromo ? <Loader2 size={14} className="animate-spin" /> : "APPLY"}
                    </button>
                </div>
                {promoMessage && <p className={`text-[10px] mt-1 font-bold ${promoMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{promoMessage.text}</p>}
            </div>

            <div className="bg-navy-900 p-8 rounded-2xl shadow-xl text-white">
              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold">Total Pay</span>
                <span className="text-3xl font-bold text-gold-500">Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <button onClick={handlePayment} disabled={isProcessing} className="w-full py-4 bg-gold-500 text-navy-900 font-bold rounded-xl shadow-lg hover:bg-white transition-all flex items-center justify-center gap-2">
                {isProcessing ? <Loader2 className="animate-spin" /> : <>Place Order <ArrowRight size={18}/></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}