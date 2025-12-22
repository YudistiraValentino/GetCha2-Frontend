"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Clock, 
    CheckCircle2, 
    ChefHat, 
    BellRing, 
    PartyPopper, 
    XCircle, 
    X 
} from "lucide-react";

// Konfigurasi Tampilan per Status
const statusConfig: any = {
    pending: {
        icon: Clock,
        color: "bg-yellow-500",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
        title: "Order Received",
        msg: "Mohon tunggu, pesananmu sedang dicek kasir."
    },
    confirmed: {
        icon: CheckCircle2,
        color: "bg-blue-500",
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        title: "Order Confirmed",
        msg: "Pesanan diterima! Segera masuk antrian dapur."
    },
    processing: {
        icon: ChefHat,
        color: "bg-orange-500",
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        title: "Cooking Now",
        msg: "Chef sedang menyiapkan hidanganmu dengan cinta! 🔥"
    },
    ready: {
        icon: BellRing,
        color: "bg-green-500",
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        title: "Order Ready!",
        msg: "Pesanan siap! Silakan ambil atau tunggu diantar."
    },
    completed: {
        icon: PartyPopper,
        color: "bg-slate-900",      // Ganti navy-900 jadi slate-900 (Hitam Kebiruan)
        bg: "bg-amber-100",         // Ganti gold-50 jadi amber-100 (Kuning Emas Muda)
        border: "border-amber-400", // Ganti gold-200 jadi amber-400 (Garis Emas Tegas)
        text: "text-slate-900",     // Text Gelap
        title: "Enjoy Your Meal",
        msg: "Terima kasih sudah memesan di GetCha Coffee!"
    },
    cancelled: {
        icon: XCircle,
        color: "bg-red-500",
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        title: "Order Cancelled",
        msg: "Maaf, pesanan ini dibatalkan. Silakan hubungi kasir."
    }
};

interface Props {
    order: any; // Data order dari event
    onClose: () => void;
}

export default function OrderNotification({ order, onClose }: Props) {
    // Auto close dalam 5 detik
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 6000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!order) return null;

    const config = statusConfig[order.status] || statusConfig['pending'];
    const Icon = config.icon;

    return (
        <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
            <motion.div 
                initial={{ y: -100, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -100, opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`pointer-events-auto w-full max-w-md ${config.bg} ${config.border} border-2 rounded-2xl shadow-2xl overflow-hidden flex relative`}
            >
                {/* Bagian Kiri: Icon & Animasi */}
                <div className={`${config.color} w-16 flex items-center justify-center shrink-0`}>
                    <motion.div 
                        animate={order.status === 'ready' ? { rotate: [0, -10, 10, -10, 10, 0] } : { scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: order.status === 'processing' ? Infinity : 0, repeatDelay: 2 }}
                    >
                        <Icon className="text-white w-8 h-8" />
                    </motion.div>
                </div>

                {/* Bagian Kanan: Text */}
                <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                        <h4 className={`font-bold text-lg ${config.text} font-serif`}>
                            {config.title}
                        </h4>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mt-1 leading-tight">
                        {config.msg}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 font-bold">
                        Order #{order.order_number}
                    </p>
                </div>

                {/* Progress Bar (Timer) */}
                <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 6, ease: "linear" }}
                    className={`absolute bottom-0 left-0 h-1 ${config.color} opacity-30`}
                />
            </motion.div>
        </div>
    );
}