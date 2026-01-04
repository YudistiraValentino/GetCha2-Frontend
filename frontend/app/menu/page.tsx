"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Plus, Loader2 } from "lucide-react"; 
import NavbarDashboard from "../components/layout/NavbarDashboard";
import { useTransition } from "../context/TransitionContext"; 

const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

export default function MenuPage() {
  const { triggerTransition } = useTransition(); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/menu`)
      .then(res => res.json())
      .then(json => {
          if (json.success) {
            setProducts(json.data.map((p: any) => ({
                ...p,
                category_name: p.category ? p.category.name : (p.category_name || "Uncategorized")
            })));
          }
          setLoading(false);
      });
  }, []);

  const getImageUrl = (path: string) => {
    if (!path) return "/images/food.jpg";
    if (path.startsWith("http")) return path;
    const fileName = path.split('/').pop();
    return `/images/${fileName}`;
  };

  const filtered = products.filter((p: any) => {
    return (selectedCategory === "All" || p.category_name === selectedCategory) &&
           (p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const categories = ["All", ...Array.from(new Set(products.map((p: any) => p.category_name)))];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <NavbarDashboard />
      <div className="pt-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 mb-10">
            <input type="text" placeholder="Search menu..." className="p-3 rounded-xl border w-full md:w-80" onChange={e => setSearchQuery(e.target.value)} />
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-full whitespace-nowrap ${selectedCategory === cat ? "bg-navy-900 text-white" : "bg-white border"}`}>{cat}</button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filtered.map((p: any) => (
                <div key={p.id} onClick={() => triggerTransition(`/product/${p.id}`)} className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-md cursor-pointer">
                    <div className="relative h-40 mb-4">
                        <Image src={getImageUrl(p.image)} alt={p.name} fill className="object-contain" unoptimized />
                    </div>
                    <h3 className="font-bold">{p.name}</h3>
                    <p className="text-navy-900 font-extrabold mt-2">Rp {parseFloat(p.price).toLocaleString()}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
