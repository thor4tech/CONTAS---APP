
import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { Activity, ShieldAlert, CheckCircle2, Star, ShieldCheck, Zap } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import { UserProfile, PlanId, SubscriptionStatus } from './types';
import { checkUserAccess, KIWIFY_LINKS } from './lib/subscription';
import { addDays, parseISO } from 'date-fns';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'dashboard'>('landing');

  // Captura automática de UTMs da URL
  const getMarketingParams = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_content: params.get('utm_content'),
        utm_term: params.get('utm_term'),
        s1: params.get('s1'),
        s2: params.get('s2'),
        s3: params.get('s3'),
      };
    } catch (e) {
      return {};
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setProfileLoading(true);
        const profileRef = doc(db, `users/${u.uid}/profile`, 'settings');
        try {
          const docSnap = await getDoc(profileRef);
          
          if (!docSnap.exists()) {
            const now = new Date();
            // Mantém a regra padrão de 7 dias para novos registros
            const trialEnd = addDays(now, 7);
            const mkt = getMarketingParams();

            const newProfile: UserProfile = {
              email: u.email || '',
              name: u.displayName || 'Usuário Pro',
              company: 'Minha Empresa',
              planId: 'PRO', 
              subscriptionStatus: 'TRIAL',
              createdAt: now.toISOString(),
              trialEnd: trialEnd.toISOString(),
              defaultMeta: 0,
              globalAssets: [],
              ...mkt
            };
            await setDoc(profileRef, newProfile);
            setProfile(newProfile);
          } else {
            setProfile(docSnap.data() as UserProfile);
          }

          onSnapshot(profileRef, (snap) => {
            if (snap.exists()) {
              setProfile(snap.data() as UserProfile);
            }
            setProfileLoading(false);
          });
        } catch (err) {
          console.error("Erro ao carregar perfil:", err);
          setProfileLoading(false);
        }
        setCurrentView('dashboard');
      } else {
        setProfile(null);
        setProfileLoading(false);
        if (currentView === 'dashboard') setCurrentView('landing');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [currentView]);

  if (authLoading || (user && profileLoading && !profile)) {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center">
        <Activity size={48} className="text-indigo-500 animate-spin" />
      </div>
    );
  }

  const access = checkUserAccess(profile);

  // Middleware de Bloqueio se o usuário estiver logado mas sem acesso ativo ou trial expirado
  if (user && profile && !access.hasAccess && !profileLoading) {
    return <BillingLock profile={profile} onSignOut={() => auth.signOut()} />;
  }

  if (user) {
    return <Dashboard user={user} />;
  }

  if (currentView === 'login') {
    return (
      <Login 
        onLogin={() => setCurrentView('dashboard')} 
        onBackToLanding={() => setCurrentView('landing')} 
      />
    );
  }

  return (
    <LandingPage 
      onEntrar={() => setCurrentView('login')} 
      onTesteGratis={() => setCurrentView('login')} 
    />
  );
};

const BillingLock = ({ profile, onSignOut }: { profile: UserProfile, onSignOut: () => void }) => {
  const createdAt = profile.createdAt ? parseISO(profile.createdAt) : new Date();
  const updateCutoff = new Date('2025-05-23T00:00:00Z');
  const trialDuration = createdAt < updateCutoff ? 30 : 7;

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-inter">
      <div className="max-w-5xl w-full bg-white rounded-[48px] shadow-4xl overflow-hidden flex flex-col md:flex-row border border-white/10">
        <div className="md:w-5/12 p-10 md:p-16 bg-slate-900 text-white flex flex-col justify-between">
          <div>
            <div className="inline-flex p-4 bg-rose-500 rounded-2xl mb-8"><ShieldAlert size={32} /></div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 uppercase leading-none">Acesso Restrito.</h2>
            <p className="text-slate-400 font-medium leading-relaxed mb-10">
              {profile.subscriptionStatus === 'TRIAL' 
                ? `Seu período de ${trialDuration} dias de teste gratuito chegou ao fim. Seus dados estão salvos e aguardando ativação.` 
                : 'Sua assinatura não está ativa. Para continuar operando seu sistema, escolha um plano abaixo.'}
            </p>
            <div className="space-y-4">
               {["Liberação imediata via Kiwify", "Criptografia de dados bancários", "Suporte prioritário Master"].map((txt, i) => (
                 <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                   <CheckCircle2 size={16} /> {txt}
                 </div>
               ))}
            </div>
          </div>
          <button onClick={onSignOut} className="mt-12 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest text-left">Desconectar conta</button>
        </div>

        <div className="md:w-7/12 p-10 md:p-16 bg-white grid grid-cols-1 gap-6 overflow-y-auto max-h-[90vh] no-scrollbar">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Selecione seu plano de comando</h3>
          
          <a href={KIWIFY_LINKS.ESSENTIAL} target="_blank" className="p-8 rounded-[32px] border-2 border-slate-100 hover:border-indigo-600 transition-all group flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-indigo-600 tracking-widest block mb-1">PLANO 1</span>
              <h4 className="text-xl font-black text-slate-900 uppercase">Essencial</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Gestão básica e fluxo real</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 font-mono">R$ 39,90</span>
              <span className="block text-[8px] font-black text-slate-300 uppercase">/mês</span>
            </div>
          </a>

          <a href={KIWIFY_LINKS.PRO} target="_blank" className="p-8 rounded-[32px] border-2 border-indigo-600 bg-indigo-50/50 relative shadow-xl shadow-indigo-100 flex items-center justify-between group">
            <div className="absolute top-0 right-10 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
              <Star size={10} fill="white"/> MAIS ESCOLHIDO
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest block mb-1">PLANO 2</span>
              <h4 className="text-xl font-black text-slate-900 uppercase">Pro Estratégico</h4>
              <p className="text-[9px] text-indigo-600/60 font-bold uppercase mt-1">IA + Saúde Líquida + Agenda</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 font-mono">R$ 69,90</span>
              <span className="block text-[8px] font-black text-indigo-400 uppercase">/mês</span>
            </div>
          </a>

          <a href={KIWIFY_LINKS.MASTER} target="_blank" className="p-8 rounded-[32px] border-2 border-slate-100 hover:border-slate-900 transition-all group flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-900 tracking-widest block mb-1">PLANO 3</span>
              <h4 className="text-xl font-black text-slate-900 uppercase">Master Intelligence</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Multi-empresas + IA Ilimitada</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 font-mono">R$ 129,90</span>
              <span className="block text-[8px] font-black text-slate-300 uppercase">/mês</span>
            </div>
          </a>

          <div className="mt-4 flex items-center justify-center gap-2 py-4 bg-slate-50 rounded-2xl">
             <ShieldCheck size={16} className="text-emerald-500" />
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pagamento 100% Seguro via Kiwify</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
