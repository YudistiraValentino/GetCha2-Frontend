"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Eye, Search, Loader2, RefreshCw } from "lucide-react";

// Ganti baris 7 jadi begini:
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://getcha2-backend-production.up.railway.app/api/admin/orders`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      }
    } catch (error) {
      console.error("Gagal fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Opsional: Pasang interval polling setiap 30 detik biar data selalu fresh
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter Search (Order ID atau Nama Customer)
  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles: any = {
        pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        confirmed: "bg-indigo-100 text-indigo-700 border-indigo-200",
        processing: "bg-blue-100 text-blue-700 border-blue-200",
        ready: "bg-teal-100 text-teal-700 border-teal-200",
        completed: "bg-green-100 text-green-700 border-green-200",
        cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-navy-900">Order Management</h1>
            <p className="text-gray-500 text-sm">Monitor and manage incoming orders.</p>
        </div>
        <button onClick={fetchOrders} className="bg-white text-navy-900 px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2 hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search Order No or Customer..." 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-navy-900 transition"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-500">
                    <tr>
                        <th className="px-6 py-4">Order No</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Total</th>
                        <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading && orders.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-navy-900"/></td></tr>
                    ) : filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-bold text-blue-600">{order.order_number}</td>
                            <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                                <p className="font-bold text-navy-900">{order.customer_name}</p>
                                {order.table_number && <p className="text-xs text-gray-400">Table {order.table_number}</p>}
                            </td>
                            <td className="px-6 py-4">
                                {order.order_type === 'dine_in' ? (
                                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold border border-purple-100">Dine In</span>
                                ) : (
                                    <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-bold border border-orange-100">Take Away</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(order.status)} uppercase`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-navy-900">
                                Rp {parseInt(order.total_price).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition">
                                    <Eye size={16} />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {!loading && filteredOrders.length === 0 && (
                <div className="p-10 text-center text-gray-400">No orders found.</div>
            )}
        </div>
      </div>
    </div>
  );
}