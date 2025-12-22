

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill para process.env para evitar erros "Uncaught ReferenceError: process is not defined"
// Fix: Casting window to any to check for process property in TypeScript
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);