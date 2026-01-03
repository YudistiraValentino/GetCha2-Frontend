"use client"; 
import { useState, useEffect, useRef, ReactNode } from "react"; // Tambahkan ReactNode disini
import Navbar from "./components/layout/Navbar";
import HeroImage from "./components/home/HeroImage"; 
import Typewriter from "./components/home/Typewriter"; 
import Link from "next/link"; 

// --- KOMPONEN BANTUAN UNTUK ANIMASI SCROLL (FIXED FOR TYPESCRIPT) ---
// Kita tambahkan tipe data untuk props-nya agar tidak error
const RevealOnScroll = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null); // Tambahkan tipe HTMLDivElement untuk ref

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); 
        }
      },
      { threshold: 0.1 } 
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 transform ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-20"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION (ANIMATED) --- */}
      <RevealOnScroll>
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 md:px-24 pt-32 gap-12 pb-20">
          
          {/* BAGIAN KIRI */}
          <div className="flex-1 space-y-6 max-w-lg z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold text-navy-900 leading-tight">
              No More Waiting, <br />
              Just <br className="md:hidden" />
              
              <span className="text-gold-500 underline decoration-4 underline-offset-8">
                <Typewriter 
                  words={["Coffee", "Dessert", "Pastry", "Tea"]} 
                  typeSpeed={100}
                  delay={2000}
                />
              </span>
            </h1>
            
            <p className="text-navy-800 text-lg font-medium leading-relaxed opacity-80">
              Don't let a full house ruin your plans. Book your favorite seat in
              advance, arrive on your own time, and enjoy your order without the
              hassle.
            </p>

            <div className="pt-6">
              <Link href="/login">
                <button className="px-10 py-4 bg-gold-500 text-navy-900 text-xl font-bold rounded-full shadow-lg hover:bg-gold-600 hover:scale-105 transition-all duration-300 cursor-pointer">
                  Order Now
                </button>
              </Link>
            </div>
          </div>

          {/* BAGIAN KANAN */}
          <div className="flex-1 w-full max-w-lg md:max-w-xl flex justify-center">
              <HeroImage />
          </div>
        </div>
      </RevealOnScroll>


      {/* --- SECTION 1: HOW IT WORKS (ANIMATED) --- */}
      <section className="py-24 bg-[#0B1120] px-6 md:px-24 relative">
        <RevealOnScroll>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How GetCha Works</h2>
            <p className="text-gray-400 text-lg">Seamless experience from screen to seat.</p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* CARD 1 */}
          <RevealOnScroll delay={100}>
            <div className="group bg-white p-8 rounded-3xl h-full transition-all duration-500 ease-in-out hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(255,215,0,0.15)] border-2 border-transparent hover:border-gold-500 cursor-default">
              <div className="w-20 h-20 bg-navy-50 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:bg-gold-500 group-hover:text-white group-hover:rotate-12 transition-all duration-500">
                📍
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-3 group-hover:text-gold-600 transition-colors">Pick Your Spot</h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-900">
                View the realtime floor plan and reserve the perfect table for your needs via our interactive map.
              </p>
            </div>
          </RevealOnScroll>

          {/* CARD 2 */}
          <RevealOnScroll delay={300}>
            <div className="group bg-white p-8 rounded-3xl h-full transition-all duration-500 ease-in-out hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(255,215,0,0.15)] border-2 border-transparent hover:border-gold-500 cursor-default">
              <div className="w-20 h-20 bg-navy-50 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:bg-gold-500 group-hover:text-white group-hover:-rotate-12 transition-all duration-500">
                ☕
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-3 group-hover:text-gold-600 transition-colors">Pre-Order</h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-900">
                Browse our menu and order ahead. We'll start preparing just before you arrive so it's fresh.
              </p>
            </div>
          </RevealOnScroll>

          {/* CARD 3 */}
          <RevealOnScroll delay={500}>
            <div className="group bg-white p-8 rounded-3xl h-full transition-all duration-500 ease-in-out hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(255,215,0,0.15)] border-2 border-transparent hover:border-gold-500 cursor-default">
              <div className="w-20 h-20 bg-navy-50 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:bg-gold-500 group-hover:text-white group-hover:scale-110 transition-all duration-500">
                ✨
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-3 group-hover:text-gold-600 transition-colors">Skip The Line</h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-900">
                Walk in like a VIP. Your seat is taken, and your coffee is warm waiting for you.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>


      {/* --- SECTION 2: MENU SNEAK PEEK (ANIMATED) --- */}
      <section className="py-24 bg-white px-6 md:px-24">
        <RevealOnScroll>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-navy-900">Trending Now</h2>
              <p className="text-gold-500 text-lg font-semibold mt-2">People are loving these</p>
            </div>
            <Link href="/login" className="text-navy-900 font-bold underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-gold-600 hover:decoration-4 transition-all mt-4 md:mt-0">
              View Full Menu &rarr;
            </Link>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((item, index) => (
            <RevealOnScroll key={item} delay={index * 100}>
              <div className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square mb-5 shadow-sm group-hover:shadow-xl transition-all duration-500">
                   {/* Placeholder Image */}
                   <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-bold text-xl group-hover:scale-110 transition-transform duration-700">
                      Product
                   </div>
                   {/* Overlay saat Hover */}
                   <div className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="bg-gold-500 text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        Order Now
                      </span>
                   </div>
                </div>
                <h3 className="text-xl font-bold text-navy-900 group-hover:text-gold-600 transition-colors">Caramel Macchiato</h3>
                <p className="text-gray-500 text-sm mt-1">Rich espresso with vanilla syrup</p>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-navy-900 font-bold text-lg">$5.50</p>
                  <span className="text-gold-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0">
                    Add +
                  </span>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>


      {/* --- FOOTER (STATIC / NO ANIMATION) --- */}
      <footer className="bg-[#0B1120] text-white py-16 px-6 md:px-24 border-t-4 border-gold-500">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div className="max-w-sm">
              <h4 className="text-3xl font-bold mb-6 tracking-tight">GetCha.</h4>
              <p className="text-gray-400 leading-relaxed">
                The smartest way to enjoy your coffee break. Reserve your favorite spot, order ahead, and relax without the anxiety of a full house.
              </p>
            </div>
            <div className="flex gap-16 text-sm text-gray-300">
              <div className="flex flex-col gap-4">
                  <span className="font-bold text-white text-lg mb-2">Explore</span>
                  <Link href="/menu" className="hover:text-gold-500 hover:translate-x-1 transition-transform">Menu</Link>
                  <Link href="/locations" className="hover:text-gold-500 hover:translate-x-1 transition-transform">Locations</Link>
                  <Link href="/about" className="hover:text-gold-500 hover:translate-x-1 transition-transform">About Us</Link>
              </div>
              <div className="flex flex-col gap-4">
                  <span className="font-bold text-white text-lg mb-2">Support</span>
                  <Link href="/faq" className="hover:text-gold-500 hover:translate-x-1 transition-transform">FAQ</Link>
                  <Link href="/contact" className="hover:text-gold-500 hover:translate-x-1 transition-transform">Contact</Link>
                  <Link href="/terms" className="hover:text-gold-500 hover:translate-x-1 transition-transform">Terms</Link>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs flex flex-col md:flex-row justify-between items-center">
            <p>© 2026 GetCha Coffee. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Designed for Coffee Lovers</p>
          </div>
      </footer>

    </main>
  );
}