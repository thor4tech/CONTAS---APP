
// Standard Firebase v9 modular imports
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAYWXZxgYqcOlt-yI_-pBUG4QvR5eqS4cM",
  authDomain: "projeto-contas-e7dcd.firebaseapp.com",
  projectId: "projeto-contas-e7dcd",
  storageBucket: "projeto-contas-e7dcd.firebasestorage.app",
  messagingSenderId: "946324744078",
  appId: "1:946324744078:web:a14d26b5bd6d719c6da6df",
  measurementId: "G-Y0MS36R6ZG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// === PDF v3.0: Habilitar persistência offline ===
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistência offline não disponível (múltiplas abas)');
    } else if (err.code === 'unimplemented') {
      console.warn('Navegador não suporta persistência offline');
    }
  });
}
