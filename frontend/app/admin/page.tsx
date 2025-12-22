"use client";
import React from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  // Data Dummy (Nanti kita fetch dari API Laravel)
  const stats = [
    { title: "Total Revenue", value: "Rp 15.200.000", icon: DollarSign, color: "bg-green-500" },
    { title: "Total Orders", value: "1,240", icon: ShoppingBag, color: "bg-blue-500" },
    { title: "New Customers", value: "85", icon: Users, color: "bg-purple-500" },
    { title: "Sales Growth", value: "+12.5%", icon: TrendingUp, color: "bg-orange-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-6">Dashboard Overview</h1>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${stat.color}`}>
                    <stat.icon size={24} />
                </div>
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
                    <h3 className="text-xl font-black text-navy-900">{stat.value}</h3>
                </div>
            </div>
        ))}
      </div>

      {/* CONTENT AREA CONTOH */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center text-gray-400 flex-col gap-2">
          <p>Chart / Grafik Penjualan akan tampil disini.</p>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Coming Soon</span>
      </div>
    </div>
  );
}