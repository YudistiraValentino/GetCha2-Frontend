"use client"; 
import React, { useEffect, useState, useRef } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import { useCart } from "@/app/context/CartContext"; 
import { useRouter } from "next/navigation"; 
import { Clock, AlertTriangle, Loader2, Map as MapIcon } from 'lucide-react';

export default function BookingPage() {
  const { cartItems } = useCart(); 
  const router = useRouter();

  // State untuk menyimpan KODE SVG
  const [mapHtml, setMapHtml] = useState<string>("");
  const [loadingMap, setLoadingMap] = useState(true);
  
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [arrivalTime, setArrivalTime] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // 1. CEK KERANJANG
  useEffect(() => {
    if (cartItems.length === 0) {
      alert("Please order menu items before selecting a seat.");
      router.push('/menu'); 
    }
  }, [cartItems, router]);

  // 2. FETCH MAP DARI API LARAVEL (FIXED NO CORS ERROR)
  useEffect(() => {
    const fetchActiveMap = async () => {
        try {
            // A. Panggil API sekali saja
            const res = await fetch('http://127.0.0.1:8000/api/active-map');
            const data = await res.json();

            // B. Cek apakah ada data svg_content dari backend
            if (data.success && data.data.svg_content) {
                // Langsung pakai string SVG dari JSON. TIDAK PERLU FETCH LAGI.
                setMapHtml(data.data.svg_content);
            } else {
                console.warn("Admin belum upload map atau file tidak terbaca.");
            }
        } catch (error) {
            console.error("Gagal load map:", error);
        } finally {
            setLoadingMap(false);
        }
    };

    fetchActiveMap();
    
    // Set default arrival time (15 menit dari sekarang)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    setArrivalTime(now.toTimeString().slice(0, 5));
  }, []);

  // 3. LOGIKA INTERAKSI SVG (KLIK MEJA)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Cari semua elemen di dalam SVG yang ID-nya diawali "Seat-"
    const seats = mapContainerRef.current.querySelectorAll('[id^="Seat-"]');
    
    seats.forEach((group) => {
        const element = group as HTMLElement;
        element.style.cursor = 'pointer';
        element.style.transition = 'all 0.3s ease';

        const children = element.querySelectorAll('rect, circle, path');

        // Logic Pewarnaan
        if (element.id === selectedSeat) {
            children.forEach((c) => {
                (c as HTMLElement).style.fill = '#D4AF37'; 
                (c as HTMLElement).style.stroke = '#fff';
            });
        } else {
            children.forEach((c) => {
                (c as HTMLElement).style.fill = ''; 
                (c as HTMLElement).style.stroke = '';
            });
        }

        // Logic Klik
        element.onclick = (e) => {
            e.preventDefault();
            setSelectedSeat(prev => prev === element.id ? null : element.id);
        }
    });
  }, [mapHtml, selectedSeat]);

  // 4. SUBMIT RESERVASI
  const handleConfirm = () => {
    if (!selectedSeat || !arrivalTime) return;
    setLoadingSubmit(true);

    const seatNumber = selectedSeat.replace('Seat-', ''); 
    
    const sessionData = {
        type: 'dine_in',
        seat_id: seatNumber,
        time: arrivalTime
    };

    localStorage.setItem("checkout_session", JSON.stringify(sessionData));

    setTimeout(() => {
        router.push('/payment');
    }, 800);
  };

  const getLateTime = (time: string) => {
    if (!time) return "-";
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m + 5);
    return date.toTimeString().slice(0, 5);
  };

  if (cartItems.length === 0) return null;

  return (
    <main className="min-h-screen bg-navy-900 pb-20">
      <NavbarDashboard />

      <div className="container mx-auto px-6 md:px-12 pt-32 flex flex-col lg:flex-row gap-8">
        
        {/* AREA PETA */}
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-2xl min-h-[500px] flex items-center justify-center overflow-hidden relative border-4 border-navy-800">
          
          {/* Loading State */}
          {loadingMap && (
            <div className="flex flex-col items-center text-gray-400 animate-pulse">
                <Loader2 size={40} className="animate-spin text-gold-500 mb-2"/>
                <p>Loading Floor Plan...</p>
            </div>
          )}

          {/* Empty State */}
          {!loadingMap && !mapHtml && (
            <div className="text-center text-gray-400">
                <MapIcon size={50} className="mx-auto mb-2 opacity-50"/>
                <p>Floor plan not available.</p>
                <p className="text-sm">Please ask staff for manual seating.</p>
            </div>
          )}

          {/* SVG RENDERER (Interactive) */}
          <div 
            ref={mapContainerRef}
            className="w-full h-full max-h-[600px] [&_svg]:w-full [&_svg]:h-full transition-all duration-300 animate-in fade-in zoom-in" 
            dangerouslySetInnerHTML={{ __html: mapHtml }}
          />
          
          {/* Legend / Info */}
          <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg text-xs shadow-md backdrop-blur-sm">
             <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 bg-gold-500 rounded-full"></span> Selected
             </div>
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 border border-gray-400 rounded-full"></span> Available
             </div>
          </div>
        </div>

        {/* AREA DETAIL */}
        <div className="w-full lg:w-96 h-fit bg-white rounded-2xl p-6 shadow-xl flex flex-col gap-6">
          <h2 className="text-xl font-bold text-navy-900 font-serif border-b pb-4">Booking Details</h2>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Arrival Time</label>
            <div className="flex items-center bg-gray-100 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-gold-500 transition-colors">
                <Clock size={20} className="text-gray-500 mr-3" />
                <input 
                    type="time" 
                    value={arrivalTime} 
                    onChange={(e) => setArrivalTime(e.target.value)} 
                    className="bg-transparent font-bold text-navy-900 w-full outline-none"
                />
            </div>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-red-700 text-sm">Late Policy: 5 Minutes</h4>
                    <p className="text-xs text-red-600 mt-1">
                        Reservation auto-cancels at <span className="font-bold">{getLateTime(arrivalTime)}</span>.
                    </p>
                </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-gray-500">Selected Seat</span>
              <span className="font-bold text-3xl text-gold-500">
                {selectedSeat ? selectedSeat.replace('Seat-', '#') : '-'}
              </span>
          </div>

          <button 
            disabled={!selectedSeat || !arrivalTime || loadingSubmit}
            onClick={handleConfirm}
            className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg mt-2 flex items-center justify-center gap-2 
                ${selectedSeat 
                    ? 'bg-navy-900 text-white hover:bg-gold-500 hover:text-navy-900 hover:scale-[1.02]' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
          >
            {loadingSubmit ? <Loader2 className="animate-spin" /> : "Confirm & Pay"}
          </button>
        </div>
      </div>
    </main>
  );
}