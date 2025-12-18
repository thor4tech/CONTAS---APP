
import React, { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Activity } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'dashboard'>('landing');

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) {
        setCurrentView('dashboard');
      } else if (currentView === 'dashboard') {
        setCurrentView('landing');
      }
    });
  }, [currentView]);

  if (authLoading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="relative">
          <Activity size={48} className="text-indigo-500 animate-spin" />
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Se o usuário está logado, mostra o Dashboard
  if (user) {
    return <Dashboard user={user} />;
  }

  // Se o usuário está na tela de login/cadastro
  if (currentView === 'login') {
    return (
      <Login 
        onLogin={() => setCurrentView('dashboard')} 
        onBackToLanding={() => setCurrentView('landing')} 
      />
    );
  }

  // Caso contrário, mostra a Landing Page
  return (
    <LandingPage 
      onEntrar={() => setCurrentView('login')} 
      onTesteGratis={() => setCurrentView('login')} 
    />
  );
};

export default App;
