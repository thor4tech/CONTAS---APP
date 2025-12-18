
import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../lib/firebase';
import { signOut, type User } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, query, deleteDoc, updateDoc, getDoc, orderBy } from 'firebase/firestore';
import { MONTHS, DEFAULT_CATEGORIES } from '../constants';
import { AppState, FinancialData, BaseTransaction, Situation, Category, Partner, UserProfile, AccountItem, CreditCardItem, PlanId, SubscriptionStatus } from '../types';
import SplitTransactionView from './SplitTransactionView';
import PartnerManager from './PartnerManager';
import CalendarView from './CalendarView';
import TransactionModal from './TransactionModal';
import SettingsModal from './SettingsModal';
import AnalyticsView from './AnalyticsView';
import PricingPage from './PricingPage';
import { ADMIN_EMAILS, checkUserAccess } from '../lib/subscription';
import { 
  Wallet, ChevronLeft, ChevronRight, LayoutDashboard, 
  Calendar, List, Users, Activity, LogOut, 
  CreditCard, Landmark, ArrowDownCircle, Zap, 
  Settings, ShieldCheck, CreditCard as CardIcon, 
  BarChart3, PiggyBank, Copy, ArrowUpRight, X, 
  Sparkles, FilterX, LayoutTemplate, CheckCircle2, Clock, AlertTriangle, Bell, Shield,
  Eye, EyeOff
} from 'lucide-react';

interface DashboardProps {
  user: User;
}

const BalanceItem = ({ item, onUpdateBalance, onFilter, isActive, onUpdateStatus, onUpdateDate, showValues }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(item.balance?.toString() || "0");

  useEffect(() => {
    if (!isEditing) setVal(item.balance?.toString() || "0");
  }, [item.balance, isEditing]);

  const finishEdit = () => {
    const numVal = parseFloat(val);
    if (!isNaN(numVal)) onUpdateBalance(numVal);
    setIsEditing(false); 
  };

  const formatValue = (v: number) => {
    if (!showValues) return 'R$ ••••••';
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className={`bg-white p-5 md:p-6 rounded-[32px] border transition-all flex flex-col gap-4 shadow-sm ${isActive ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/30' : 'border-slate-100 hover:shadow-md'}`}>
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-4 overflow-hidden">
          <div onClick={onFilter} className={`p-3 rounded-2xl shadow-sm cursor-pointer transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-blue-600'}`}>
            {item.icon || (item.type === 'bank' ? '🏦' : '💳')}
          </div>
          <div className="min-w-0">
            <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate">{item.name}</h5>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Saldo</p>
          </div>
        </div>
        {isEditing ? (
          <input autoFocus type="number" className="w-24 bg-white border-2 border-blue-200 rounded-xl px-2 py-1 font-mono font-black text-xs outline-none" value={val} onChange={e => setVal(e.target.value)} onBlur={finishEdit} onKeyDown={e => e.key === 'Enter' && finishEdit()} />
        ) : (
          <div onClick={() => setIsEditing(true)} className="text-sm font-black text-slate-900 font-mono tracking-tighter cursor-pointer px-3 py-1.5 hover:bg-blue-50 rounded-xl transition-all">
            {formatValue(item.balance || 0)}
          </div>
        )}
      </div>
      
      {item.type === 'card' && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dia:</span>
            <input 
              type="text" 
              placeholder="00"
              value={item.dueDate || ''} 
              onChange={e => onUpdateDate(e.target.value)}
              className="w-10 text-[13px] font-black text-blue-600 bg-slate-50 rounded-lg px-2 py-1 outline-none border border-transparent focus:border-blue-200 text-center"
            />
          </div>
          <button 
            onClick={onUpdateStatus}
            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${item.situation === 'PAGO' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-100'}`}
          >
            {item.situation || 'PENDENTE'}
          </button>
        </div>
      )}
    </div>
  );
};

