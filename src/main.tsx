import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installApiFetch } from './lib/api-base';

// Must run before the app makes any /api request.
installApiFetch();

// GitHub Pages serves public/404.html for deep links (e.g. /AGRONAUTS/orders);
// it stores the requested route and reloads the base URL. Restore it here so
// refreshing or sharing any page works.
try {
  const pending = sessionStorage.getItem('redirect');
  if (pending) {
    sessionStorage.removeItem('redirect');
    const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
    window.history.replaceState(null, '', `${base}${pending.startsWith('/') ? pending : `/${pending}`}`);
  }
} catch {
  // storage blocked — stay on the home page
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
