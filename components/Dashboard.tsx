
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
  Sparkles, FilterX, LayoutTemplate, CheckCircle2, Clock
} from 'lucide-react';

interface DashboardProps {
  user: User;
}

const BalanceItem = ({ item, onUpdateBalance, onFilter, isActive, onUpdateStatus, onUpdateDate }: any) => {
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

  return (
    <div className={`bg-white p-4 md:p-5 rounded-3xl border transition-all flex flex-col gap-3 shadow-sm ${isActive ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/30' : 'border-slate-100 hover:shadow-md'}`}>
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3 overflow-hidden">
          <div onClick={onFilter} className={`p-2.5 rounded-xl shadow-sm cursor-pointer transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-blue-600'}`}>
            {item.icon || (item.type === 'bank' ? '🏦' : '💳')}
          </div>
          <div className="min-w-0">
            <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate">{item.name}</h5>
            <p className="text-[8px] font-bold text-slate-400 uppercase">Saldo Atual</p>
          </div>
        </div>
        {isEditing ? (
          <input autoFocus type="number" className="w-24 bg-white border-2 border-blue-200 rounded-xl px-2 py-1 font-mono font-black text-xs outline-none" value={val} onChange={e => setVal(e.target.value)} onBlur={finishEdit} onKeyDown={e => e.key === 'Enter' && finishEdit()} />
        ) : (
          <div onClick={() => setIsEditing(true)} className="text-xs font-black text-slate-900 font-mono tracking-tighter cursor-pointer px-2 py-1 hover:bg-blue-50 rounded-lg transition-all">
            {(item.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
        )}
      </div>
      
      {item.type === 'card' && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <Clock size={10} className="text-slate-300" />
            <input 
              type="text" 
              placeholder="Dia"
              value={item.dueDate || ''} 
              onChange={e => onUpdateDate(e.target.value)}
              className="w-8 text-[10px] font-black text-slate-500 bg-transparent outline-none border-b border-transparent focus:border-blue-300"
            />
          </div>
          <button 
            onClick={onUpdateStatus}
            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${item.situation === 'PAGO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}
          >
            {item.situation || 'PENDENTE'}
          </button>
        </div>
      )}
    </div>
  );
};

const KPIItem = ({ label, value, sub, icon: Icon, color, isEditable, onUpdateValue }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value.toString());

  const finishEdit = () => {
    const numVal = parseFloat(localVal);
    if (!isNaN(numVal)) onUpdateValue?.(numVal); 
    setIsEditing(false); 
  };

  return (
    <div className="flex flex-col justify-between p-5 md:p-6 rounded-3xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-all group h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] block mb-2">{label}</span>
          {isEditable && isEditing ? (
            <input autoFocus type="number" className="bg-transparent border-b border-blue-400 text-white font-mono font-black text-base outline-none w-24" value={localVal} onChange={e => setLocalVal(e.target.value)} onBlur={finishEdit} onKeyDown={e => e.key === 'Enter' && finishEdit()} />
          ) : (
            <div className={`text-lg font-black font-mono tracking-tighter ${color} ${isEditable ? 'cursor-pointer hover:text-white transition-colors' : ''}`} onClick={() => isEditable && setIsEditing(true)}>
              {(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          )}
        </div>
        <div className={`p-2 rounded-xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={16} />
        </div>
      </div>
      <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">{sub}</span>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
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
    if (!user) return;
    const unsubData = onSnapshot(query(collection(db, `users/${user.uid}/data`)), (snap) => {
      setAppState(prev => ({ ...prev, data: snap.docs.map(d => ({ ...d.data(), transactions: d.data().transactions || [], balances: d.data().balances || {}, cardDetails: d.data().cardDetails || {} } as FinancialData)) }));
    });
    const unsubProfile = onSnapshot(doc(db, `users/${user.uid}/profile`, 'settings'), (docSnap) => {
      if (docSnap.exists()) setAppState(prev => ({ ...prev, userProfile: docSnap.data() as UserProfile }));
    });
    return () => { unsubData(); unsubProfile(); };
  }, [user]);

  const currentMonthId = `${appState.currentYear}-${(MONTHS.indexOf(appState.currentMonth) + 1).toString().padStart(2, '0')}`;
  
  const handlePrevMonth = () => {
    let idx = MONTHS.indexOf(appState.currentMonth);
    if (idx === 0) {
      setAppState(prev => ({ ...prev, currentMonth: MONTHS[11], currentYear: prev.currentYear - 1 }));
    } else {
      setAppState(prev => ({ ...prev, currentMonth: MONTHS[idx - 1] }));
    }
  };

  const handleNextMonth = () => {
    let idx = MONTHS.indexOf(appState.currentMonth);
    if (idx === 11) {
      setAppState(prev => ({ ...prev, currentMonth: MONTHS[0], currentYear: prev.currentYear + 1 }));
    } else {
      setAppState(prev => ({ ...prev, currentMonth: MONTHS[idx + 1] }));
    }
  };

  const currentMonthData = useMemo(() => {
    const found = appState.data.find(d => `${d.year}-${(MONTHS.indexOf(d.month) + 1).toString().padStart(2, '0')}` === currentMonthId);
    const base = found || { month: appState.currentMonth, year: appState.currentYear, metaFaturamento: 0, transactions: [], balances: {}, cardDetails: {}, reserva: 0, investimento: 0, retorno: 0, reservaCurrency: 'BRL' as const };
    const assets = appState.userProfile.globalAssets || [];
    const accounts = assets.filter(a => a.type === 'bank').map(a => ({ ...a, balance: base.balances[a.id] || 0 }));
    const creditCards = assets.filter(a => a.type === 'card').map(a => ({ ...a, balance: base.balances[a.id] || 0, dueDate: base.cardDetails?.[a.id]?.dueDate || '10', situation: base.cardDetails?.[a.id]?.situation || 'PENDENTE' }));
    return { ...base, accounts, creditCards };
  }, [currentMonthId, appState.data, appState.userProfile]);

  const totals = useMemo(() => {
    const txs = currentMonthData.transactions || [];
    const pendingIncomes = txs.filter(t => t.type === 'Receita' && t.situation !== 'PAGO').reduce((a, t) => a + (t.value || 0), 0);
    const pendingExpenses = txs.filter(t => t.type === 'Despesa' && t.situation !== 'PAGO').reduce((a, t) => a + (t.value || 0), 0);
    const availableCash = currentMonthData.accounts.reduce((a, b) => a + (b.balance || 0), 0);
    const pendingCardDebt = currentMonthData.creditCards.filter(c => c.situation !== 'PAGO').reduce((a, c) => a + (c.balance || 0), 0);
    const totalPendingOutflows = pendingExpenses + pendingCardDebt;
    return { 
      availableCash, pendingIncomes, totalPendingOutflows, pendingCardDebt,
      totalExpenses: txs.filter(t => t.type === 'Despesa').reduce((a, t) => a + (t.value || 0), 0) + currentMonthData.creditCards.reduce((a, c) => a + (c.balance || 0), 0),
      totalIncomes: txs.filter(t => t.type === 'Receita').reduce((a, t) => a + (t.value || 0), 0),
      reservaValue: currentMonthData.reserva || 0,
      liquidHealthNoReserva: (availableCash + pendingIncomes) - totalPendingOutflows,
      liquidHealthWithReserva: (availableCash + pendingIncomes + (currentMonthData.reserva || 0)) - totalPendingOutflows
    };
  }, [currentMonthData]);

  const updateCardDetail = async (id: string, field: string, val: any) => {
    const details = { ...(currentMonthData.cardDetails || {}) };
    details[id] = { ...(details[id] || {}), [field]: val };
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, cardDetails: details }, { merge: true });
  };

  const isTrial = appState.userProfile.subscriptionStatus === 'TRIAL';
  const isAdmin = ADMIN_EMAILS.includes((appState.userProfile.email || '').toLowerCase());

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-inter w-full items-center pb-24 md:pb-10 animate-in fade-in duration-500">
      
      {isTrial && !isAdmin && (
        <div className="bg-[#3b82f6] px-6 py-3 flex items-center justify-center gap-4 text-white sticky top-0 z-[110] w-full text-center">
          <Sparkles size={14} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Teste Ativo: Libere o comando definitivo</span>
          <button onClick={() => setIsPricingOpen(true)} className="px-4 py-1.5 bg-white text-blue-600 rounded-full text-[9px] font-black uppercase shadow-lg">Ativar</button>
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-[100] backdrop-blur-xl w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-indigo-400/30 text-indigo-600 font-black text-sm">T</div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-slate-900 tracking-tighter uppercase leading-none">Cria Gestão <span className="text-blue-500">Pro</span></h1>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Thor4Tech</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100/60 rounded-full p-1 border border-slate-200 shadow-inner scale-90 md:scale-100">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-full transition-all text-slate-500"><ChevronLeft size={16} /></button>
            <div className="px-4 text-center min-w-[120px]">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest block leading-none">{appState.currentMonth}</span>
              <span className="text-[8px] font-bold text-blue-500 block uppercase mt-0.5">{appState.currentYear}</span>
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-full transition-all text-slate-500"><ChevronRight size={16} /></button>
          </div>

          <div className="flex items-center gap-2">
             <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl hover:text-blue-600 transition-all"><Settings size={18}/></button>
             <button onClick={() => signOut(auth)} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><LogOut size={18}/></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 w-full space-y-8 flex flex-col items-center">
        
        {/* MENU PILL MOBILE FRIENDLY */}
        <div className="flex justify-center w-full sticky top-[84px] z-[90]">
          <div className="flex items-center gap-1 p-1 bg-white/90 border border-slate-200 rounded-full shadow-2xl backdrop-blur-xl scale-100 md:scale-100">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Painel' }, 
              { id: 'analytics', icon: BarChart3, label: 'Estratégia' }, 
              { id: 'transactions', icon: List, label: 'Fluxo Real' }, 
              { id: 'partners', icon: Users, label: 'CRM' }, 
              { id: 'calendar', icon: Calendar, label: 'Agenda' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setAppState(prev => ({ ...prev, view: tab.id as any }))}
                className={`flex items-center gap-2 px-4 py-3 md:px-6 md:py-3.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${appState.view === tab.id ? 'bg-[#020617] text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <tab.icon size={16} /> <span className={showLabels ? 'inline' : 'hidden md:inline'}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {appState.view === 'dashboard' && (
          <div className="space-y-8 w-full animate-in slide-in-from-bottom-5 duration-700">
             {/* PAINEL DARK FLOW */}
             <div className="bg-[#0f172a] p-6 md:p-10 rounded-[40px] shadow-4xl relative overflow-hidden border border-white/5">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 relative z-10">
                   <KPIItem label="Liquidez Real" value={totals.availableCash} color="text-white" icon={Wallet} sub="Bancos Conectados" />
                   <KPIItem label="A Receber" value={totals.pendingIncomes} color="text-emerald-400" icon={ArrowUpRight} sub="Entradas Pendentes" />
                   <KPIItem label="Dívida Total" value={totals.totalPendingOutflows} color="text-rose-400" icon={ArrowDownCircle} sub="Saídas + Faturas" />
                   <KPIItem label="Reserva" isEditable value={totals.reservaValue} color="text-blue-400" icon={PiggyBank} sub="Fundo Estratégico" onUpdateValue={(v: number) => setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, reserva: v }, { merge: true })} />
                   <div className={`p-6 rounded-3xl border-2 flex flex-col justify-between ${totals.liquidHealthNoReserva >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                      <span className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-4">Saúde Líquida</span>
                      <div className={`text-xl font-black font-mono tracking-tighter ${totals.liquidHealthNoReserva >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {totals.liquidHealthNoReserva.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-200 shadow-xl">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Landmark size={16} className="text-blue-500" /> Bancos & Disponibilidade</h4>
                        {activeAssetFilter && <button onClick={() => setActiveAssetFilter(null)} className="text-[8px] font-black text-rose-500 uppercase flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-full"><FilterX size={10}/> Limpar</button>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentMonthData.accounts.map(acc => (
                          <BalanceItem key={acc.id} item={acc} isActive={activeAssetFilter === acc.id} onUpdateBalance={(v: number) => { 
                            const currentBalances = { ...(currentMonthData.balances || {}) };
                            currentBalances[acc.id] = v;
                            setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, balances: currentBalances }, { merge: true });
                          }} onFilter={() => { setActiveAssetFilter(acc.id); setAppState(prev => ({...prev, view: 'transactions'})); }} />
                        ))}
                      </div>
                   </div>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-200 shadow-xl">
                   <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                     <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><CardIcon size={16} className="text-rose-500" /> Faturas Cartão</h4>
                   </div>
                   <div className="space-y-4">
                     {currentMonthData.creditCards.map(card => (
                       <BalanceItem 
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
          <div className="w-full space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm w-full">
              <button 
                onClick={() => {/* Duplicar logic */}} 
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all group"
              >
                <Copy size={14} /> Clonar Anterior
              </button>
              {activeAssetFilter && (
                <div className="flex items-center gap-2 bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100">
                   <span className="text-[9px] font-black text-blue-600 uppercase">Auditando Ativo</span>
                   <button onClick={() => setActiveAssetFilter(null)} className="p-1 text-rose-500"><X size={14}/></button>
                </div>
              )}
            </div>
            <SplitTransactionView 
              transactions={activeAssetFilter ? currentMonthData.transactions.filter(t => t.paymentMethod === activeAssetFilter) : currentMonthData.transactions} 
              categories={appState.categories} 
              partners={appState.partners} 
              onToggleStatus={async id => {
                const txs = currentMonthData.transactions.map(t => t.id === id ? { ...t, situation: (t.situation === 'PAGO' ? 'PENDENTE' : 'PAGO') as Situation } : t);
                await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, transactions: txs }, { merge: true });
              }} 
              onDelete={async id => {
                 const txs = currentMonthData.transactions.filter(t => t.id !== id);
                 await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, transactions: txs }, { merge: true });
              }} 
              onEdit={tx => { setEditingTransaction(tx); setIsModalOpen(true); }} 
              onAddNew={type => { setModalPreType(type); setEditingTransaction(undefined); setIsModalOpen(true); }} 
              onQuickUpdate={async (id, f, v) => {
                const txs = currentMonthData.transactions.map(t => t.id === id ? { ...t, [f]: v } : t);
                await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, transactions: txs }, { merge: true });
              }} 
              totals={totals} 
            />
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
