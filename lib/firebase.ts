// Standard Firebase v9 modular imports
// @ts-ignore - Some environments have issues resolving named exports from firebase/app subpath
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAYWXZxgYqcOlt-yI_-pBUG4QvR5eqS4cM",
  authDomain: "projeto-contas-e7dcd.firebaseapp.com",
  projectId: "projeto-contas-e7dcd",
  storageBucket: "projeto-contas-e7dcd.firebasestorage.app",
  messagingSenderId: "946324744078",
  appId: "1:946324744078:web:a14d26b5bd6d719c6da6df",
  measurementId: "G-Y0MS36R6ZG"
};

// Initialize the Firebase application with modular SDK syntax
const app = initializeApp(firebaseConfig);

// Export authorized services
export const auth = getAuth(app);
export const db = getFirestore(app);