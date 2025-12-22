"use client";
import React from 'react';

interface FilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const FilterSidebar = ({ selectedCategory, setSelectedCategory }: FilterProps) => {
  const categories = ['All', 'Coffee', 'Non-Coffee', 'Pastry', 'Dessert', 'Manual Brew'];

  return (
    <aside className="w-full lg:w-64 space-y-8 h-fit lg:sticky lg:top-32">
      <div>
        <h3 className="font-bold text-navy-900 mb-4 uppercase tracking-wider text-sm border-b pb-2 border-gray-200">
          Category
        </h3>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category}>
              <button 
                onClick={() => setSelectedCategory(category)} 
                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                  selectedCategory === category 
                    ? 'bg-navy-900 text-white font-bold shadow-md' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-navy-900'
                }`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default FilterSidebar;