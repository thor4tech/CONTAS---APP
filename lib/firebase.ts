
// Standard Firebase v9 modular imports
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

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

// Inicialização moderna do Firestore com cache persistente (sem warnings)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
