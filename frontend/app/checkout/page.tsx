"use client";
import React, { useState } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import { useCart } from "@/app/context/CartContext";
import { MapPin, Clock, Ticket, CheckCircle, Wallet, Banknote, QrCode, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { promos } from '@/app/data/promoData'; // Import Data Promo

export default function CheckoutPage() {
  const { cartItems, bookingInfo, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const router = useRouter();

  // --- STATE PROMO ---
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState("");

  // Hitung Subtotal
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11;
  const serviceFee = 2000;
  
  // --- LOGIKA HITUNG DISKON ---
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'fixed') {
        discountAmount = appliedPromo.value;
    } else {
        discountAmount = subtotal * appliedPromo.value;
        // Opsional: Cap diskon persen (misal maks 20rb)
        if (discountAmount > 20000) discountAmount = 20000;
    }
  }

  // Pastikan diskon tidak minus
  const total = Math.max(0, subtotal + tax + serviceFee - discountAmount);

  // --- FUNGSI APPLY PROMO ---
  const handleApplyPromo = () => {
    setPromoError("");
    const code = promoCodeInput.trim().toUpperCase();
    
    // 1. Cari kode di database
    const foundPromo = promos.find(p => p.code === code);

    if (!foundPromo) {
        setPromoError("Kode voucher tidak valid.");
        setAppliedPromo(null);
        return;
    }

    // 2. Cek Minimal Order
    if (subtotal < foundPromo.minOrder) {
        setPromoError(`Min. belanja Rp ${foundPromo.minOrder.toLocaleString('id-ID')} untuk pakai kode ini.`);
        setAppliedPromo(null);
        return;
    }

    // 3. Sukses
    setAppliedPromo(foundPromo);
    setPromoCodeInput(""); // Clear input
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
  };

  // --- FUNGSI BAYAR ---
  const handlePayment = () => {
    setIsProcessing(true);
    
    const newOrder = {
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      queueNumber: `A-${Math.floor(1 + Math.random() * 50)}`,
      items: cartItems,
      total: total,
      subtotal: subtotal,
      discount: discountAmount, // Simpan info diskon
      promoCode: appliedPromo ? appliedPromo.code : null,
      paymentMethod: paymentMethod,
      date: new Date().toLocaleString(),
      booking: bookingInfo,
      status: 'pending',
      timestamp: Date.now()
    };

    localStorage.setItem('lastOrder', JSON.stringify(newOrder));
    const existingOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    localStorage.setItem('allOrders', JSON.stringify([newOrder, ...existingOrders]));

    setTimeout(() => {
      clearCart();
      router.push('/order-status');
    }, 2000);
  };

  if (cartItems.length === 0 && !bookingInfo.seatId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy-900">No active order</h2>
          <Link href="/dashboard" className="text-gold-500 hover:underline">Back to Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <NavbarDashboard />

      <div className="container mx-auto px-6 md:px-12 pt-32">
        <h1 className="text-3xl font-serif font-bold text-navy-900 mb-8 uppercase">
          Finalize Order
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* KIRI: DETAIL ORDER (Sama seperti sebelumnya) */}
          <div className="flex-1 space-y-6">
            {/* ... (Bagian Info Lokasi & List Barang biarkan sama) ... */}
            {/* List Barang */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-gold-500" /> Order Items
              </h3>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.internalId} className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-navy-900 shrink-0">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-bold text-navy-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">
                            {item.selectedVariant} 
                            {item.selectedModifiers && Object.values(item.selectedModifiers).length > 0 && ` • ${Object.values(item.selectedModifiers).join(', ')}`}
                        </p>
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

          {/* KANAN: PAYMENT & PROMO (YANG KITA UPDATE) */}
          <div className="w-full lg:w-96 space-y-6">
            
            {/* Payment Method (Biarkan sama) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <Wallet size={20} className="text-gold-500" /> Payment Method
                </h3>
                <div className="space-y-3">
                    <button onClick={() => setPaymentMethod('qris')} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${paymentMethod === 'qris' ? 'border-navy-900 bg-navy-50 ring-1 ring-navy-900' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-3"><QrCode size={20} className="text-navy-900"/><span className="font-bold text-sm text-navy-900">QRIS</span></div>
                        {paymentMethod === 'qris' && <CheckCircle size={16} className="text-navy-900"/>}
                    </button>
                    <button onClick={() => setPaymentMethod('cash')} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${paymentMethod === 'cash' ? 'border-navy-900 bg-navy-50 ring-1 ring-navy-900' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-3"><Banknote size={20} className="text-navy-900"/><span className="font-bold text-sm text-navy-900">Cash</span></div>
                        {paymentMethod === 'cash' && <CheckCircle size={16} className="text-navy-900"/>}
                    </button>
                </div>
            </div>

            {/* --- PROMO CODE SECTION (LOGIC BARU) --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-navy-900 flex items-center gap-2 text-sm">
                        <Ticket size={16} className="text-gold-500" /> Promo Code
                    </h3>
                    {/* Link ke halaman Deals */}
                    <Link href="/deals" target="_blank" className="text-[10px] text-blue-500 hover:underline font-bold">
                        View Vouchers
                    </Link>
                </div>

                {!appliedPromo ? (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="ex: HEMAT10" 
                                value={promoCodeInput}
                                onChange={(e) => setPromoCodeInput(e.target.value)}
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-navy-900 uppercase"
                            />
                            <button 
                                onClick={handleApplyPromo}
                                disabled={!promoCodeInput}
                                className="bg-navy-900 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-gold-500 hover:text-navy-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                APPLY
                            </button>
                        </div>
                        {promoError && <p className="text-xs text-red-500 font-medium">{promoError}</p>}
                    </div>
                ) : (
                    // Tampilan jika promo berhasil dipakai
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center animate-in fade-in zoom-in duration-300">
                        <div>
                            <p className="text-xs font-bold text-green-700 flex items-center gap-1">
                                <Ticket size={12}/> {appliedPromo.code} Applied!
                            </p>
                            <p className="text-[10px] text-green-600">{appliedPromo.title}</p>
                        </div>
                        <button onClick={removePromo} className="text-gray-400 hover:text-red-500 transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Total Payment dengan Diskon */}
            <div className="bg-navy-900 p-8 rounded-2xl shadow-xl text-white">
              <div className="space-y-3 mb-6 border-b border-white/10 pb-6 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax (11%)</span>
                  <span>Rp {tax.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Service Fee</span>
                  <span>Rp {serviceFee.toLocaleString('id-ID')}</span>
                </div>
                
                {/* Baris Diskon (Hanya muncul jika ada) */}
                {appliedPromo && (
                    <div className="flex justify-between text-green-400 font-bold">
                        <span>Discount ({appliedPromo.code})</span>
                        <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
                    </div>
                )}
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold">Total Pay</span>
                <span className="text-3xl font-bold text-gold-500">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-4 bg-gold-500 text-navy-900 font-bold rounded-xl shadow-lg hover:bg-white transition-all disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? "Processing..." : <>Place Order <ArrowRight size={18}/></>}
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}