const KPIItem = ({ label, value, sub, icon: Icon, color, isEditable, onUpdateValue, special, showValues }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value.toString());

  const finishEdit = () => {
    const numVal = parseFloat(localVal);
    if (!isNaN(numVal)) onUpdateValue?.(numVal); 
    setIsEditing(false); 
  };

  const formatValue = (v: number) => {
    if (!showValues) return 'R$ ••••••';
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className={`flex flex-col justify-between p-5 md:p-6 rounded-[32px] border transition-all group h-full shadow-2xl ${special ? 'bg-indigo-600/10 border-indigo-500/20 shadow-indigo-500/5' : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] block mb-2 ${special ? 'text-indigo-400' : 'text-white/30'}`}>{label}</span>
          {isEditable && isEditing ? (
            <input autoFocus type="number" className="bg-transparent border-b-2 border-blue-400 text-white font-mono font-black text-lg outline-none w-28" value={localVal} onChange={e => setLocalVal(e.target.value)} onBlur={finishEdit} onKeyDown={e => e.key === 'Enter' && finishEdit()} />
          ) : (
            <div className={`text-lg md:text-xl font-black font-mono tracking-tighter ${color} ${isEditable ? 'cursor-pointer hover:text-white transition-colors' : ''}`} onClick={() => isEditable && setIsEditing(true)}>
              {formatValue(value || 0)}
            </div>
          )}
        </div>
        <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-[18px] backdrop-blur-md border ${special ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' : 'bg-white/5 border-white/10 ' + color} group-hover:scale-110 transition-transform`}>
          <Icon size={18} />
        </div>
      </div>
      <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${special ? 'text-indigo-400/60' : 'text-white/20'}`}>{sub}</span>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [activeAssetFilter, setActiveAssetFilter] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<BaseTransaction | undefined>(undefined);
  const [modalPreType, setModalPreType] = useState<'Receita' | 'Despesa' | undefined>(undefined);

  const now = useMemo(() => new Date(), []);
  const [appState, setAppState] = useState<AppState>({
    currentMonth: MONTHS[now.getMonth()],
    currentYear: now.getFullYear(),
    data: [],
    categories: DEFAULT_CATEGORIES,
    partners: [],
    view: 'dashboard',
    searchTerm: '',
    statusFilter: 'ALL',
    aiMinimized: true,
    userProfile: { email: '', name: '', company: 'Minha Empresa', planId: 'PRO', subscriptionStatus: 'TRIAL', createdAt: '', trialEnd: '', globalAssets: [] }
  });

  useEffect(() => {
    if (!user?.uid) return;

    const profileRef = doc(db, `users/${user.uid}/profile`, 'settings');
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) setAppState(prev => ({ ...prev, userProfile: docSnap.data() as UserProfile }));
    });

    const dataRef = collection(db, `users/${user.uid}/data`);
    const unsubData = onSnapshot(query(dataRef), (snap) => {
      setAppState(prev => ({ ...prev, data: snap.docs.map(d => ({ ...d.data() } as FinancialData)) }));
    });

    const catsRef = collection(db, `users/${user.uid}/categories`);
    const unsubCats = onSnapshot(query(catsRef), (snap) => {
      if (!snap.empty) setAppState(prev => ({ ...prev, categories: snap.docs.map(d => d.data() as Category) }));
    });

    const partnersRef = collection(db, `users/${user.uid}/partners`);
    const unsubPartners = onSnapshot(query(partnersRef), (snap) => {
      setAppState(prev => ({ ...prev, partners: snap.docs.map(d => d.data() as Partner) }));
    });

    return () => { unsubProfile(); unsubData(); unsubCats(); unsubPartners(); };
  }, [user?.uid]);

  const currentMonthId = `${appState.currentYear}-${(MONTHS.indexOf(appState.currentMonth) + 1).toString().padStart(2, '0')}`;
  
  const handlePrevMonth = () => {
    setAppState(prev => {
      let idx = MONTHS.indexOf(prev.currentMonth);
      if (idx === 0) return { ...prev, currentMonth: MONTHS[11], currentYear: prev.currentYear - 1 };
      return { ...prev, currentMonth: MONTHS[idx - 1] };
    });
  };

  const handleNextMonth = () => {
    setAppState(prev => {
      let idx = MONTHS.indexOf(prev.currentMonth);
      if (idx === 11) return { ...prev, currentMonth: MONTHS[0], currentYear: prev.currentYear + 1 };
      return { ...prev, currentMonth: MONTHS[idx + 1] };
    });
  };

  const currentMonthData = useMemo(() => {
    const found = appState.data.find(d => `${d.year}-${(MONTHS.indexOf(d.month) + 1).toString().padStart(2, '0')}` === currentMonthId);
    const base = found || { month: appState.currentMonth, year: appState.currentYear, metaFaturamento: 0, transactions: [], balances: {}, cardDetails: {}, reserva: 0, investimento: 0, retorno: 0, reservaCurrency: 'BRL' as const };
    const assets = appState.userProfile.globalAssets || [];
    const accounts = assets.filter(a => a.type === 'bank').map(a => ({ ...a, balance: (base.balances || {})[a.id] || 0 }));
    const creditCards = assets.filter(a => a.type === 'card').map(a => ({ ...a, balance: (base.balances || {})[a.id] || 0, dueDate: base.cardDetails?.[a.id]?.dueDate || '10', situation: base.cardDetails?.[a.id]?.situation || 'PENDENTE' }));
    return { ...base, accounts, creditCards };
  }, [currentMonthId, appState.data, appState.userProfile]);

  const totals = useMemo(() => {
    const txs = currentMonthData.transactions || [];
    
    // Filtros de Entradas
    const revenues = txs.filter(t => t.type === 'Receita');
    const totalFaturamento = revenues.reduce((a, t) => a + (t.value || 0), 0);
    const paidRevenues = revenues.filter(t => t.situation === 'PAGO').reduce((a, t) => a + (t.value || 0), 0);
    const pendingRevenues = revenues.filter(t => t.situation !== 'PAGO').reduce((a, t) => a + (t.value || 0), 0);
    
    // Filtros de Saídas
    const expenses = txs.filter(t => t.type === 'Despesa');
    const cards = currentMonthData.creditCards;
    
    const paidExpenses = expenses.filter(t => t.situation === 'PAGO').reduce((a, t) => a + (t.value || 0), 0);
    const pendingExpenses = expenses.filter(t => t.situation !== 'PAGO').reduce((a, t) => a + (t.value || 0), 0);
    
    const paidCards = cards.filter(c => c.situation === 'PAGO').reduce((a, c) => a + (c.balance || 0), 0);
    const pendingCards = cards.filter(c => c.situation !== 'PAGO').reduce((a, c) => a + (c.balance || 0), 0);

    const totalPaidOutflows = paidExpenses + paidCards;
    const totalPendingOutflows = pendingExpenses + pendingCards;
    const totalMonthlyDebt = totalPaidOutflows + totalPendingOutflows;

    const availableCash = currentMonthData.accounts.reduce((a, b) => a + (b.balance || 0), 0);
    const reserve = currentMonthData.reserva || 0;
    
    // SAÚDE OPERACIONAL: (Saldo Bancos + Receitas Pendentes) - (Saídas Pendentes)
    const liquidHealthNoReserve = (availableCash + pendingRevenues) - totalPendingOutflows;
    const liquidHealthWithReserve = liquidHealthNoReserve + reserve;
    
    return { 
      availableCash, 
      totalFaturamento,
      paidRevenues,
      pendingRevenues,
      totalMonthlyDebt,
      totalPaidOutflows,
      totalPendingOutflows,
      reserve,
      liquidHealthNoReserve,
      liquidHealthWithReserve
    };
  }, [currentMonthData]);

  const hasHighRisk = totals.liquidHealthWithReserve < 0;

  const updateCardDetail = async (id: string, field: string, val: any) => {
    const details = { ...(currentMonthData.cardDetails || {}) };
    details[id] = { ...(details[id] || {}), [field]: val };
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, cardDetails: details }, { merge: true });
  };

  const handleReorder = async (newTransactions: BaseTransaction[]) => {
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, transactions: newTransactions }, { merge: true });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-inter w-full items-center pb-24 md:pb-10 animate-in fade-in duration-500 overflow-x-hidden">
      
      {appState.userProfile.subscriptionStatus === 'TRIAL' && !ADMIN_EMAILS.includes((appState.userProfile.email || '').toLowerCase()) && (
        <div className="bg-[#3b82f6] px-6 py-3.5 flex items-center justify-center gap-4 text-white sticky top-0 z-[110] w-full text-center shadow-lg">
          <Sparkles size={14} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Teste Ativo: Libere o comando definitivo</span>
          <button onClick={() => setIsPricingOpen(true)} className="px-5 py-1.5 bg-white text-blue-600 rounded-full text-[9px] font-black uppercase shadow-xl">Ativar</button>
        </div>
      )}

      <header className="bg-white/80 border-b border-slate-100 sticky top-0 z-[100] backdrop-blur-2xl w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-[15px] bg-slate-900 text-white font-black text-sm shadow-xl">T</div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-slate-900 uppercase leading-none tracking-tighter">Cria Gestão <span className="text-blue-500">Pro</span></h1>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Thor4Tech</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100/80 rounded-full p-1 border border-slate-200 shadow-inner scale-[0.85] sm:scale-100">
            <button onClick={handlePrevMonth} className="p-3 hover:bg-white rounded-full transition-all text-slate-500"><ChevronLeft size={18} /></button>
            <div className="px-4 md:px-6 text-center min-w-[120px] md:min-w-[150px]">
              <span className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase tracking-widest block leading-none">{appState.currentMonth}</span>
              <span className="text-[8px] md:text-[9px] font-bold text-blue-500 block uppercase mt-1">{appState.currentYear}</span>
            </div>
            <button onClick={handleNextMonth} className="p-3 hover:bg-white rounded-full transition-all text-slate-500"><ChevronRight size={18} /></button>
          </div>

          <div className="flex items-center gap-2">
             <button 
               onClick={() => setShowValues(!showValues)} 
               className={`p-2.5 rounded-2xl transition-all border ${showValues ? 'bg-slate-50 text-slate-400 border-slate-100 hover:text-blue-600' : 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-200'}`}
               title={showValues ? "Ocultar Valores" : "Mostrar Valores"}
             >
               {showValues ? <Eye size={20}/> : <EyeOff size={20}/>}
             </button>
             <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl hover:text-blue-600 hover:bg-white transition-all"><Settings size={20}/></button>
             <button onClick={() => signOut(auth)} className="p-2.5 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"><LogOut size={20}/></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10 w-full space-y-8 flex flex-col items-center">
        
        {/* ALERTA DE RISCO REATIVADO */}
        {hasHighRisk && appState.view === 'dashboard' && (
          <div className="w-full bg-rose-600 text-white p-5 rounded-[32px] flex items-center gap-5 animate-pulse shadow-2xl shadow-rose-200">
             <div className="p-3 bg-white/20 rounded-2xl border border-white/20"><AlertTriangle size={24}/></div>
             <div className="flex-1">
                <h4 className="text-[11px] font-black uppercase tracking-widest">Alerta Crítico de Fluxo</h4>
                <p className="text-[10px] font-bold uppercase text-rose-100">Sua projeção de final de mês está negativa. Revise gastos imediatamente.</p>
             </div>
             <div className="hidden md:block">
               <button onClick={() => setAppState(prev => ({...prev, view: 'transactions'}))} className="px-6 py-2 bg-white text-rose-600 rounded-full text-[9px] font-black uppercase shadow-xl">Auditar Agora</button>
             </div>
          </div>
        )}

        <div className="flex justify-center w-full sticky top-[80px] md:top-[94px] z-[90]">
          <div className="flex items-center gap-1 p-1 bg-white/90 border border-slate-200 rounded-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] backdrop-blur-2xl scale-[0.95] md:scale-100">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Painel' }, 
              { id: 'analytics', icon: BarChart3, label: 'Estratégia' }, 
              { id: 'transactions', icon: List, label: 'Fluxos' }, 
              { id: 'partners', icon: Users, label: 'CRM' }, 
              { id: 'calendar', icon: Calendar, label: 'Agenda' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setAppState(prev => ({ ...prev, view: tab.id as any }))}
                className={`flex items-center gap-2 px-4 py-3 md:px-7 md:py-4 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${appState.view === tab.id ? 'bg-[#020617] text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <tab.icon size={16} /> <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {appState.view === 'dashboard' && (
          <div className="space-y-8 w-full animate-in slide-in-from-bottom-5 duration-700 max-w-7xl">
             {/* PAINEL DARK FLOW OTIMIZADO */}
             <div className="bg-[#0f172a] p-6 md:p-10 rounded-[40px] md:rounded-[48px] shadow-4xl relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 p-10 opacity-5 text-blue-500 hidden md:block"><Activity size={200}/></div>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-5 relative z-10">
                   <KPIItem showValues={showValues} label="Liquidez Real" value={totals.availableCash} color="text-white" icon={Wallet} sub="Saldo Bancos" />
                   <KPIItem showValues={showValues} label="A Receber" value={totals.pendingRevenues} color="text-emerald-400" icon={ArrowUpRight} sub="Entradas Pendentes" />
                   <KPIItem showValues={showValues} label="Dívida Total" value={totals.totalMonthlyDebt} color="text-rose-400" icon={ArrowDownCircle} sub="Saídas do Mês" />
                   <KPIItem showValues={showValues} label="Reserva" isEditable value={totals.reserve} color="text-blue-400" icon={PiggyBank} sub="Fundo Estratégico" onUpdateValue={(v: number) => setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, reserva: v }, { merge: true })} />
                   
                   <div className={`p-5 md:p-6 rounded-[32px] border-2 flex flex-col justify-between transition-all ${totals.liquidHealthNoReserve >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5' : 'bg-rose-500/10 border-rose-500/20 shadow-rose-500/5'}`}>
                      <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Saúde Operacional</span>
                      <div className={`text-base md:text-lg font-black font-mono tracking-tighter ${totals.liquidHealthNoReserve >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {showValues ? totals.liquidHealthNoReserve.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ ••••••'}
                      </div>
                      <div className="mt-2 p-1.5 bg-white/5 rounded-xl self-end text-white/40 border border-white/5"><Activity size={14}/></div>
                   </div>

                   <div className={`p-5 md:p-6 rounded-[32px] border-2 flex flex-col justify-between transition-all ${totals.liquidHealthWithReserve >= 0 ? 'bg-indigo-500/20 border-indigo-400/40 shadow-indigo-500/10' : 'bg-rose-500/20 border-rose-500/40 shadow-rose-500/10'}`}>
                      <span className="text-[8px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-3">Saúde Patrimonial</span>
                      <div className={`text-lg md:text-xl font-black font-mono tracking-tighter ${totals.liquidHealthWithReserve >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                        {showValues ? totals.liquidHealthWithReserve.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ ••••••'}
                      </div>
                      <div className="mt-2 p-1.5 bg-indigo-50 text-white rounded-xl self-end shadow-md"><Shield size={14}/></div>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <div className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-100 shadow-2xl">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-6">
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3"><Landmark size={18} className="text-blue-500" /> Bancos Operando</h4>
                        {activeAssetFilter && <button onClick={() => setActiveAssetFilter(null)} className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100"><FilterX size={12}/> Limpar</button>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentMonthData.accounts.map(acc => (
                          <BalanceItem showValues={showValues} key={acc.id} item={acc} isActive={activeAssetFilter === acc.id} onUpdateBalance={(v: number) => { 
                            const currentBalances = { ...(currentMonthData.balances || {}) };
                            currentBalances[acc.id] = v;
                            setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, balances: currentBalances }, { merge: true });
                          }} onFilter={() => { setActiveAssetFilter(acc.id); setAppState(prev => ({...prev, view: 'transactions'})); }} />
                        ))}
                      </div>
                   </div>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-100 shadow-2xl">
                   <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-6">
                     <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3"><CardIcon size={18} className="text-rose-500" /> Faturas Cartão</h4>
                   </div>
                   <div className="space-y-4">
                     {currentMonthData.creditCards.map(card => (
                       <BalanceItem 
                        showValues={showValues}
                        key={card.id} 
                        item={card} 
                        isActive={activeAssetFilter === card.id} 
                        onUpdateBalance={(v: number) => {
                          const currentBalances = { ...(currentMonthData.balances || {}) };
                          currentBalances[card.id] = v;
                          setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, balances: currentBalances }, { merge: true });
                        }} 
                        onUpdateDate={(val: string) => updateCardDetail(card.id, 'dueDate', val)}
                        onUpdateStatus={() => updateCardDetail(card.id, 'situation', card.situation === 'PAGO' ? 'PENDENTE' : 'PAGO')}
                        onFilter={() => { setActiveAssetFilter(card.id); setAppState(prev => ({...prev, view: 'transactions'})); }} 
                       />
                     ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {appState.view === 'transactions' && (
          <div className="w-full space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex justify-between items-center bg-white p-4 md:p-5 rounded-[32px] border border-slate-100 shadow-2xl w-full">
              <button 
                onClick={async () => {
                  const prevIdx = MONTHS.indexOf(appState.currentMonth) - 1;
                  const prevYear = prevIdx < 0 ? appState.currentYear - 1 : appState.currentYear;
                  const prevMonth = MONTHS[prevIdx < 0 ? 11 : prevIdx];
                  const prevId = `${prevYear}-${(MONTHS.indexOf(prevMonth) + 1).toString().padStart(2, '0')}`;
                  const prevSnap = await getDoc(doc(db, `users/${user.uid}/data`, prevId));
                  if(prevSnap.exists()){
                     const prevTxs = (prevSnap.data().transactions || []) as BaseTransaction[];
                     const recurring = prevTxs.filter(t => t.isRecurring).map(t => ({...t, id: Math.random().toString(36).substr(2,9), situation: 'PENDENTE' as Situation, monthRef: currentMonthId}));
                     await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, transactions: [...currentMonthData.transactions, ...recurring] }, { merge: true });
                     alert("Fluxos clonados com sucesso!");
                  }
                }} 
                className="flex items-center gap-2 px-5 py-3 bg-blue-50 text-blue-600 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all group"
              >
                <Copy size={16} /> Clonar Anterior
              </button>
            </div>
            <div className="w-full">
              <SplitTransactionView 
                showValues={showValues}
                transactions={activeAssetFilter ? currentMonthData.transactions.filter(t => t.paymentMethod === activeAssetFilter) : currentMonthData.transactions} 
                categories={appState.categories} 
                partners={appState.partners} 
                onToggleStatus={async id => {
                  const txs = currentMonthData.transactions.map(t => t.id === id ? { ...t, situation: (t.situation === 'PAGO' ? 'PENDENTE' : 'PAGO') as Situation } : t);
                  await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, transactions: txs }, { merge: true });
                }} 
                onDelete={async id => {
                 if(confirm("Excluir este lançamento?")){
                   const txs = currentMonthData.transactions.filter(t => t.id !== id);
                   await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, transactions: txs }, { merge: true });
                 }
                }} 
                onEdit={tx => { setEditingTransaction(tx); setIsModalOpen(true); }} 
                onAddNew={type => { setModalPreType(type); setEditingTransaction(undefined); setIsModalOpen(true); }} 
                onQuickUpdate={async (id, f, v) => {
                  const txs = currentMonthData.transactions.map(t => t.id === id ? { ...t, [f]: v } : t);
                  await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, transactions: txs }, { merge: true });
                }} 
                totals={totals} 
                onReorder={handleReorder}
              />
            </div>
          </div>
        )}
        
        {appState.view === 'calendar' && <CalendarView month={appState.currentMonth} year={appState.currentYear} transactions={currentMonthData.transactions} />}
        {appState.view === 'partners' && <PartnerManager partners={appState.partners} onAdd={p => setDoc(doc(db, `users/${user.uid}/partners`, p.id), p)} onDelete={id => deleteDoc(doc(db, `users/${user.uid}/partners`, id))} onUpdate={p => updateDoc(doc(db, `users/${user.uid}/partners`, p.id), { ...p })} />}
        {appState.view === 'analytics' && <AnalyticsView monthData={currentMonthData} totals={totals} />}
      </main>

      <PricingPage isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} userProfile={appState.userProfile} onUpgrade={async (plan) => {
         await updateDoc(doc(db, `users/${user.uid}/profile`, 'settings'), { planId: plan, subscriptionStatus: 'ACTIVE' });
         setIsPricingOpen(false);
      }} />
      
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} categories={appState.categories} initialData={editingTransaction} defaultType={modalPreType} onSave={async (tx) => {
          const txs = [...currentMonthData.transactions];
          const idx = txs.findIndex(t => t.id === tx.id);
          if (idx >= 0) txs[idx] = tx; else txs.push(tx);
          await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, transactions: txs }, { merge: true });
      }} defaultMonthRef={currentMonthId} />
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} userProfile={appState.userProfile} userEmail={user.email || ''} onSaveProfile={async (p) => { await setDoc(doc(db, `users/${user.uid}/profile`, 'settings'), p, { merge: true }); }} />
    </div>
  );
};

export default Dashboard;
