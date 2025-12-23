import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Hack supaya Next.js kenal Pusher
(global as any).Pusher = Pusher;

const createEcho = () => {
    // 1. Ambil Key
    const appKey = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
    const host = process.env.NEXT_PUBLIC_REVERB_HOST;

    // 2. CEK DULU: Kalau Key atau Host tidak ada, jangan jalankan Echo!
    // Ini yang bikin layar putih hilang kalau config belum pas.
    if (!appKey || !host) {
        console.warn("⚠️ Echo tidak jalan: REVERB_APP_KEY atau HOST belum disetting di Vercel.");
        return null; 
    }

    return new Echo({
        broadcaster: 'reverb',
        key: appKey,
        wsHost: host,
        
        // Di Production (Vercel/Railway) biasanya pakai 443 (HTTPS)
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ? parseInt(process.env.NEXT_PUBLIC_REVERB_PORT) : 443,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ? parseInt(process.env.NEXT_PUBLIC_REVERB_PORT) : 443,
        
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });
};

export default createEcho;