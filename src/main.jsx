import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// ── Registrar Service Worker ───────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('[App] Service Worker registrado con scope:', registration.scope);

      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_REPORTES') {
          // Disparar evento personalizado para que la app sincronice
          window.dispatchEvent(new CustomEvent('sync-reportes'));
        }
      });
    } catch (error) {
      console.error('[App] Error al registrar Service Worker:', error);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
