"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface TransitionContextType {
  triggerTransition: (href: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export const TransitionProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi sakti untuk memicu animasi + pindah halaman
  const triggerTransition = (href: string) => {
    setIsLoading(true); // 1. Munculkan Loading Screen
    
    // 2. Tunggu sebentar (biar loading nutup layar dulu), baru pindah halaman
    // Kita set timeout kecil (misal 100ms) agar state isLoading ke-render dulu
    setTimeout(() => {
        router.push(href);
    }, 100); 
  };

  return (
    <TransitionContext.Provider value={{ triggerTransition, isLoading, setIsLoading }}>
      {children}
    </TransitionContext.Provider>
  );
};

export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) throw new Error("useTransition must be used within a TransitionProvider");
  return context;
};