
import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../lib/firebase';
import { signOut, type User } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, query, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { MONTHS, DEFAULT_CATEGORIES } from '../constants';
import { AppState, FinancialData, BaseTransaction, Situation, Category, Partner, UserProfile, AccountItem, CreditCardItem, PlanId, SubscriptionStatus } from '../types';
import SplitTransactionView from './SplitTransactionView';
import PartnerManager from './PartnerManager';
import CalendarView from './CalendarView';
import TransactionModal from './TransactionModal';
import CategoryModal from './CategoryModal';
import SettingsModal from './SettingsModal';
import AnalyticsView from './AnalyticsView';
import OnboardingGuide from './OnboardingGuide';
import ConfirmModal from './ConfirmModal';
import PricingPage from './PricingPage';
import { ADMIN_EMAILS, checkUserAccess } from '../lib/subscription';
import { 
  Wallet, ChevronLeft, ChevronRight, LayoutDashboard, 
  Calendar, List, Palette, Users, Activity, LogOut, 
  CreditCard, Landmark, ArrowDownCircle, Zap, Lock,
  Settings, ShieldCheck, CreditCard as CardIcon, CheckCircle2,
  BarChart3, Clock, PiggyBank, Copy, ArrowUpRight, Bell, AlertTriangle, X, Unlock,
  Crown, Info, TrendingDown, CalendarDays, Rocket, Sparkles
} from 'lucide-react';
import { parseISO, format, differenceInDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardProps {
  user: User;
}

const KPIItem = ({ label, value, sub, icon: Icon, color, isEditable, onUpdateValue }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value.toString());

  useEffect(() => {
    if (!isEditing) setLocalVal(value.toString());
  }, [value, isEditing]);

  return (
    <div className="flex flex-col justify-between p-5 md:p-10 rounded-[32px] md:rounded-[48px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group h-full">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[7px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-2">{label}</span>
          {isEditable && isEditing ? (
            <input 
              autoFocus
              type="number"
              className="bg-transparent border-b-2 border-indigo-400 text-white font-mono font-black text-base md:text-2xl outline-none w-24"
              value={localVal}
              onChange={e => setLocalVal(e.target.value)}
              onBlur={() => { 
                const numVal = parseFloat(localVal);
                if (!isNaN(numVal)) onUpdateValue?.(numVal); 
                setIsEditing(false); 
              }}
              onKeyDown={e => e.key === 'Enter' && (e.target as any).blur()}
            />
          ) : (
            <div 
              className={`text-base md:text-2xl font-black font-mono tracking-tighter ${color} ${isEditable ? 'cursor-pointer hover:text-white transition-colors' : ''}`}
              onClick={() => isEditable && setIsEditing(true)}
            >
              {(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          )}
        </div>
        <div className={`p-2 md:p-3 rounded-xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={14} className="md:size-[16px]" />
        </div>
      </div>
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/5">
        <span className="text-[7px] md:text-[10px] font-black text-white/30 uppercase tracking-widest leading-none">{sub}</span>
      </div>
    </div>
  );
};

// Fix Error 1: Use 'any' to avoid Property 'key' does not exist and Promise return type errors
const BalanceItem = ({ item, onUpdateBalance }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(item.balance.toString());

  useEffect(() => {
    if (!isEditing) setVal(item.balance.toString());
  }, [item.balance, isEditing]);

  return (
    <div className="bg-slate-50 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
        <div className="p-2.5 md:p-3 bg-white rounded-xl text-slate-400 shadow-sm text-sm md:text-lg shrink-0">{item.icon || '🏦'}</div>
        <div className="min-w-0">
          <h5 className="text-[10px] md:text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">{item.name}</h5>
          <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase">Saldo</p>
        </div>
      </div>
      {isEditing ? (
        <input 
          autoFocus
          type="number"
          className="w-20 md:w-24 bg-white border-2 border-indigo-200 rounded-xl px-2 py-1 font-mono font-black text-xs outline-none"
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={() => { 
            const numVal = parseFloat(val);
            if (!isNaN(numVal)) onUpdateBalance(numVal);
            setIsEditing(false); 
          }}
          onKeyDown={e => e.key === 'Enter' && (e.target as any).blur()}
        />
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="text-xs md:text-sm font-black text-slate-900 font-mono tracking-tighter cursor-pointer px-2 py-1.5 hover:bg-indigo-50 rounded-lg transition-all"
        >
          {(item.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </div>
      )}
    </div>
  );
};

// Fix Error 2 & 3: Add missing EmptyAsset component
const EmptyAsset = ({ message, icon: Icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-[28px] md:rounded-[32px] hover:border-indigo-200 hover:bg-slate-50 transition-all gap-2 w-full"
  >
    <div className="p-2 bg-slate-50 text-slate-300 rounded-lg"><Icon size={20} /></div>
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{message}</span>
  </button>
);

const SimpleCardItem = ({ item, onUpdateBalance, onUpdateDate, onUpdateStatus }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(item.balance.toString());

  useEffect(() => {
    if (!isEditing) setVal(item.balance.toString());
  }, [item.balance, isEditing]);

  return (
    <div className="bg-slate-50 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 space-y-3 md:space-y-4 group hover:bg-white hover:shadow-xl transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="p-2.5 md:p-3 bg-white rounded-xl text-rose-400 shadow-sm text-sm md:text-lg shrink-0">💳</div>
          <div className="min-w-0">
            <h5 className="text-[10px] md:text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">{item.name}</h5>
            <input 
              type="date" 
              value={item.dueDate || ''} 
              onChange={e => onUpdateDate(e.target.value)}
              className="bg-transparent text-[8px] font-black text-slate-400 uppercase outline-none block mt-0.5"
            />
          </div>
        </div>
        <button 
          onClick={() => onUpdateStatus(item.situation === 'PAGO' ? 'PENDENTE' : 'PAGO')}
          className={`px-2 py-1 rounded-lg text-[7px] md:text-[8px] font-black uppercase border-2 shrink-0 ${item.situation === 'PAGO' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}
        >
          {item.situation}
        </button>
      </div>
      <div className="flex justify-between items-center bg-white/50 p-3 rounded-xl">
        <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Fatura</span>
        {isEditing ? (
          <input 
            autoFocus
            type="number"
            className="w-16 md:w-20 bg-white border-2 border-indigo-200 rounded-xl px-2 py-1 font-mono font-black text-[10px] outline-none"
            value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={() => { 
              const numVal = parseFloat(val);
              if (!isNaN(numVal)) onUpdateBalance(numVal);
              setIsEditing(false); 
            }}
            onKeyDown={e => e.key === 'Enter' && (e.target as any).blur()}
          />
        ) : (
          <span onClick={() => setIsEditing(true)} className="text-xs md:text-sm font-black text-rose-600 font-mono tracking-tighter cursor-pointer">
            {(item.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isConfirmDupOpen, setIsConfirmDupOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(0);
  
  const now = useMemo(() => new Date(), []);
  const initialMonth = MONTHS[now.getMonth()];
  const initialYear = now.getFullYear();
  const todayStr = format(now, 'yyyy-MM-dd');

  const [appState, setAppState] = useState<AppState>({
    currentMonth: initialMonth,
    currentYear: initialYear,
    data: [],
    categories: DEFAULT_CATEGORIES,
    partners: [],
    view: 'dashboard',
    searchTerm: '',
    statusFilter: 'ALL',
    aiMinimized: true,
    userProfile: { 
      email: '', 
      name: '', 
      company: 'Minha Empresa', 
      defaultMeta: 0, 
      globalAssets: [], 
      planId: 'PRO', 
      subscriptionStatus: 'TRIAL', 
      createdAt: '', 
      trialEnd: '' 
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modalPreType, setModalPreType] = useState<'Receita' | 'Despesa' | undefined>(undefined);
  const [editingTransaction, setEditingTransaction] = useState<BaseTransaction | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    
    // Listener de dados mensais
    const unsubData = onSnapshot(query(collection(db, `users/${user.uid}/data`)), 
      (snap) => {
        const dataArr = snap.docs.map(d => ({
          ...d.data(),
          transactions: Array.isArray(d.data().transactions) ? d.data().transactions : [],
          balances: d.data().balances || {},
          cardDetails: d.data().cardDetails || {},
          reserva: d.data().reserva || 0,
        } as FinancialData));
        setAppState(prev => ({ ...prev, data: dataArr }));
      },
      (error) => {
        if (error.code !== 'permission-denied') console.warn("Snapshot Data Error:", error.message);
      }
    );

    // Listener de perfil
    const unsubProfile = onSnapshot(doc(db, `users/${user.uid}/profile`, 'settings'), 
      (docSnap) => {
        if (docSnap.exists()) {
          setAppState(prev => ({ ...prev, userProfile: docSnap.data() as UserProfile }));
        }
      },
      (error) => {
        if (error.code !== 'permission-denied') console.warn("Snapshot Profile Error:", error.message);
      }
    );

    // Listener de categorias
    const unsubCategories = onSnapshot(query(collection(db, `users/${user.uid}/categories`)), 
      (snap) => {
        if (!snap.empty) setAppState(prev => ({ ...prev, categories: snap.docs.map(d => d.data() as Category) }));
      },
      (error) => {
        if (error.code !== 'permission-denied') console.warn("Snapshot Categories Error:", error.message);
      }
    );

    // Listener de parceiros
    const unsubPartners = onSnapshot(query(collection(db, `users/${user.uid}/partners`)), 
      (snap) => {
        setAppState(prev => ({ ...prev, partners: snap.docs.map(d => d.data() as Partner) }));
      },
      (error) => {
        if (error.code !== 'permission-denied') console.warn("Snapshot Partners Error:", error.message);
      }
    );

    // Listener de uso diário IA
    const usageRef = doc(db, `users/${user.uid}/usage`, todayStr);
    const unsubUsage = onSnapshot(usageRef, (docSnap) => {
      if (docSnap.exists()) {
        setDailyUsage(docSnap.data().count || 0);
      } else {
        setDailyUsage(0);
      }
    });

    return () => {
      unsubData();
      unsubProfile();
      unsubCategories();
      unsubPartners();
      unsubUsage();
    };
  }, [user, todayStr]);

  const userEmail = (user?.email || '').toLowerCase();
  const isAdmin = ADMIN_EMAILS.includes(userEmail);
  const isTrial = appState.userProfile?.subscriptionStatus === 'TRIAL';
  const isPaid = appState.userProfile?.subscriptionStatus === 'ACTIVE' || appState.userProfile?.subscriptionStatus === 'PENDING';
  const isMaster = appState.userProfile?.planId === 'MASTER' || isAdmin;
  const isPro = appState.userProfile?.planId === 'PRO' || isMaster;

  const isFeatureLocked = (viewId: string) => {
    if (isAdmin) return false;
    if (isTrial) {
      if (viewId === 'analytics' || viewId === 'partners') return true;
    }
    if (viewId === 'analytics' && !isPro) return true;
    if (viewId === 'partners' && !isPro) return true;
    return false;
  };

  const daysRemainingTrial = useMemo(() => {
    if (!isTrial) return 0;
    const createdAtStr = appState.userProfile?.createdAt;
    const createdAt = createdAtStr ? parseISO(createdAtStr) : now;
    const updateCutoff = new Date('2025-12-18T18:00:00Z');
    const trialDuration = createdAt < updateCutoff ? 30 : 7;
    const end = addDays(createdAt, trialDuration);
    return Math.max(0, differenceInDays(end, now));
  }, [isTrial, appState.userProfile?.createdAt, now]);

  const currentMonthId = useMemo(() => {
    const mIdx = MONTHS.indexOf(appState.currentMonth) + 1;
    return `${appState.currentYear}-${mIdx.toString().padStart(2, '0')}`;
  }, [appState.currentMonth, appState.currentYear]);

  const currentMonthData = useMemo(() => {
    const found = appState.data.find(d => {
      const mIdx = MONTHS.indexOf(d.month) + 1;
      const dId = `${d.year}-${mIdx.toString().padStart(2, '0')}`;
      return dId === currentMonthId;
    });

    const baseData = found || {
      month: appState.currentMonth,
      year: appState.currentYear,
      metaFaturamento: appState.userProfile?.defaultMeta || 0, 
      transactions: [],
      balances: {},
      cardDetails: {},
      reserva: 0,
      reservaCurrency: 'BRL',
      investimento: 0,
      retorno: 0
    } as FinancialData;

    const accounts = (appState.userProfile?.globalAssets || [])
      .filter(a => a.type === 'bank')
      .map(asset => ({
        ...asset,
        balance: baseData.balances[asset.id] || 0
      })) as AccountItem[];

    const creditCards = (appState.userProfile?.globalAssets || [])
      .filter(a => a.type === 'card')
      .map(asset => ({
        ...asset,
        balance: baseData.balances[asset.id] || 0,
        dueDate: baseData.cardDetails?.[asset.id]?.dueDate || `${appState.currentYear}-${(MONTHS.indexOf(appState.currentMonth) + 1).toString().padStart(2, '0')}-10`,
        situation: baseData.cardDetails?.[asset.id]?.situation || 'PENDENTE'
      })) as CreditCardItem[];

    return { ...baseData, accounts, creditCards };
  }, [currentMonthId, appState.data, appState.userProfile, appState.currentMonth, appState.currentYear]);

  const totals = useMemo(() => {
    const txs = currentMonthData.transactions || [];
    const pendingIncomes = txs.filter(t => t.type === 'Receita' && t.situation !== 'PAGO' && t.situation !== 'CANCELADO').reduce((acc, t) => acc + (Number(t.value) || 0), 0);
    const totalIncomes = txs.filter(t => t.type === 'Receita' && t.situation !== 'CANCELADO').reduce((acc, t) => acc + (Number(t.value) || 0), 0);
    const pendingTransactionsExpenses = txs.filter(t => t.type === 'Despesa' && t.situation !== 'PAGO' && t.situation !== 'CANCELADO').reduce((acc, t) => acc + (Number(t.value) || 0), 0);
    const totalTransactionsExpenses = txs.filter(t => t.type === 'Despesa' && t.situation !== 'CANCELADO').reduce((acc, t) => acc + (Number(t.value) || 0), 0);
    const pendingCardDebt = currentMonthData.creditCards.filter(c => c.situation !== 'PAGO').reduce((acc, c) => acc + (Number(c.balance) || 0), 0);
    const totalCardDebtMonth = currentMonthData.creditCards.reduce((acc, c) => acc + (Number(c.balance) || 0), 0);
    const totalPendingOutflows = pendingTransactionsExpenses + pendingCardDebt;
    const availableCash = currentMonthData.accounts.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);
    const reservaValue = Number(currentMonthData.reserva) || 0;
    const liquidHealthNoReserva = (availableCash + pendingIncomes) - totalPendingOutflows;
    const liquidHealthWithReserva = liquidHealthNoReserva + reservaValue;

    const cashFlowAlerts: any[] = [];
    let runningBalance = availableCash;
    const allEvents = [
      ...txs.filter(t => t.situation !== 'PAGO' && t.situation !== 'CANCELADO'),
      ...currentMonthData.creditCards.filter(c => c.situation !== 'PAGO').map(c => ({
        id: c.id, value: c.balance, dueDate: c.dueDate || '', type: 'Despesa' as const, description: `Cartão: ${c.name}`
      }))
    ].sort((a,b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

    const dates = Array.from(new Set(allEvents.map(e => e.dueDate))).filter(d => !!d);
    dates.forEach(dateStr => {
      const dayEvents = allEvents.filter(e => e.dueDate === dateStr);
      const dayIn = dayEvents.filter(e => e.type === 'Receita').reduce((acc, e) => acc + e.value, 0);
      const dayOut = dayEvents.filter(e => e.type === 'Despesa').reduce((acc, e) => acc + e.value, 0);
      runningBalance = runningBalance + dayIn - dayOut;
      if (runningBalance < 0) {
        cashFlowAlerts.push({ 
          type: 'ruptura', title: 'Atenção: Fluxo Negativo', 
          message: `Saldo projetado para ficar em ${runningBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} no dia ${format(parseISO(dateStr), 'dd/MM')}.`,
          date: dateStr 
        });
      }
    });

    return { 
      totalIncomes, availableCash, pendingCardDebt, pendingIncomes, reservaValue,
      totalPendingOutflows, totalExpenses: totalTransactionsExpenses + totalCardDebtMonth,
      liquidHealthWithReserva, liquidHealthNoReserva, pendingExpenses: totalPendingOutflows,
      cashFlowAlerts
    };
  }, [currentMonthData, now]);

  const updateBalanceInMonth = async (assetId: string, newBalance: number) => {
    if (!user) return;
    const currentBalances = { ...(currentMonthData.balances || {}) };
    currentBalances[assetId] = newBalance;
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, balances: currentBalances }, { merge: true });
  };

  const updateCardDetail = async (assetId: string, field: 'dueDate' | 'situation', value: any) => {
    if (!user) return;
    const currentDetails = { ...(currentMonthData.cardDetails || {}) };
    currentDetails[assetId] = { ...(currentDetails[assetId] || {}), [field]: value };
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, cardDetails: currentDetails }, { merge: true });
  };

  const updateReservaInMonth = async (newReserva: number) => {
    if (!user) return;
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, reserva: newReserva }, { merge: true });
  };

  const handleReorderTransactions = async (newTransactions: BaseTransaction[]) => {
    if (!user) return;
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, transactions: newTransactions }, { merge: true });
  };

  const updateUserProfile = async (profile: UserProfile) => {
    if (!user) return;
    await setDoc(doc(db, `users/${user.uid}/profile`, 'settings'), profile, { merge: true });
  };

  // Fix Error 4: Define missing handleUpgradeSuccess function
  const handleUpgradeSuccess = async (plan: PlanId) => {
    if (!user) return;
    const newProfile: UserProfile = {
      ...appState.userProfile,
      planId: plan,
      subscriptionStatus: 'ACTIVE'
    };
    await updateUserProfile(newProfile);
    setIsPricingOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-inter overflow-x-hidden pb-10 relative w-full items-center">
      
      {/* BARRA DE AVISO TRIAL */}
      {isTrial && !isAdmin && (
        <div className="bg-indigo-600 px-4 md:px-6 py-2.5 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-white animate-in slide-in-from-top duration-700 sticky top-0 z-[110] shadow-2xl border-b border-white/10 w-full text-center">
           <div className="flex items-center gap-2 md:gap-3">
              <Sparkles size={14} fill="currentColor" className="text-amber-400 animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">PERÍODO DE TESTE PRO: <strong>{daysRemainingTrial} DIAS</strong></span>
           </div>
           <button 
             onClick={() => setIsPricingOpen(true)} 
             className="px-4 py-1.5 bg-white text-indigo-600 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-1.5"
           >
             <Crown size={10} fill="currentColor" /> Ativar Definitivo
           </button>
        </div>
      )}

      {/* HEADER AJUSTADO MOBILE */}
      <header className={`bg-white/95 border-b border-slate-200 sticky z-[100] backdrop-blur-2xl shadow-sm w-full max-w-screen-2xl transition-all ${isTrial && !isAdmin ? 'top-0 md:top-[44px]' : 'top-0'}`}>
        <div className="px-4 lg:px-10 h-16 md:h-24 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-4 cursor-pointer group shrink-0" onClick={() => setAppState(prev => ({...prev, view: 'dashboard'}))}>
            <div className="bg-[#020617] p-2 md:p-3.5 rounded-xl md:rounded-2xl text-white shadow-lg group-hover:bg-indigo-600 transition-all flex items-center justify-center">
              <Activity size={16} className="md:size-[20px]" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base md:text-xl font-black text-slate-900 tracking-tighter leading-none uppercase">Cria Gestão <span className="text-indigo-600">Pro</span></h1>
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">{appState.userProfile?.company}</p>
            </div>
          </div>

          <div className="flex-1 flex justify-center max-w-[180px] sm:max-w-none">
            <div className="flex items-center bg-slate-100/60 rounded-full p-0.5 md:p-1 border border-slate-200 shadow-inner w-full sm:w-auto">
              <button onClick={() => { let mIdx = MONTHS.indexOf(appState.currentMonth); let y = appState.currentYear; if (mIdx === 0) { mIdx = 11; y--; } else { mIdx--; } setAppState(prev => ({...prev, currentMonth: MONTHS[mIdx], currentYear: y})); }} className="p-1.5 md:p-3 hover:bg-white rounded-full text-slate-500 transition-all flex-shrink-0 active:scale-90"><ChevronLeft size={16} /></button>
              <div className="flex-1 px-2 sm:px-10 text-center min-w-[70px] sm:min-w-[150px] flex flex-col justify-center">
                <span className="text-[9px] sm:text-[11px] font-black text-slate-900 uppercase tracking-widest block leading-none truncate">{appState.currentMonth}</span>
                <span className="text-[7px] sm:text-[9px] font-black text-indigo-500 uppercase block mt-0.5 tracking-tighter">{appState.currentYear}</span>
              </div>
              <button onClick={() => { let mIdx = MONTHS.indexOf(appState.currentMonth); let y = appState.currentYear; if (mIdx === 11) { mIdx = 0; y++; } else { mIdx++; } setAppState(prev => ({...prev, currentMonth: MONTHS[mIdx], currentYear: y})); }} className="p-1.5 md:p-3 hover:bg-white rounded-full text-slate-500 transition-all flex-shrink-0 active:scale-90"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className="relative">
               <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`p-2 md:p-3.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl md:rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm relative active:scale-90 ${isNotificationsOpen ? 'bg-indigo-600 text-white' : ''}`}>
                 <Bell size={18} className="md:size-[20px]" />
                 {totals.cashFlowAlerts.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-rose-500 text-white text-[8px] md:text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md">{totals.cashFlowAlerts.length}</span>}
               </button>
               {isNotificationsOpen && (
                 <>
                   <div className="fixed inset-0 z-[110]" onClick={() => setIsNotificationsOpen(false)}></div>
                   <div className="absolute top-full right-0 mt-3 w-[280px] md:w-[380px] bg-white border border-slate-200 rounded-[24px] md:rounded-[32px] shadow-4xl z-[120] overflow-hidden animate-in slide-in-from-top-4 duration-300">
                      <div className="px-5 py-4 bg-[#020617] flex items-center justify-between"><span className="text-[9px] font-black text-white uppercase tracking-widest">Alertas ({totals.cashFlowAlerts.length})</span><button onClick={() => setIsNotificationsOpen(false)} className="text-white/40 hover:text-white"><X size={14}/></button></div>
                      <div className="max-h-[300px] md:max-h-[420px] overflow-y-auto no-scrollbar p-3 md:p-4 space-y-2.5 md:space-y-3 bg-white">
                         {totals.cashFlowAlerts.length > 0 ? totals.cashFlowAlerts.map((alert, i) => (
                           <div key={i} className={`p-3 md:p-4 rounded-xl md:rounded-2xl border flex items-start gap-2.5 transition-all hover:bg-slate-50 ${alert.type === 'ruptura' ? 'bg-rose-50 border-rose-100' : alert.type === 'vencimento' ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100'}`}>
                              <div className={`p-1.5 md:p-2 rounded-lg shrink-0 ${alert.type === 'ruptura' ? 'bg-rose-500 text-white' : alert.type === 'vencimento' ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white'}`}>{alert.type === 'ruptura' ? <TrendingDown size={12}/> : alert.type === 'vencimento' ? <CalendarDays size={12}/> : <Info size={12}/>}</div>
                              <div className="min-w-0"><h5 className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-0.5 truncate ${alert.type === 'ruptura' ? 'text-rose-600' : alert.type === 'vencimento' ? 'text-amber-600' : 'text-indigo-600'}`}>{alert.title}</h5><p className="text-[9px] md:text-[10px] text-slate-600 font-medium leading-tight">{alert.message}</p></div>
                           </div>
                         )) : <div className="py-10 text-center flex flex-col items-center gap-2"><ShieldCheck className="text-emerald-500" size={32} /><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tudo em dia!</p></div>}
                      </div>
                      <div className="p-3 bg-slate-50 border-t border-slate-100"><button onClick={() => { setIsNotificationsOpen(false); setAppState(prev => ({...prev, view: 'calendar'})); }} className="w-full py-3 bg-white border border-slate-200 text-[8px] font-black text-slate-400 uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all">Ver Agenda</button></div>
                   </div>
                 </>
               )}
            </div>

            <button onClick={() => setIsSettingsOpen(true)} className="p-2 md:p-3.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl md:rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90"><Settings size={18} className="md:size-[20px]" /></button>
            <button onClick={() => signOut(auth)} className="p-2 md:p-3.5 bg-rose-50 text-rose-500 rounded-xl md:rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-90"><LogOut size={18} className="md:size-[20px]" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-3 md:px-10 py-5 md:py-10 w-full space-y-6 md:space-y-12">
        {/* NAVEGAÇÃO MOBILE CENTRALIZADA */}
        <div className="flex justify-center w-full">
          <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-full shadow-lg overflow-x-auto no-scrollbar w-full max-w-fit md:max-w-none">
            {[
              { id: 'dashboard', label: 'Estratégia', icon: LayoutDashboard }, 
              { id: 'analytics', label: 'Análise', icon: BarChart3 }, 
              { id: 'transactions', label: 'Fluxo', icon: List }, 
              { id: 'partners', label: 'Parceiros', icon: Users }, 
              { id: 'calendar', label: 'Agenda', icon: Calendar }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => {
                  if (isFeatureLocked(tab.id)) { setIsPricingOpen(true); return; }
                  setAppState(prev => ({ ...prev, view: tab.id as any }))
                }} 
                className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-10 py-2.5 md:py-3.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap relative ${appState.view === tab.id ? 'bg-[#020617] text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {isFeatureLocked(tab.id) && <Lock size={10} className="absolute top-1 right-2 text-rose-400" />}
                <tab.icon size={12} className="md:size-[16px]" /> <span className="hidden xs:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {isFeatureLocked(appState.view) ? (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 bg-white rounded-[32px] md:rounded-[40px] border-4 border-dashed border-slate-100 text-center gap-4 md:gap-6 px-6">
             <div className="p-6 md:p-10 bg-rose-50 text-rose-500 rounded-full"><Lock size={40} className="md:size-[64px]"/></div>
             <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase">Recurso Bloqueado</h3>
             <p className="max-w-md text-[11px] md:text-sm text-slate-500 font-medium leading-relaxed">
               Este recurso está disponível apenas em planos superiores. Ative seu upgrade para liberar acesso total.
             </p>
             <button onClick={() => setIsPricingOpen(true)} className="px-10 py-4 md:py-5 bg-indigo-600 text-white rounded-2xl md:rounded-3xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5"><Rocket size={16}/> Ver Upgrade</button>
          </div>
        ) : (
          <div className="w-full">
            {appState.view === 'dashboard' && (
              <div className="space-y-6 md:space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 w-full">
                {/* KPIs GRID AJUSTADO MOBILE */}
                <div className="bg-[#0f172a] p-3 md:p-12 rounded-[24px] md:rounded-[56px] shadow-3xl relative overflow-hidden border border-white/5">
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/5 pointer-events-none"></div>
                   <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 md:gap-8 relative z-10">
                      <KPIItem label="Bancos" value={totals.availableCash} color="text-white" icon={Wallet} sub="Liquidez total" />
                      <KPIItem label="A Receber" value={totals.pendingIncomes} color="text-emerald-400" icon={ArrowUpRight} sub="Entradas" />
                      <KPIItem label="A Pagar" value={totals.pendingExpenses} color="text-rose-400" icon={ArrowDownCircle} sub="Saídas" />
                      <KPIItem label="Reserva" isEditable value={totals.reservaValue} color="text-indigo-400" icon={PiggyBank} sub="Investimentos" onUpdateValue={updateReservaInMonth} />
                      <div className={`col-span-2 lg:col-span-1 p-4 md:p-10 rounded-[24px] md:rounded-[48px] border-2 flex flex-col justify-between transition-all hover:scale-[1.02] ${totals.liquidHealthNoReserva >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 shadow-md' : 'bg-rose-500/10 border-rose-500/20 shadow-md'}`}>
                         <div><span className="text-[7px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-1.5 md:mb-3">Saúde Líquida</span><div className={`text-base md:text-2xl font-black font-mono tracking-tighter ${totals.liquidHealthNoReserva >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{(totals.liquidHealthNoReserva || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></div>
                         <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/5"><span className="text-[7px] md:text-[10px] font-black text-white/40 uppercase tracking-widest block">Projeção</span><span className={`text-[9px] md:text-[11px] font-black font-mono ${totals.liquidHealthWithReserva >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>{(totals.liquidHealthWithReserva || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12 w-full">
                   <div className="lg:col-span-2 space-y-6 md:space-y-12">
                      <div className="bg-white p-4 md:p-14 rounded-[28px] md:rounded-[56px] border border-slate-200 shadow-xl space-y-5 md:space-y-10">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 md:pb-8"><h4 className="text-[9px] md:text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-2 md:gap-3"><Landmark size={16} className="text-indigo-50 text-indigo-500" /> Bancos</h4></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-8">
                          {currentMonthData.accounts.map(acc => ( <BalanceItem key={acc.id} item={acc} onUpdateBalance={v => updateBalanceInMonth(acc.id, v)} /> ))}
                          {currentMonthData.accounts.length === 0 && <EmptyAsset message="Config. Bancos" icon={Landmark} onClick={() => setIsSettingsOpen(true)} />}
                        </div>
                      </div>
                   </div>
                   <div className="bg-white p-4 md:p-12 rounded-[28px] md:rounded-[56px] border border-slate-200 shadow-xl space-y-5 md:space-y-10">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3 md:pb-8"><h4 className="text-[9px] md:text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-2 md:gap-3"><CardIcon size={16} className="text-rose-500" /> Cartões</h4></div>
                      <div className="space-y-3 md:space-y-6">
                        {currentMonthData.creditCards.map(card => ( <SimpleCardItem key={card.id} item={card} onUpdateBalance={(v: any) => updateBalanceInMonth(card.id, v)} onUpdateDate={(d: any) => updateCardDetail(card.id, 'dueDate', d)} onUpdateStatus={(s: any) => updateCardDetail(card.id, 'situation', s)} /> ))}
                        {currentMonthData.creditCards.length === 0 && <EmptyAsset message="Config. Cartões" icon={CardIcon} onClick={() => setIsSettingsOpen(true)} />}
                      </div>
                   </div>
                </div>
              </div>
            )}
            {appState.view === 'transactions' && <SplitTransactionView transactions={currentMonthData.transactions || []} categories={appState.categories} partners={appState.partners} onToggleStatus={id => { const txs = currentMonthData.transactions.map(t => t.id === id ? { ...t, situation: (['PENDENTE','AGENDADO','PAGO','CANCELADO'] as Situation[])[(['PENDENTE','AGENDADO','PAGO','CANCELADO'].indexOf(t.situation) + 1) % 4] } : t); handleReorderTransactions(txs); }} onDelete={id => handleReorderTransactions(currentMonthData.transactions.filter(t => t.id !== id))} onEdit={tx => { setEditingTransaction(tx); setIsModalOpen(true); }} onAddNew={type => { setModalPreType(type); setEditingTransaction(undefined); setIsModalOpen(true); }} onQuickUpdate={(id, f, v) => handleReorderTransactions(currentMonthData.transactions.map(t => t.id === id ? { ...t, [f]: v } : t))} totals={totals} onReorder={handleReorderTransactions} />}
            {appState.view === 'partners' && <PartnerManager partners={appState.partners} onAdd={p => setDoc(doc(db, `users/${user.uid}/partners`, p.id), p)} onDelete={id => deleteDoc(doc(db, `users/${user.uid}/partners`, id))} onUpdate={p => updateDoc(doc(db, `users/${user.uid}/partners`, p.id), { ...p })} />}
            {appState.view === 'calendar' && <CalendarView month={appState.currentMonth} year={appState.currentYear} transactions={currentMonthData.transactions || []} />}
            {appState.view === 'analytics' && <AnalyticsView monthData={currentMonthData} totals={totals} />}
          </div>
        )}
      </main>

      <PricingPage isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} userProfile={appState.userProfile} onUpgrade={handleUpgradeSuccess} />
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={tx => { const txs = [...currentMonthData.transactions]; const idx = txs.findIndex(t => t.id === tx.id); if (idx >= 0) txs[idx] = tx; else txs.push(tx); handleReorderTransactions(txs); }} categories={appState.categories} initialData={editingTransaction} defaultType={modalPreType} defaultMonthRef={`${appState.currentMonth.slice(0,3)}/${appState.currentYear}`} />
      <CategoryModal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} categories={appState.categories} onSaveCategories={cats => cats.forEach(c => setDoc(doc(db, `users/${user.uid}/categories`, c.id), c))} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} userProfile={appState.userProfile} userEmail={user.email || ''} onSaveProfile={updateUserProfile} />
      <OnboardingGuide isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} userName={appState.userProfile?.name || ''} />
      <ConfirmModal isOpen={isConfirmDupOpen} title="Duplicar Mês?" message="Copia todos os dados fixos e transações?" onConfirm={() => setIsConfirmDupOpen(false)} onCancel={() => setIsConfirmDupOpen(false)} />
    </div>
  );
};

export default Dashboard;
