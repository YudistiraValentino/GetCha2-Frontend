"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroSlide } from '@/app/data/heroData';

const HeroCarousel = ({ slides }: { slides: HeroSlide[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSlides = slides.filter(slide => slide.isActive === true).slice(0, 5); 

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  useEffect(() => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({ left: width * currentSlide, behavior: 'smooth' });
    }
  }, [currentSlide]);

  if (activeSlides.length === 0) return null;

  return (
    <div className="relative group w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-navy-900">
      <div ref={scrollRef} className="flex overflow-x-hidden snap-x snap-mandatory scroll-smooth w-full">
        {activeSlides.map((slide, index) => (
          <div key={slide.id} className="w-full flex-shrink-0 snap-center relative aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1]">
            
            {/* --- UPDATE: IMAGE DENGAN DYNAMIC FILTER --- */}
            <Image 
              src={slide.image} 
              alt={slide.title}
              fill
              // Gabungkan object-cover (wajib) dengan style dari data admin
              // Fallback: jika admin lupa isi, default ke brightness-50
              className={`object-cover ${slide.imageStyle || 'brightness-50'}`} 
              priority={index === 0} 
            />
            
            {/* Overlay Gradient (Opsional: Bisa dihapus atau dibuat sangat tipis karena gambar sudah gelap) */}
            {/* Kita buat tipis saja untuk menjaga konsistensi text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-navy-900/60 to-transparent"></div>

            {/* Content Text */}
            <div className="absolute inset-0 flex flex-col justify-center items-start px-8 md:px-16 lg:px-24 max-w-2xl z-10">
              <span className="bg-gold-500 text-navy-900 text-[10px] md:text-xs font-bold px-3 py-1 rounded mb-3 md:mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm">
                FEATURED PROMO #{index + 1}
              </span>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-2 md:mb-4 leading-tight drop-shadow-lg">
                {slide.title}
              </h2>
              <p className="text-gray-100 text-sm md:text-lg mb-6 md:mb-8 line-clamp-2 font-medium drop-shadow-md">
                {slide.subtitle}
              </p>
              
              <Link href={slide.link}>
                <button className="bg-white text-navy-900 px-6 py-3 rounded-xl font-bold text-sm md:text-base hover:bg-gold-500 hover:text-white transition-all flex items-center gap-2 shadow-lg hover:shadow-gold-500/20">
                  {slide.buttonText} <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {activeSlides.map((_, index) => (
            <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 shadow-sm ${
                currentSlide === index ? "bg-gold-500 w-6" : "bg-white/50 hover:bg-white"
                }`}
            />
            ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;