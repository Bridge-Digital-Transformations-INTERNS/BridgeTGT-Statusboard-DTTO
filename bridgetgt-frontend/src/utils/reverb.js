import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
});

// Connection event handlers
echo.connector.pusher.connection.bind('connected', () => {
    console.log('[Reverb] Connected');
});

echo.connector.pusher.connection.bind('error', (error) => {
    console.error('[Reverb] Connection error:', error);
});

echo.connector.pusher.connection.bind('disconnected', () => {
    console.log('[Reverb] Disconnected');
});

echo.connector.pusher.connection.bind('reconnecting', () => {
    console.log('[Reverb] Reconnecting...');
});

export default echo;
