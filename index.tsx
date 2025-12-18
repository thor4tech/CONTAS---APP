
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill para process.env para evitar erros "Uncaught ReferenceError: process is not defined"
if (typeof window !== 'undefined' && !window.process) {
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
