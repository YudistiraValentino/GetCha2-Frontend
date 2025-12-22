import Link from "next/link";
import Image from "next/image";
import React from "react";

const Navbar = () => {
  return (
    <nav className="w-full h-20 bg-navy-900 flex justify-between items-center px-4 md:px-12 fixed top-0 left-0 z-50">
      
      {/* LOGO AREA */}
      <Link href="/">
        {/* PERBAIKAN DI SINI: */}
        {/* 1. Hapus 'bg-white' */}
        {/* 2. Sesuaikan ukuran w dan h agar proporsional */}
        <div className="w-25 h-25 relative cursor-pointer">
          <Image 
            // Ganti ke LogoPutih.png agar kontras dengan background Navy
            // Pastikan file LogoPutih.png background-nya transparan
            src="/Image/LogoPutih.png" 
            alt="GetCha Logo"
            fill 
            className="object-contain object-left" // object-left biar logo rapat kiri
            priority 
            sizes="150px"
          />
        </div>
      </Link>

      {/* TOMBOL AUTH */}
      <div className="flex gap-4">
        <Link href="/signup">
          <button className="px-6 py-2 rounded-full bg-white text-navy-900 font-bold hover:bg-gray-100 transition cursor-pointer text-sm md:text-base">
            Sign Up
          </button>
        </Link>

        <Link href="/login">
          <button className="px-6 py-2 rounded-full bg-gold-500 text-navy-900 font-bold hover:bg-gold-400 transition cursor-pointer text-sm md:text-base">
            Login
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;