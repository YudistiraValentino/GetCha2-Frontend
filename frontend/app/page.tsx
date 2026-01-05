"use client"; 
import { useState, useEffect, useRef, ReactNode, useMemo } from "react"; 
import Navbar from "./components/layout/Navbar";
import HeroImage from "./components/home/HeroImage"; 
import Typewriter from "./components/home/Typewriter"; 
import Link from "next/link"; 
import Image from "next/image"; // Tambahkan untuk optimasi gambar
import { Loader2 } from "lucide-react"; // Untuk loading state

const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

// --- KOMPONEN BANTUAN UNTUK ANIMASI SCROLL ---
const RevealOnScroll = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.disconnect(); };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH PRODUK ASLI DARI BACKEND
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/menu`);
        const json = await res.json();
        if (json.success) {
          // Kita ambil 4 produk teratas (atau bisa difilter yang is_promo)
          setProducts(json.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Gagal ambil menu trending:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  // 2. LOGIKA GAMBAR SINKRON (Sama dengan Dashboard/Menu)
  const getImageUrl = (p: any) => {
    const id = p.id || 0;
    const name = (p.name || "").toLowerCase();
    const cat = (p.category?.name || p.category_name || "").toLowerCase();

    const coffeeImages = ["https://images.unsplash.com/photo-1509042239860-f550ce710b93","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085","https://images.unsplash.com/photo-1506372023823-741c83b836fe","https://images.unsplash.com/photo-1497933322477-911f3c7a89c8","https://images.unsplash.com/photo-1541167760496-162955ed8a9f","https://images.unsplash.com/photo-1498804103079-a6351b050096","https://images.unsplash.com/photo-1511920170033-f8396924c348","https://images.unsplash.com/photo-1525193612562-0ec53b0e5d7c","https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd","https://images.unsplash.com/photo-1459755486867-b55449bb39ff"];
    const foodImages = ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c","https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445","https://images.unsplash.com/photo-1565299624946-b28f40a0ae38","https://images.unsplash.com/photo-1482049016688-2d3e1b311543","https://images.unsplash.com/photo-1504674900247-0877df9cc836","https://images.unsplash.com/photo-1473093226795-af9932fe5856","https://images.unsplash.com/photo-1555939594-58d7cb561ad1","https://images.unsplash.com/photo-1540189549336-e6e99c3679fe","https://images.unsplash.com/photo-1565958011703-44f9829ba187","https://images.unsplash.com/photo-1512621776951-a57141f2eefd"];
    
    let coll = foodImages;
    if (cat.includes("coffee") || name.includes("kopi")) coll = coffeeImages;

    return `${coll[id % 10]}?w=500&h=500&fit=crop`;
  };

  return (
    <main className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <RevealOnScroll>
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 md:px-24 pt-32 gap-12 pb-20">
          <div className="flex-1 space-y-6 max-w-lg z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold text-navy-900 leading-tight">
              No More Waiting, <br />
              Just <br className="md:hidden" />
              <span className="text-gold-500 underline decoration-4 underline-offset-8">
                <Typewriter words={["Coffee", "Dessert", "Pastry", "Tea"]} typeSpeed={100} delay={2000} />
              </span>
            </h1>
            <p className="text-navy-800 text-lg font-medium leading-relaxed opacity-80">
              Don't let a full house ruin your plans. Book your favorite seat in advance, arrive on your own time, and enjoy your order without the hassle.
            </p>
            <div className="pt-6">
              <Link href="/login">
                <button className="px-10 py-4 bg-gold-500 text-navy-900 text-xl font-bold rounded-full shadow-lg hover:bg-gold-600 hover:scale-105 transition-all duration-300 cursor-pointer">
                  Order Now
                </button>
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg md:max-w-xl flex justify-center">
            <HeroImage />
          </div>
        </div>
      </RevealOnScroll>

      {/* --- SECTION 1: HOW IT WORKS --- */}
      <section className="py-24 bg-[#0B1120] px-6 md:px-24 relative">
        <RevealOnScroll>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How GetCha Works</h2>
            <p className="text-gray-400 text-lg">Seamless experience from screen to seat.</p>
          </div>
        </RevealOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <RevealOnScroll delay={100}>
            <div className="group bg-white p-8 rounded-3xl h-full hover:-translate-y-4 transition-all duration-500 border-2 border-transparent hover:border-gold-500">
              <div className="w-20 h-20 bg-navy-50 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:bg-gold-500 group-hover:text-white transition-all">📍</div>
              <h3 className="text-2xl font-bold text-navy-900 mb-3">Pick Your Spot</h3>
              <p className="text-gray-600 leading-relaxed">View the realtime floor plan and reserve the perfect table via our interactive map.</p>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={300}>
            <div className="group bg-white p-8 rounded-3xl h-full hover:-translate-y-4 transition-all duration-500 border-2 border-transparent hover:border-gold-500">
              <div className="w-20 h-20 bg-navy-50 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:bg-gold-500 group-hover:text-white transition-all">☕</div>
              <h3 className="text-2xl font-bold text-navy-900 mb-3">Pre-Order</h3>
              <p className="text-gray-600 leading-relaxed">Browse our menu and order ahead. We'll start preparing just before you arrive so it's fresh.</p>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={500}>
            <div className="group bg-white p-8 rounded-3xl h-full hover:-translate-y-4 transition-all duration-500 border-2 border-transparent hover:border-gold-500">
              <div className="w-20 h-20 bg-navy-50 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:bg-gold-500 group-hover:text-white transition-all">✨</div>
              <h3 className="text-2xl font-bold text-navy-900 mb-3">Skip The Line</h3>
              <p className="text-gray-600 leading-relaxed">Walk in like a VIP. Your seat is taken, and your coffee is warm waiting for you.</p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* --- SECTION 2: TRENDING NOW (MENU ASLI) --- */}
      <section className="py-24 bg-white px-6 md:px-24">
        <RevealOnScroll>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-navy-900">Trending Now</h2>
              <p className="text-gold-500 text-lg font-semibold mt-2">People are loving these</p>
            </div>
            <Link href="/login" className="text-navy-900 font-bold underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-gold-600 transition-all mt-4 md:mt-0">
              View Full Menu &rarr;
            </Link>
          </div>
        </RevealOnScroll>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-navy-900" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <RevealOnScroll key={product.id} delay={index * 100}>
                <Link href="/login" className="group block">
                  <div className="relative overflow-hidden rounded-2xl bg-gray-50 aspect-square mb-5 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <Image 
                      src={getImageUrl(product)} 
                      alt={product.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                       <span className="bg-gold-500 text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg">Order Now</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 group-hover:text-gold-600 transition-colors">{product.name}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-1">{product.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-navy-900 font-bold text-lg">Rp {parseFloat(product.price).toLocaleString("id-ID")}</p>
                    <span className="text-gold-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">Add +</span>
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        )}
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0B1120] text-white py-16 px-6 md:px-24 border-t-4 border-gold-500">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div className="max-w-sm">
              <h4 className="text-3xl font-bold mb-6 tracking-tight">GetCha.</h4>
              <p className="text-gray-400 leading-relaxed">The smartest way to enjoy your coffee break. Reserve your favorite spot, order ahead, and relax.</p>
            </div>
            <div className="flex gap-16 text-sm text-gray-300">
              <div className="flex flex-col gap-4">
                  <span className="font-bold text-white text-lg mb-2">Explore</span>
                  <Link href="/login" className="hover:text-gold-500 transition-transform">Menu</Link>
                  <Link href="#" className="hover:text-gold-500 transition-transform">Locations</Link>
                  <Link href="#" className="hover:text-gold-500 transition-transform">About Us</Link>
              </div>
              <div className="flex flex-col gap-4">
                  <span className="font-bold text-white text-lg mb-2">Support</span>
                  <Link href="#" className="hover:text-gold-500 transition-transform">FAQ</Link>
                  <Link href="#" className="hover:text-gold-500 transition-transform">Contact</Link>
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
