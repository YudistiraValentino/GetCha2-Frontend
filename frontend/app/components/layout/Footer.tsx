"use client";
import React from 'react';
import Link from 'next/link';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight 
} from 'lucide-react';
// Import Data Footer dari "Backend"
import { footerData, SocialLink } from "@/app/data/footerData"; 

const Footer = () => {
  
  // Helper: Render Icon berdasarkan platform string
  const getSocialIcon = (platform: SocialLink['platform']) => {
    switch (platform) {
      case 'instagram': return <Instagram size={18} />;
      case 'facebook': return <Facebook size={18} />;
      case 'twitter': return <Twitter size={18} />;
      case 'youtube': return <Youtube size={18} />;
      default: return <Instagram size={18} />;
    }
  };

  return (
    <footer className="bg-navy-900 text-white border-t border-navy-800 pt-16 pb-8 font-sans">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* --- GRID UTAMA (4 KOLOM) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* KOLOM 1: BRAND IDENTITY (Dynamic) */}
          <div className="space-y-6">
            <Link href="/dashboard" className="block">
               <h2 className="text-3xl font-serif font-bold text-white tracking-wide">
                 {footerData.brand.name}
                 <span className="text-gold-500">{footerData.brand.accent}</span>
               </h2>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              {footerData.brand.description}
            </p>
            
            {/* Dynamic Social Icons */}
            <div className="flex gap-4">
              {footerData.brand.socialMedia.map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-gray-400 hover:bg-gold-500 hover:text-navy-900 transition-all"
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
            </div>
          </div>

          {/* KOLOM 2: DISCOVER (Dynamic List) */}
          <div>
            <h3 className="text-lg font-bold font-serif mb-6 text-gold-500">{footerData.column1.title}</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              {footerData.column1.links.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="hover:text-white hover:translate-x-1 transition-all inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* KOLOM 3: CONTACT US (Dynamic Info) */}
          <div>
            <h3 className="text-lg font-bold font-serif mb-6 text-gold-500">{footerData.contact.title}</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-gold-500 shrink-0 mt-0.5" />
                <span>{footerData.contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-gold-500 shrink-0" />
                <span>{footerData.contact.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-gold-500 shrink-0" />
                <span>{footerData.contact.email}</span>
              </li>
            </ul>
          </div>

          {/* KOLOM 4: HOURS & NEWSLETTER (Dynamic Schedule) */}
          <div>
            <h3 className="text-lg font-bold font-serif mb-6 text-gold-500">{footerData.openingHours.title}</h3>
            <ul className="space-y-3 text-sm text-gray-400 mb-8">
              {footerData.openingHours.schedules.map((item, idx) => (
                <li key={idx} className="flex justify-between border-b border-navy-800 pb-2">
                  <span>{item.day}</span>
                  <span className="text-white font-bold">{item.time}</span>
                </li>
              ))}
            </ul>

            {/* Newsletter (Static UI / Logic terpisah) */}
            <div>
                <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Subscribe for Promos</h4>
                <div className="flex bg-navy-800 rounded-lg p-1 border border-navy-700 focus-within:border-gold-500 transition-colors">
                    <input 
                        type="email" 
                        placeholder="Your email..." 
                        className="bg-transparent w-full px-3 text-sm text-white outline-none placeholder-gray-600"
                    />
                    <button className="bg-gold-500 text-navy-900 p-2 rounded-md hover:bg-white transition-colors">
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* --- BOTTOM BAR (COPYRIGHT DYNAMIC) --- */}
        <div className="border-t border-navy-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>{footerData.bottom.copyrightText}</p>
          <div className="flex gap-6">
            {footerData.bottom.links.map((link, idx) => (
                <Link key={idx} href={link.href} className="hover:text-gold-500 transition-colors">
                    {link.label}
                </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;