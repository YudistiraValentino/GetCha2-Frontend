"use client";

import React, { useState, useEffect } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import { useCart } from "@/app/context/CartContext";
import { CheckCircle, Wallet, Banknote, QrCode, Ticket, ArrowRight, ArrowLeft, Loader2, MapPin, X, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from 'qrcode.react';

// ✅ URL Backend
const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

export default function PaymentPage() {
  const { cartItems, clearCart } = useCart();
  const router = useRouter();
  
  // State UI
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'cash'>('cash');
  const [sessionData, setSessionData] = useState<any>(null);

  // State Modals
  const [showQrisModal, setShowQrisModal] = useState(false); // 👈 Modal Tampilkan QR
  const [showSuccessModal, setShowSuccessModal] = useState(false); // 👈 Modal Sukses Order
  const [orderNumber, setOrderNumber] = useState("");
  
  // State Logic
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  // State Promo
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // 1. CEK SESSION
  useEffect(() => {
    if (isPaymentSuccess) return;
    const data = localStorage.getItem("checkout_session");
    if (!data || cartItems.length === 0) {
        router.push("/menu");
    } else {
        setSessionData(JSON.parse(data));
    }
  }, [cartItems, router, isPaymentSuccess]);

  // Perhitungan Harga
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11; 
  const serviceFee = 2000;
  const total = Math.max(0, subtotal + tax + serviceFee - discountAmount);

  // String QRIS Statis (Contoh)
  const qrisValue = `00020101021126570014ID.CO.QRIS.WWW01189360052300000000000215ID1020200000000030360443015802ID5907GETCHA26006MEDAN6304`; 

  // --- LOGIC PROMO ---
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

  // --- TOMBOL UTAMA DITEKAN ---
  const handlePlaceOrderClick = () => {
      if (paymentMethod === 'qris') {
          // Kalau QRIS, Buka Modal QR dulu, jangan langsung checkout
          setShowQrisModal(true);
      } else {
          // Kalau Cash, langsung proses
          processCheckout();
      }
  };

  // --- PROSES API KE BACKEND ---
  const processCheckout = async () => {
    setIsProcessing(true);
    try {
        const token = localStorage.getItem("token");

        const mappedItems = cartItems.map(item => ({
             product_id: item.id,
             product_name: item.name,
             unit_price: item.price,
             subtotal: item.price * item.quantity,
             id: item.id,            
             name: item.name,        
             price: item.price,      
             quantity: item.quantity,
             variants: item.selectedVariant || null,
             modifiers: [] 
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
        
        if (!res.ok) {
            throw new Error(data.message || "Gagal memproses pesanan.");
        }

        // SUKSES
        setIsPaymentSuccess(true); 
        setOrderNumber(data.order_number);
        setShowQrisModal(false); // Tutup QR Modal kalau ada
        setShowSuccessModal(true); // Buka Success Modal

        clearCart(); 
        localStorage.removeItem("checkout_session"); 
        
    } catch (error: any) {
        alert("Terjadi Kesalahan: " + error.message);
        setIsPaymentSuccess(false);
    } finally {
        setIsProcessing(false);
    }
  };

  // Simulasi Bayar QRIS (Karena belum ada payment gateway real)
  const simulateQrisPayment = () => {
      setIsProcessing(true);
      setTimeout(() => {
          processCheckout(); // Panggil fungsi checkout asli
      }, 1500); // Delay pura-pura loading
  };

  const handleCloseSuccessModal = () => {
      setShowSuccessModal(false);
      router.push("/activity"); 
  };

  if (!sessionData) return <div className="min-h-screen bg-navy-900 flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={40} /></div>;

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
          {/* BAGIAN KIRI (ITEMS) */}
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
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-contain p-1" />
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

          {/* BAGIAN KANAN (PAYMENT) */}
          <div className="w-full lg:w-96 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300">
                <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <Wallet size={20} className="text-gold-500" /> Payment Method
                </h3>
                <div className="space-y-3">
                    <button 
                        onClick={() => setPaymentMethod('qris')} 
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300
                        ${paymentMethod === 'qris' ? 'border-navy-900 bg-navy-900 text-white shadow-lg' : 'border-gray-200 hover:border-gray-300 text-navy-900 bg-white'}`}
                    >
                        <div className="flex items-center gap-3">
                            <QrCode size={20} className={paymentMethod === 'qris' ? 'text-gold-500' : 'text-navy-900'}/>
                            <div className="text-left">
                                <p className="font-bold text-sm">QRIS</p>
                                <p className={`text-[10px] ${paymentMethod === 'qris' ? 'text-gray-300' : 'text-gray-400'}`}>Scan using GoPay/OVO/Dana</p>
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={() => setPaymentMethod('cash')} 
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300
                        ${paymentMethod === 'cash' ? 'border-navy-900 bg-navy-900 text-white shadow-lg' : 'border-gray-200 hover:border-gray-300 text-navy-900 bg-white'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Banknote size={20} className={paymentMethod === 'cash' ? 'text-gold-500' : 'text-navy-900'}/>
                             <div className="text-left">
                                <p className="font-bold text-sm">Cash / Kasir</p>
                                <p className={`text-[10px] ${paymentMethod === 'cash' ? 'text-gray-300' : 'text-gray-400'}`}>Pay manually</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-navy-900 flex items-center gap-2 text-sm mb-2">
                    <Ticket size={16} className="text-gold-500" /> Promo Code
                </h3>
                <div className="flex gap-2">
                    <input type="text" placeholder="KODE PROMO" value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none uppercase font-bold" />
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
              <button onClick={handlePlaceOrderClick} disabled={isProcessing} className="w-full py-4 bg-gold-500 text-navy-900 font-bold rounded-xl shadow-lg hover:bg-white transition-all flex items-center justify-center gap-2">
                {isProcessing ? <Loader2 className="animate-spin" /> : <>Place Order <ArrowRight size={18}/></>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: TAMPILKAN QR CODE (Untuk di-scan HP User) --- */}
      {showQrisModal && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-navy-900/90 backdrop-blur-sm animate-in fade-in duration-300"></div>
            
            <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 flex flex-col items-center">
                <button onClick={() => setShowQrisModal(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <X size={20} className="text-gray-500"/>
                </button>

                <h2 className="text-xl font-bold text-navy-900 mb-2">Scan to Pay</h2>
                <p className="text-gray-500 text-sm mb-6 text-center px-4">
                    Open your GoPay, OVO, or Mobile Banking app and scan the QR code below.
                </p>

                <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-navy-900 shadow-sm mb-6">
                    <QRCodeSVG value={qrisValue} size={220} level={"H"} />
                </div>

                <div className="bg-gray-50 px-6 py-3 rounded-xl mb-8">
                     <p className="text-xs text-gray-400 font-bold uppercase text-center">Total Amount</p>
                     <p className="text-2xl font-black text-navy-900">Rp {total.toLocaleString('id-ID')}</p>
                </div>

                {/* SIMULASI TOMBOL SUKSES (Karena tidak ada webhook real) */}
                <button 
                    onClick={simulateQrisPayment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 animate-pulse"
                >
                    {isProcessing ? <Loader2 className="animate-spin"/> : <><RefreshCw size={18}/> Check Payment Status</>}
                </button>
                <p className="text-[10px] text-gray-400 mt-2">*Simulasi: Klik tombol ini setelah scan</p>
            </div>
         </div>
      )}

      {/* --- MODAL 2: ORDER SUKSES (Setelah Bayar) --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-sm animate-in fade-in duration-500"></div>
            
            <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle size={48} className="text-green-500" />
                </div>
                
                <h2 className="text-2xl font-serif font-bold text-navy-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-500 text-sm mb-6">
                    Thank you! Your payment has been confirmed. Please wait while we prepare your coffee.
                </p>

                <div className="bg-gray-50 rounded-xl p-4 w-full mb-6 border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order Number</p>
                    <p className="text-2xl font-black text-navy-900 tracking-wide mt-1">{orderNumber}</p>
                </div>

                <button 
                    onClick={handleCloseSuccessModal}
                    className="w-full py-4 bg-navy-900 text-white font-bold rounded-xl hover:bg-gold-500 hover:text-navy-900 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                    OK, Track Order <ArrowRight size={18} />
                </button>
            </div>
        </div>
      )}

    </main>
  );
}