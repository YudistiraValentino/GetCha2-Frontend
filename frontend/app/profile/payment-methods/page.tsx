"use client";
import React, { useState, useEffect } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import { CreditCard, Plus, Trash2, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PaymentMethodsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");

  // Load Saved Cards
  useEffect(() => {
    const saved = localStorage.getItem("saved_cards");
    if(saved) setCards(JSON.parse(saved));
  }, []);

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    const newCard = {
        id: Date.now(),
        holder: cardHolder,
        number: cardNumber, // Di real app, jangan simpan full number!
        expiry: expiry,
        type: parseInt(cardNumber) % 2 === 0 ? "Visa" : "Mastercard" // Random logic
    };
    
    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    localStorage.setItem("saved_cards", JSON.stringify(updatedCards));
    
    // Reset & Close
    setCardHolder(""); setCardNumber(""); setExpiry(""); setShowForm(false);
  };

  const removeCard = (id: number) => {
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    localStorage.setItem("saved_cards", JSON.stringify(updated));
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <NavbarDashboard />
      <div className="container mx-auto px-4 md:px-12 pt-32 max-w-lg">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <Link href="/profile" className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-navy-900"><ArrowLeft size={20}/></Link>
            <h1 className="text-2xl font-serif font-bold text-navy-900">Payment Methods</h1>
        </div>

        {/* List Kartu */}
        <div className="space-y-4 mb-8">
            {cards.map((card) => (
                <div key={card.id} className="relative bg-gradient-to-r from-navy-900 to-navy-800 text-white p-6 rounded-2xl shadow-lg overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                    
                    <div className="flex justify-between items-start mb-8">
                        <CreditCard className="text-gold-500" size={32} />
                        <span className="font-mono text-lg italic opacity-50">{card.type}</span>
                    </div>
                    
                    <p className="font-mono text-xl tracking-widest mb-4">
                        •••• •••• •••• {card.number.slice(-4)}
                    </p>
                    
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Card Holder</p>
                            <p className="font-bold text-sm uppercase">{card.holder}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Expires</p>
                            <p className="font-bold text-sm">{card.expiry}</p>
                        </div>
                    </div>

                    {/* Delete Button */}
                    <button onClick={() => removeCard(card.id)} className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}

            {cards.length === 0 && !showForm && (
                <div className="text-center py-10 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
                    <CreditCard className="mx-auto text-gray-300 mb-2" size={40}/>
                    <p className="text-gray-400 text-sm">No cards saved yet.</p>
                </div>
            )}
        </div>

        {/* Add Card Form */}
        {showForm ? (
            <form onSubmit={handleSaveCard} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4">
                <h3 className="font-bold text-navy-900 mb-4">Add New Card</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Card Number</label>
                        <input required type="text" maxLength={16} placeholder="0000 0000 0000 0000" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm focus:border-navy-900 outline-none" 
                            value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g,''))} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Card Holder Name</label>
                        <input required type="text" placeholder="YOUR NAME" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-bold text-sm uppercase focus:border-navy-900 outline-none" 
                            value={cardHolder} onChange={e => setCardHolder(e.target.value)} />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Expiry (MM/YY)</label>
                            <input required type="text" maxLength={5} placeholder="MM/YY" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm focus:border-navy-900 outline-none" 
                                value={expiry} onChange={e => setExpiry(e.target.value)} />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">CVV</label>
                            <input required type="password" maxLength={3} placeholder="123" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm focus:border-navy-900 outline-none" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="flex-1 py-3 rounded-xl bg-navy-900 text-white font-bold text-sm hover:bg-gold-500 hover:text-navy-900 transition-colors">Save Card</button>
                </div>
            </form>
        ) : (
            <button onClick={() => setShowForm(true)} className="w-full py-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 font-bold flex items-center justify-center gap-2 hover:border-navy-900 hover:text-navy-900 hover:bg-white transition-all">
                <Plus size={20} /> Add New Card
            </button>
        )}

        <div className="mt-8 flex items-center gap-2 justify-center text-green-600 bg-green-50 p-3 rounded-lg">
            <ShieldCheck size={16} />
            <p className="text-xs font-bold">Payments are simulated securely (Local Mode)</p>
        </div>

      </div>
    </main>
  );
}