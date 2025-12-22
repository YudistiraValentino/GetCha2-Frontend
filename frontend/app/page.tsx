import Navbar from "./components/layout/Navbar";
import HeroImage from "./components/home/HeroImage"; 
import Typewriter from "./components/home/Typewriter"; 
import Link from "next/link"; // 1. JANGAN LUPA IMPORT INI

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 md:px-24 pt-24 gap-12 pb-10">
        
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
            {/* 2. BUNGKUS TOMBOL DENGAN LINK DI SINI */}
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
    </main>
  );
}