"use client";
import React, { useEffect, useState } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import Link from 'next/link';
import { ShoppingBag, Receipt, RefreshCcw, Clock, Loader2 } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';
import createEcho from '@/app/lib/echo'; // Import Echo buat Realtime

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    variants?: string;
    modifiers?: string[];
    price: number;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_price: string;
    created_at: string;
    order_type: string; // dine_in / take_away
    items: OrderItem[];
}

export default function ActivityPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  
  const { addToCart } = useCart();
  const router = useRouter();

  // 1. FETCH DATA DARI API
  useEffect(() => {
    const fetchOrders = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push('/login'); // Redirect kalau belum login
            return;
        }

        try {
            const res = await fetch('http://127.0.0.1:8000/api/my-orders', {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            });
            const json = await res.json();
            if (json.success) {
                setOrders(json.data);
            }
        } catch (error) {
            console.error("Gagal load history:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchOrders();
  }, [router]);

  // 2. REALTIME LISTENER (Supaya status berubah tanpa refresh)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.name) {
        const echo = createEcho();
        // Subscribe public channel (sesuai config backend kita sebelumnya)
        echo.channel('public-orders')
            .listen('.order.updated', (e: any) => {
                if (e.order.customer_name === user.name) {
                    setOrders((prev) => {
                        const exists = prev.find(o => o.id === e.order.id);
                        if (exists) {
                            // Update status order yang ada
                            return prev.map(o => o.id === e.order.id ? { ...o, status: e.order.status } : o);
                        }
                        return prev;
                    });
                }
            });

        return () => { echo.leave('public-orders'); };
    }
  }, []);

  // 3. FILTER LOGIC: Active vs History
  // Active: pending, confirmed, processing, ready
  // History: completed, cancelled
  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const historyOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

  // Fitur Re-order
  const handleReorder = (items: OrderItem[]) => {
    if(confirm("Masukkan item ini ke keranjang lagi?")) {
        items.forEach(item => {
            addToCart({
                id: item.id, // Pastikan ID produk valid
                name: item.product_name,
                price: item.price, 
                quantity: item.quantity,
                image: "", // API order history mungkin ga kirim gambar, kasih default/kosong
                category: "Reorder",
                selectedVariant: item.variants || undefined,
            });
        });
        router.push('/cart'); // Buka cart (atau dashboard yg ada cartnya)
    }
  };

  // Helper Warna Status
  const getStatusStyle = (status: string) => {
    switch(status) {
        case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'processing': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'ready': return 'bg-green-100 text-green-700 border-green-200 animate-pulse';
        case 'completed': return 'bg-gray-100 text-gray-600 border-gray-200';
        case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-50 text-gray-400 border-gray-200';
    }
  };

  if (loading) return <div className="min-h-screen bg-navy-900 flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={40}/></div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-24 font-sans">
      <NavbarDashboard />

      <div className="container mx-auto px-4 md:px-12 pt-32 max-w-3xl">
        <h1 className="text-3xl font-serif font-bold text-navy-900 mb-8">My Activity</h1>

        {/* TAB SWITCHER */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl overflow-hidden">
            <button 
                onClick={() => setActiveTab('active')}
                className={`flex-1 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'active' ? 'text-navy-900 border-navy-900 bg-gray-50' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}
            >
                Ongoing ({activeOrders.length})
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'history' ? 'text-navy-900 border-navy-900 bg-gray-50' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}
            >
                History ({historyOrders.length})
            </button>
        </div>

        {/* CONTENT AREA */}
        <div className="space-y-4">
            
            {/* STATE KOSONG */}
            {(activeTab === 'active' ? activeOrders : historyOrders).length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Receipt size={48} className="mx-auto text-gray-200 mb-4"/>
                    <p className="text-gray-500 font-bold">No {activeTab} orders found</p>
                    <p className="text-sm text-gray-400 mb-4">Riwayat pesananmu kosong.</p>
                    <Link href="/menu" className="inline-block px-6 py-2 bg-navy-900 text-white rounded-full font-bold text-sm hover:bg-gold-500 hover:text-navy-900 transition-colors">
                        Browse Menu
                    </Link>
                </div>
            )}

            {/* LIST ORDER */}
            {(activeTab === 'active' ? activeOrders : historyOrders).map((order) => (
                <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    
                    {/* Header Card */}
                    <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${order.order_type === 'dine_in' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                                <ShoppingBag size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-navy-900 text-sm">
                                    {order.order_type === 'dine_in' ? 'Dine In' : 'Take Away'} 
                                    <span className="text-gray-400 font-normal"> • #{order.order_number}</span>
                                </h3>
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                    <Clock size={10} /> {new Date(order.created_at).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold border ${getStatusStyle(order.status)}`}>
                            {order.status}
                        </span>
                    </div>

                    {/* Items Preview */}
                    <div className="space-y-2 mb-4">
                        {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm items-start">
                                <span className="text-gray-600">
                                    <span className="font-bold text-navy-900">{item.quantity}x</span> {item.product_name}
                                </span>
                                {item.variants && (
                                    <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                        {item.variants}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer / Action */}
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-50">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Total Payment</p>
                            <p className="font-bold text-navy-900">Rp {parseInt(order.total_price).toLocaleString('id-ID')}</p>
                        </div>

                        {activeTab === 'history' ? (
                            <button 
                                onClick={() => handleReorder(order.items)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-navy-900 text-navy-900 rounded-lg text-xs font-bold hover:bg-navy-900 hover:text-white transition-colors"
                            >
                                <RefreshCcw size={14}/> Order Again
                            </button>
                        ) : (
                            <div className="text-right">
                                {/* Kalau butuh queue number, pastikan backend kirim */}
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Status</p>
                                <p className="text-sm font-bold text-gold-500 uppercase">{order.status}</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}

        </div>
      </div>
    </main>
  );
}