"use client";
import React, { useState, useEffect } from "react";

interface TypewriterProps {
  words?: string[];     // Array kata-kata yang akan muncul
  typeSpeed?: number;   // Kecepatan ngetik
  deleteSpeed?: number; // Kecepatan menghapus
  delay?: number;       // Jeda waktu saat kata selesai diketik sebelum dihapus
}

const Typewriter = ({ 
  words = ["Coffee", "Dessert", "Snacks"], // Default kata-kata
  typeSpeed = 150, 
  deleteSpeed = 100,
  delay = 2000 
}: TypewriterProps) => {
  
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Ambil kata saat ini berdasarkan index (looping pake modulus %)
    const currentWord = words[wordIndex % words.length];

    const handleTyping = () => {
      setText((prev) => {
        if (isDeleting) {
          // Kalau lagi mode menghapus, kurangi 1 huruf
          return currentWord.substring(0, prev.length - 1);
        } else {
          // Kalau lagi mode ngetik, tambah 1 huruf
          return currentWord.substring(0, prev.length + 1);
        }
      });

      // LOGIKA PINDAH FASE
      if (!isDeleting && text === currentWord) {
        // Jika kata sudah lengkap selesai diketik -> Tunggu dulu (delay), lalu mulai hapus
        setTimeout(() => setIsDeleting(true), delay);
      } else if (isDeleting && text === "") {
        // Jika kata sudah habis dihapus -> Pindah ke kata berikutnya, lalu mulai ngetik lagi
        setIsDeleting(false);
        setWordIndex((prev) => prev + 1);
      }
    };

    // Atur kecepatan: Kalau lagi hapus lebih cepat, kalau ngetik normal
    const timer = setTimeout(handleTyping, isDeleting ? deleteSpeed : typeSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, words, typeSpeed, deleteSpeed, delay]);

  return (
    <span className="inline-block min-w-[3ch] text-gold-500 underline decoration-4 underline-offset-8">
      {text}
      {/* Kursor Kedip-kedip */}
      <span className="animate-pulse text-navy-900">|</span>
    </span>
  );
};

export default Typewriter;