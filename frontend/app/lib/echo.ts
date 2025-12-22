import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Hack supaya Next.js kenal Pusher
(global as any).Pusher = Pusher;

const createEcho = () => {
    return new Echo({
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
        
        // 👇 FIX: Parse string ke number, kasih default 8080 jika undefined
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ? parseInt(process.env.NEXT_PUBLIC_REVERB_PORT) : 8080,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ? parseInt(process.env.NEXT_PUBLIC_REVERB_PORT) : 8080,
        
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });
};

export default createEcho;