"use client";
import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, Utensils, ArrowRight, Clock, CheckCircle, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://getcha2-backend-production.up.railway.app";
// Kalau testing localhost ganti jadi: "http://127.0.0.1:8000"

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/admin/login'); return; }

        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/dashboard-stats`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const json = await res.json();
            if (json.success) {
                setStats(json.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    fetchStats();
  }, [router]);

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-navy-900" size={40}/></div>;

  // Data untuk kartu (Cards)
  const cards = [
    { 
        title: "Total Revenue", 
        value: `Rp ${(stats?.revenue || 0).toLocaleString('id-ID')}`, 
        icon: DollarSign, 
        color: "bg-green-500",
        desc: "All time earnings"
    },
    { 
        title: "Active Orders", 
        value: stats?.active_orders || 0, 
        icon: Clock, 
        color: "bg-orange-500",
        desc: "Need preparation" 
    },
    { 
        title: "Total Menus", 
        value: stats?.total_menus || 0, 
        icon: Utensils, 
        color: "bg-blue-500",
        desc: "Products listed"
    },
    { 
        title: "Customers", 
        value: stats?.total_customers || 0, 
        icon: Users, 
        color: "bg-purple-500",
        desc: "Registered users"
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Dashboard Overview</h1>
            <p className="text-gray-500 text-sm">Welcome back, Admin!</p>
          </div>
          <Link href="/admin/orders" className="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gold-500 hover:text-navy-900 transition">
             Manage Orders <ArrowRight size={16} />
          </Link>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${stat.color}`}>
                    <stat.icon size={24} />
                </div>
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
                    <h3 className="text-xl font-black text-navy-900">{stat.value}</h3>
                    <p className="text-[10px] text-gray-400">{stat.desc}</p>
                </div>
            </div>
        ))}
      </div>

      {/* RECENT ORDERS TABLE (Gantikan Chart yang gak guna) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-navy-900 text-lg">Recent Orders</h3>
              <Link href="/admin/orders" className="text-xs text-blue-600 font-bold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-400">
                      <tr>
                          <th className="px-6 py-4">Order No</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {stats?.recent_orders?.length === 0 ? (
                          <tr><td colSpan={4} className="p-6 text-center text-gray-400">No orders yet.</td></tr>
                      ) : (
                          stats?.recent_orders?.map((order: any) => (
                              <tr key={order.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 font-bold text-blue-600">{order.order_number}</td>
                                  <td className="px-6 py-4 font-bold text-navy-900">
                                      {order.customer_name}
                                      <div className="text-[10px] text-gray-400 font-normal">{new Date(order.created_at).toLocaleDateString()}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border
                                          ${order.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : 
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' : 
                                            'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                                          {order.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-right font-bold text-navy-900">
                                      Rp {parseInt(order.total_price).toLocaleString()}
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}