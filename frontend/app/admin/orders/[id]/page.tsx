"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Loader2, Utensils, ShoppingBag, Save } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State Form Update
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  // 1. FETCH DETAIL
  useEffect(() => {
    if(!id) return;
    
    const fetchOrder = async () => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/admin/login'); return; }

        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/orders/${id}`, {
                headers: { 
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}` // ✅ TAMBAH TOKEN
                }
            });
            const json = await res.json();
            if (json.success) {
                setOrder(json.data);
                setStatus(json.data.status);
                setPaymentStatus(json.data.payment_status);
            } else {
                if(res.status === 401) router.push('/admin/login');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    fetchOrder();
  }, [id, router]);

  // 2. UPDATE STATUS
  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setUpdating(true);
    try {
        const res = await fetch(`${BACKEND_URL}/api/admin/orders/${id}/status`, {
            method: "PUT", 
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // ✅ TAMBAH TOKEN
            },
            body: JSON.stringify({ status, payment_status: paymentStatus })
        });

        const json = await res.json();
        if (json.success) {
            alert("Status berhasil diperbarui!");
            setOrder(json.data); // Update tampilan local
        } else {
            alert("Gagal update: " + json.message);
        }
    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan.");
    } finally {
        setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderOption = (optionData: any) => {
    if (!optionData) return null;
    if (typeof optionData === 'string') return optionData;
    return Object.entries(optionData)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-navy-900" size={40}/></div>;
  if (!order) return <div className="p-10 text-center text-red-500 font-bold">Order not found.</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-4">
            <Link href="/admin/orders" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100"><ArrowLeft size={20}/></Link>
            <h1 className="text-2xl font-bold text-navy-900">Order #{order.order_number}</h1>
        </div>
        <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 shadow-lg">
            <Printer size={18} /> Print Struk
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KIRI: ITEM LIST */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 border-b pb-2">Order Items</h3>
                <div className="space-y-4">
                    {(order.items || []).map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                            <div>
                                <p className="font-bold text-navy-900 text-lg">{item.product_name}</p>
                                <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-1">
                                    {item.variants && (
                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">
                                            {renderOption(item.variants)}
                                        </span>
                                    )}
                                    {item.modifiers && (
                                        <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded text-xs border border-gray-200">
                                            {renderOption(item.modifiers)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-500 text-sm">{item.quantity} x Rp {parseInt(item.unit_price).toLocaleString()}</p>
                                <p className="font-bold text-navy-900">Rp {parseInt(item.subtotal).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-600">Total Amount</span>
                    <span className="text-3xl font-black text-navy-900">Rp {parseInt(order.total_price).toLocaleString()}</span>
                </div>
            </div>
        </div>

        {/* KANAN: INFO & STATUS */}
        <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
                    {order.order_type === 'dine_in' ? <Utensils size={100}/> : <ShoppingBag size={100}/>}
                </div>

                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Info</h3>
                
                {order.order_type === 'dine_in' ? (
                    <div className="mb-6">
                        <span className="bg-purple-600 text-white px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-2 mb-3">
                            <Utensils size={12}/> DINE IN
                        </span>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-center">
                            <p className="text-purple-800 text-xs uppercase font-bold mb-1">Table Number</p>
                            <p className="text-4xl font-black text-purple-900">{order.table_number}</p>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6">
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-2 mb-3">
                            <ShoppingBag size={12}/> TAKE AWAY
                        </span>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold">Customer Name</p>
                    <p className="text-lg font-bold text-navy-900">{order.customer_name || 'Guest'}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-yellow-500">
                <h3 className="text-lg font-bold mb-4">Update Status</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Order Status</label>
                        <select 
                            className="w-full border rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-yellow-400 outline-none"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="pending">⏳ Pending</option>
                            <option value="confirmed">✅ Confirmed</option>
                            <option value="processing">🍳 Processing</option>
                            <option value="ready">🔔 Ready</option>
                            <option value="completed">🎉 Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Payment Status</label>
                        <select 
                            className="w-full border rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-yellow-400 outline-none"
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                        >
                            <option value="unpaid">❌ Unpaid</option>
                            <option value="paid">💰 Paid</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleUpdate}
                        disabled={updating}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl shadow-md transition active:scale-95 flex justify-center items-center gap-2 disabled:bg-gray-300"
                    >
                        {updating ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Update Order</>}
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}