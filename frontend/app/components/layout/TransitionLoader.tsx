"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTransition } from "@/app/context/TransitionContext";

export default function TransitionLoader({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const beanWrapper = useRef<HTMLDivElement>(null);
  
  // Refs Wajah
  const faceNormal = useRef<SVGGElement>(null);
  const faceWink = useRef<SVGGElement>(null);
  const faceDizzy = useRef<SVGGElement>(null);

  // Ambil state dari Context
  const { isLoading, setIsLoading } = useTransition();

  gsap.registerPlugin(useGSAP);

  // Fungsi Animasi Utama (Reusable)
  const playAnimation = (onCompleteCallback: () => void) => {
    // Reset kondisi awal
    gsap.set(container.current, { autoAlpha: 1 }); // Munculkan container
    gsap.set(fillRef.current, { height: "0%" }); // Kosongkan meteran

    const mainTl = gsap.timeline({
      onComplete: onCompleteCallback
    });

    // 1. ANIMASI FILLING
    mainTl.to(fillRef.current, {
      height: "100%",
      duration: 3.5, 
      ease: "power1.inOut",
    });

    // 2. ANIMASI AKROBATIK (Looping di background timeline utama)
    const jumpTl = gsap.timeline({ repeat: -1, repeatDelay: 0.1 });
    
    // ... (LOGIC AKROBATIK SAMA SEPERTI SEBELUMNYA) ...
    jumpTl
      .set([faceWink.current, faceDizzy.current], { autoAlpha: 0 })
      .set(faceNormal.current, { autoAlpha: 1 })
      .to(beanWrapper.current, { x: -40, y: -30, rotation: -15, scaleX: 0.9, scaleY: 1.1, duration: 0.4, ease: "power2.out" })
      .to(beanWrapper.current, { y: 0, scaleX: 1.1, scaleY: 0.9, duration: 0.3, ease: "bounce.out" })
      .to(beanWrapper.current, { scaleX: 1, scaleY: 1, duration: 0.2 })
      
      .to(beanWrapper.current, { 
        x: 40, y: -30, rotation: 15, scaleX: 0.9, scaleY: 1.1, duration: 0.4, ease: "power2.out",
        onStart: () => { gsap.set(faceNormal.current, { autoAlpha: 0 }); gsap.set(faceWink.current, { autoAlpha: 1 }); }
      })
      .to(beanWrapper.current, { y: 0, scaleX: 1.1, scaleY: 0.9, duration: 0.3, ease: "bounce.out" })
      .to(beanWrapper.current, { scaleX: 1, scaleY: 1, duration: 0.2 })

      .to(beanWrapper.current, { 
        x: 0, y: -60, rotation: 360, scaleX: 0.8, scaleY: 1.2, duration: 0.6, ease: "back.out(1.2)",
        onStart: () => { gsap.set(faceWink.current, { autoAlpha: 0 }); gsap.set(faceDizzy.current, { autoAlpha: 1 }); }
      })
      .to(beanWrapper.current, { y: 0, rotation: 360, scaleX: 1.2, scaleY: 0.8, duration: 0.3, ease: "bounce.out" })
      .to(beanWrapper.current, { rotation: 0, scaleX: 1, scaleY: 1, duration: 0.1 });

    // 3. ANIMASI EXIT
    mainTl.to(container.current, {
      opacity: 0,
      duration: 0.8,
      onStart: () => {
        jumpTl.pause(); // Stop lompat
      },
      onComplete: () => {
        gsap.set(container.current, { autoAlpha: 0 }); // Sembunyikan total
        jumpTl.kill(); // Bersihkan memori
      }
    });
  };

  // 1. TRIGGER SAAT REFRESH PAGE (Hanya sekali)
  useGSAP(() => {
    // Kita paksa true manual di awal render, lalu mainkan animasi
    setIsLoading(true);
    playAnimation(() => {
        setIsLoading(false);
    });
  }, []); // Dependency kosong = Jalan pas refresh

  // 2. TRIGGER SAAT BUTTON KLIK (Context berubah jadi true)
  useEffect(() => {
    if (isLoading) {
        // Jika isLoading berubah jadi TRUE (karena tombol diklik), mainkan animasi
        // Tapi kita cek dulu opacity-nya, kalau sudah visible (karena refresh), jangan double play
        if (gsap.getProperty(container.current, "opacity") === 0) {
            playAnimation(() => {
                setIsLoading(false);
            });
        }
    }
  }, [isLoading]);

  return (
    <>
      {/* Container selalu ada di DOM, tapi visibilitas diatur GSAP */}
      <div
        ref={container}
        className="fixed inset-0 z-[9999] bg-navy-900 flex flex-col items-center justify-center px-8 text-center invisible" // Default invisible biar ga nutupin kalau ga loading
      >
        <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
            <div ref={beanWrapper} className="w-full h-full relative">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
                  <defs>
                    <clipPath id="beanShape2">
                       <path d="M50 95C25 95 10 75 10 50C10 25 30 5 50 5C75 5 90 25 90 50C90 75 75 95 50 95Z" />
                    </clipPath>
                  </defs>
                  <path d="M50 95C25 95 10 75 10 50C10 25 30 5 50 5C75 5 90 25 90 50C90 75 75 95 50 95Z" fill="#182737" stroke="#EEBC6B" strokeWidth="3"/>
                  <g clipPath="url(#beanShape2)">
                      <foreignObject width="100" height="100" x="0" y="0">
                          <div className="w-full h-full flex items-end">
                              <div ref={fillRef} className="w-full bg-gold-500" style={{ height: "0%" }}></div>
                          </div>
                      </foreignObject>
                  </g>
                  <path d="M50 10 C42 30, 58 60, 50 90" stroke="#182737" strokeWidth="2" fill="none" opacity="0.2"/>
                  <g ref={faceNormal}>
                      <circle cx="35" cy="45" r="5" fill="white" /><circle cx="35" cy="45" r="2" fill="#1D3253" />
                      <circle cx="65" cy="45" r="5" fill="white" /><circle cx="65" cy="45" r="2" fill="#1D3253" />
                      <path d="M40 60 Q50 70 60 60" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </g>
                  <g ref={faceWink} style={{ opacity: 0, visibility: 'hidden' }}>
                      <path d="M30 45 L40 45" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="65" cy="45" r="5" fill="white" /><circle cx="65" cy="45" r="2" fill="#1D3253" />
                      <path d="M42 62 Q50 68 58 62" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </g>
                  <g ref={faceDizzy} style={{ opacity: 0, visibility: 'hidden' }}>
                      <path d="M32 42 L38 48 L32 54" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M68 42 L62 48 L68 54" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="50" cy="65" r="4" stroke="white" strokeWidth="3" fill="none"/>
                  </g>
                </svg>
            </div>
          </div>
          <div className="max-w-lg space-y-6 relative z-10">
            <p className="text-[#FACC82] text-sm md:text-lg font-serif italic leading-relaxed drop-shadow-md">
              "Don't let a full house ruin your plans. Book your favorite seat in advance, arrive on your own time, and enjoy your order without the hassle."
            </p>
            <div className="flex justify-center gap-2">
                <span className="w-2 h-2 bg-gold-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gold-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gold-500 rounded-full animate-bounce"></span>
            </div>
          </div>
      </div>
      {children}
    </>
  );
}