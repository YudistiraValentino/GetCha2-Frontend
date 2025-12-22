"use client"; // Wajib untuk interaksi filter
import React, { useState } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import ProductCard from "@/app/components/common/ProductCard";
import FilterSidebar from "@/app/components/menu/FilterSidebar";
import { products } from "@/app/data/menuData"; 

export default function MenuPage() { // Pastikan export default ada di sini
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Logika Filter Sederhana
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <NavbarDashboard />

      <div className="container mx-auto px-6 md:px-12 pt-32">
        
        {/* Header Page */}
        <div className="mb-10">
          <h1 className="text-4xl font-serif font-bold text-navy-900 uppercase">
            Our Menu
          </h1>
          <p className="text-gray-500 mt-2">
            Explore our premium selection of coffee and pastries.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Filter */}
          <FilterSidebar 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
          />

          {/* Grid Produk */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
                <h3 className="text-xl font-bold text-navy-900">No Products Found</h3>
                <p className="text-gray-500">Try selecting "All" category.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}