
import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, query, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { MONTHS, DEFAULT_CATEGORIES } from './constants';
import { AppState, FinancialData, BaseTransaction, Situation, Category, Partner, UserProfile, AccountItem, CreditCardItem, AssetMetadata } from './types';
import SplitTransactionView from './components/SplitTransactionView';
import PartnerManager from './components/PartnerManager';
import CalendarView from './components/CalendarView';
import TransactionModal from './components/TransactionModal';
import CategoryModal from './components/CategoryModal';
import SettingsModal from './components/SettingsModal';
import AnalyticsView from './components/AnalyticsView';
import OnboardingGuide from './components/OnboardingGuide';
import Login from './components/Login';
import { 
  TrendingUp, Wallet, ChevronLeft, ChevronRight, LayoutDashboard, 
  Calendar, List, Plus, Palette, Users, Activity, LogOut, 
  CreditCard, Landmark, ArrowDownCircle, Trash2,
  Settings, ShieldCheck, CreditCard as CardIcon, CheckCircle2,
  BarChart3, Clock, PiggyBank, Copy, ArrowUpRight
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const now = useMemo(() => new Date(), []);
  const initialMonth = MONTHS[now.getMonth()];
  const initialYear = now.getFullYear();

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
    userProfile: { name: 'Rafael', company: 'Thor4Tech', globalAssets: [] }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modalPreType, setModalPreType] = useState<'Receita' | 'Despesa' | undefined>(undefined);
  const [editingTransaction, setEditingTransaction] = useState<BaseTransaction | undefined>(undefined);
  
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      
      if (u) {
        const profileRef = doc(db, `users/${u.uid}/profile`, 'settings');
        const profileSnap = await getDoc(profileRef);
        if (!profileSnap.exists()) {
          setShowOnboarding(true);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const unsubData = onSnapshot(query(collection(db, `users/${user.uid}/data`)), (snap) => {
      const dataArr = snap.docs.map(d => ({
        ...d.data(),
        transactions: Array.isArray(d.data().transactions) ? d.data().transactions : [],
        balances: d.data().balances || {},
        cardDetails: d.data().cardDetails || {},
        reserva: d.data().reserva || 0,
      } as FinancialData));
      setAppState(prev => ({ ...prev, data: dataArr }));
    });

    onSnapshot(doc(db, `users/${user.uid}/profile`, 'settings'), (docSnap) => {
      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        setAppState(prev => ({ 
          ...prev, 
          userProfile: {
            ...profile,
            globalAssets: Array.isArray(profile.globalAssets) ? profile.globalAssets : []
          }
        }));
      }
    });

    onSnapshot(query(collection(db, `users/${user.uid}/categories`)), (snap) => {
      if (!snap.empty) setAppState(prev => ({ ...prev, categories: snap.docs.map(d => d.data() as Category) }));
    });

    onSnapshot(query(collection(db, `users/${user.uid}/partners`)), (snap) => {
      setAppState(prev => ({ ...prev, partners: snap.docs.map(d => d.data() as Partner) }));
    });

    return () => unsubData();
  }, [user]);

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
      metaFaturamento: 30000, 
      transactions: [],
      balances: {},
      cardDetails: {},
      reserva: 0,
      reservaCurrency: 'BRL',
      investimento: 0,
      retorno: 0
    } as FinancialData;

    const accounts = (appState.userProfile.globalAssets || [])
      .filter(a => a.type === 'bank')
      .map(asset => ({
        ...asset,
        balance: baseData.balances[asset.id] || 0
      })) as AccountItem[];

    const creditCards = (appState.userProfile.globalAssets || [])
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
    
    return { 
      totalIncomes, 
      availableCash, 
      pendingCardDebt, 
      pendingIncomes, 
      reservaValue,
      totalPendingOutflows,
      totalExpenses: totalTransactionsExpenses + totalCardDebtMonth,
      liquidHealthWithReserva,
      liquidHealthNoReserva,
      pendingExpenses: totalPendingOutflows,
      liquidHealth: liquidHealthNoReserva
    };
  }, [currentMonthData]);

  const handleDuplicateLastMonth = async () => {
    if (!user) return;
    
    let prevMIdx = MONTHS.indexOf(appState.currentMonth);
    let prevYear = appState.currentYear;
    if (prevMIdx === 0) { prevMIdx = 11; prevYear--; } else { prevMIdx--; }
    
    const prevMonthId = `${prevYear}-${(prevMIdx + 1).toString().padStart(2, '0')}`;
    const prevDoc = await getDoc(doc(db, `users/${user.uid}/data`, prevMonthId));
    
    if (!prevDoc.exists()) {
      alert("Dados do mês anterior não encontrados.");
      return;
    }

    const prevData = prevDoc.data() as FinancialData;
    const currentMIdx = MONTHS.indexOf(appState.currentMonth) + 1;
    const currentMonthPrefix = appState.currentMonth.slice(0, 3);
    const newMonthRef = `${currentMonthPrefix}/${appState.currentYear}`;

    const duplicatedTransactions = (prevData.transactions || []).map(t => {
      let newDate = t.dueDate;
      try {
        const parts = t.dueDate.split('-');
        if (parts.length === 3) {
          newDate = `${appState.currentYear}-${currentMIdx.toString().padStart(2, '0')}-${parts[2]}`;
        }
      } catch (e) {}

      return {
        ...t,
        id: Math.random().toString(36).substr(2, 9),
        situation: 'PENDENTE' as Situation,
        dueDate: newDate,
        monthRef: newMonthRef
      };
    });

    const newCardDetails: Record<string, any> = {};
    if (prevData.cardDetails) {
      Object.keys(prevData.cardDetails).forEach(cardId => {
        const detail = prevData.cardDetails![cardId];
        let newCardDate = detail.dueDate;
        try {
          const parts = detail.dueDate.split('-');
          if (parts.length === 3) {
            newCardDate = `${appState.currentYear}-${currentMIdx.toString().padStart(2, '0')}-${parts[2]}`;
          }
        } catch (e) {}
        newCardDetails[cardId] = { ...detail, situation: 'PENDENTE', dueDate: newCardDate };
      });
    }

    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), {
      ...currentMonthData,
      transactions: [...(currentMonthData.transactions || []), ...duplicatedTransactions],
      balances: prevData.balances || {},
      cardDetails: newCardDetails,
      reserva: prevData.reserva || 0,
      metaFaturamento: prevData.metaFaturamento || 30000
    }, { merge: true });

    alert("Fluxos duplicados com sucesso!");
  };

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

  if (authLoading) return <div className="h-screen bg-slate-950 flex items-center justify-center"><Activity className="animate-spin text-indigo-500" /></div>;
  if (!user) return <Login onLogin={() => {}} />;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-inter overflow-x-hidden pb-10 relative">
      <header className="bg-white/95 border-b border-slate-200 sticky top-0 z-[100] backdrop-blur-2xl shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-10 h-20 md:h-24 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4 cursor-pointer group" onClick={() => setAppState(prev => ({...prev, view: 'dashboard'}))}>
            <div className="bg-slate-950 p-2.5 md:p-3.5 rounded-2xl text-white shadow-2xl group-hover:bg-indigo-600 transition-all"><Activity size={20} /></div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter leading-none">Cria Gestão <span className="text-indigo-600">Pro</span></h1>
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1.5">{appState.userProfile.company}</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100/50 rounded-full md:rounded-3xl p-1 md:p-1.5 border border-slate-200 shadow-inner">
            <button onClick={() => { let mIdx = MONTHS.indexOf(appState.currentMonth); let y = appState.currentYear; if (mIdx === 0) { mIdx = 11; y--; } else { mIdx--; } setAppState(prev => ({...prev, currentMonth: MONTHS[mIdx], currentYear: y})); }} className="p-2 md:p-3.5 hover:bg-white rounded-full md:rounded-2xl text-slate-500 transition-all"><ChevronLeft size={18} /></button>
            <div className="px-4 md:px-10 text-center min-w-[120px] md:min-w-[200px]">
              <span className="text-[9px] md:text-[11px] font-black text-slate-800 uppercase tracking-widest">{appState.currentMonth}</span>
              <span className="text-[8px] md:text-[9px] font-black text-indigo-500 uppercase block mt-1 md:mt-1.5">{appState.currentYear}</span>
            </div>
            <button onClick={() => { let mIdx = MONTHS.indexOf(appState.currentMonth); let y = appState.currentYear; if (mIdx === 11) { mIdx = 0; y++; } else { mIdx++; } setAppState(prev => ({...prev, currentMonth: MONTHS[mIdx], currentYear: y})); }} className="p-2 md:p-3.5 hover:bg-white rounded-full md:rounded-2xl text-slate-500 transition-all"><ChevronRight size={18} /></button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 md:p-3.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl md:rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Settings size={18} /></button>
            <button onClick={() => signOut(auth)} className="p-2.5 md:p-3.5 bg-rose-50 text-rose-500 rounded-xl md:rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 lg:px-10 py-6 md:py-10 w-full space-y-8 md:space-y-12">
        <div className="flex flex-col gap-6">
          <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-full md:rounded-[32px] shadow-2xl overflow-x-auto no-scrollbar w-full">
            {[
              { id: 'dashboard', label: 'Estratégia', icon: LayoutDashboard }, 
              { id: 'analytics', label: 'Analytics Pro', icon: BarChart3 }, 
              { id: 'transactions', label: 'Fluxo Real', icon: List }, 
              { id: 'partners', label: 'Parceiros', icon: Users }, 
              { id: 'calendar', label: 'Calendário', icon: Calendar }
            ].map(tab => (
              <button key={tab.id} onClick={() => setAppState(prev => ({ ...prev, view: tab.id as any }))} className={`flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-full md:rounded-[24px] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${appState.view === tab.id ? 'bg-slate-950 text-white shadow-2xl scale-105' : 'text-slate-500 hover:bg-slate-50'}`}>
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
          
          <div className="flex justify-between items-center gap-4">
            <button onClick={() => setIsCatModalOpen(true)} className="flex-1 md:flex-none px-6 py-4 bg-white border border-slate-200 rounded-full md:rounded-[24px] text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 shadow-xl transition-all"><Palette size={16} /> Categorias</button>
            <button onClick={handleDuplicateLastMonth} title="Duplicar dados do mês passado" className="px-6 py-4 bg-indigo-50 text-indigo-600 rounded-full md:rounded-[24px] hover:bg-indigo-600 hover:text-white transition-all shadow-xl flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
              <Copy size={16} /> <span className="hidden sm:inline">Duplicar Anterior</span>
            </button>
          </div>
        </div>

        {appState.view === 'dashboard' && (
          <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="bg-[#0f172a] p-6 md:p-12 rounded-[40px] md:rounded-[56px] shadow-4xl relative overflow-hidden group border border-white/5">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/5 pointer-events-none"></div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 relative z-10">
                  <KPIItem label="Bancos (Atual)" value={totals.availableCash} color="text-white" icon={Wallet} sub="Disponibilidade real" />
                  <KPIItem label="A Receber" value={totals.pendingIncomes} color="text-emerald-400" icon={ArrowUpRight} sub="Entradas pendentes" />
                  <KPIItem label="A Pagar Total" value={totals.totalPendingOutflows} color="text-rose-400" icon={ArrowDownCircle} sub="Saídas pendentes" extraLine={`Cartão pendente: R$ ${totals.pendingCardDebt.toLocaleString('pt-BR')}`} />
                  <KPIItem label="Reserva / Invest." isEditable value={totals.reservaValue} color="text-indigo-400" icon={PiggyBank} sub="Bloco de investimento" onUpdateValue={updateReservaInMonth} />
                  
                  <div className={`p-8 md:p-10 rounded-[32px] md:rounded-[48px] border-2 flex flex-col justify-between transition-all hover:scale-[1.05] ${totals.liquidHealthNoReserva >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.1)]'}`}>
                     <div>
                        <span className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3">Saúde Líquida (Prevista)</span>
                        <div className={`text-xl md:text-2xl font-black font-mono tracking-tighter ${totals.liquidHealthNoReserva >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                           {totals.liquidHealthNoReserva.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                     </div>
                     <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                        <span className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest block">Previsão de fechamento</span>
                        <div className="flex items-center justify-between mt-2">
                           <span className="text-[7px] md:text-[8px] font-black text-white/40 uppercase tracking-widest">Com Reserva:</span>
                           <span className={`text-[10px] md:text-[11px] font-black font-mono ${totals.liquidHealthWithReserva >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                              {totals.liquidHealthWithReserva.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-12">
               <div className="xl:col-span-2 space-y-8 md:space-y-12">
                  <div className="bg-white p-8 md:p-14 rounded-[40px] md:rounded-[56px] border border-slate-200 shadow-2xl space-y-10">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-6 md:pb-8"><h4 className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-3"><Landmark size={18} className="text-indigo-500" /> Bancos & Carteiras</h4></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                      {currentMonthData.accounts.map(acc => ( <BalanceItem key={acc.id} item={acc} onUpdateBalance={v => updateBalanceInMonth(acc.id, v)} /> ))}
                      {currentMonthData.accounts.length === 0 && <EmptyAsset message="Adicione Bancos nas Configurações" icon={Landmark} />}
                    </div>
                  </div>
               </div>
               <div className="bg-white p-8 md:p-12 rounded-[40px] md:rounded-[56px] border border-slate-200 shadow-2xl space-y-10">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-6 md:pb-8"><h4 className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-3"><CreditCard size={18} className="text-rose-500" /> Dívida de Cartões</h4></div>
                  <div className="space-y-6">
                    {currentMonthData.creditCards.map(card => ( 
                      <SimpleCardItem 
                        key={card.id} 
                        item={card} 
                        onUpdateBalance={v => updateBalanceInMonth(card.id, v)} 
                        onUpdateDate={d => updateCardDetail(card.id, 'dueDate', d)}
                        onUpdateStatus={s => updateCardDetail(card.id, 'situation', s)}
                      /> 
                    ))}
                    {currentMonthData.creditCards.length === 0 && <EmptyAsset message="Adicione Cartões nas Configurações" icon={CreditCard} />}
                  </div>
               </div>
            </div>
          </div>
        )}

        {appState.view === 'transactions' && <SplitTransactionView transactions={currentMonthData.transactions || []} categories={appState.categories} partners={appState.partners} onToggleStatus={id => { const txs = currentMonthData.transactions.map(t => t.id === id ? { ...t, situation: (['PENDENTE','AGENDADO','PAGO','CANCELADO'] as Situation[])[(['PENDENTE','AGENDADO','PAGO','CANCELADO'].indexOf(t.situation) + 1) % 4] } : t); handleReorderTransactions(txs); }} onDelete={id => handleReorderTransactions(currentMonthData.transactions.filter(t => t.id !== id))} onEdit={tx => { setEditingTransaction(tx); setIsModalOpen(true); }} onAddNew={type => { setModalPreType(type); setEditingTransaction(undefined); setIsModalOpen(true); }} onQuickUpdate={(id, f, v) => handleReorderTransactions(currentMonthData.transactions.map(t => t.id === id ? { ...t, [f]: v } : t))} totals={totals} onReorder={handleReorderTransactions} />}
        {appState.view === 'partners' && <PartnerManager partners={appState.partners} onAdd={p => setDoc(doc(db, `users/${user.uid}/partners`, p.id), p)} onDelete={id => deleteDoc(doc(db, `users/${user.uid}/partners`, id))} onUpdate={p => updateDoc(doc(db, `users/${user.uid}/partners`, p.id), { ...p })} />}
        {appState.view === 'calendar' && <CalendarView month={appState.currentMonth} year={appState.currentYear} transactions={currentMonthData.transactions || []} />}
        {appState.view === 'analytics' && <AnalyticsView monthData={currentMonthData} totals={totals} />}
      </main>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={tx => { const txs = [...currentMonthData.transactions]; const idx = txs.findIndex(t => t.id === tx.id); if (idx >= 0) txs[idx] = tx; else txs.push(tx); handleReorderTransactions(txs); }} categories={appState.categories} initialData={editingTransaction} defaultType={modalPreType} defaultMonthRef={`${appState.currentMonth.slice(0,3)}/${appState.currentYear}`} />
      <CategoryModal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} categories={appState.categories} onSaveCategories={cats => cats.forEach(c => setDoc(doc(db, `users/${user.uid}/categories`, c.id), c))} />
      <SettingsModal 
        key={appState.userProfile.globalAssets?.length || 0}
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        userProfile={appState.userProfile} 
        userEmail={user.email || ''}
        onSaveProfile={updateUserProfile} 
      />
      <OnboardingGuide 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
        userName={appState.userProfile.name} 
      />
    </div>
  );
};

const KPIItem: React.FC<{ label: string; value: number; color: string; icon: any; sub: string; extraLine?: string; isEditable?: boolean; onUpdateValue?: (v: number) => void }> = ({ label, value, color, icon: Icon, sub, extraLine, isEditable, onUpdateValue }) => {
  const [localEdit, setLocalEdit] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => { setLocalEdit(value.toString()); }, [value]);
  return (
    <div className={`bg-white/5 p-6 md:p-8 rounded-[32px] md:rounded-[40px] flex flex-col justify-between min-h-[180px] md:min-h-[230px] hover:bg-white/10 transition-all border-2 border-transparent shadow-inner`}>
      <div className="flex items-center justify-between mb-4 md:mb-5"><span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span><div className={`p-2.5 md:p-3 bg-white/5 rounded-xl text-indigo-400`}><Icon size={16} /></div></div>
      <div>
        {isEditable ? (
          <div className="flex items-center gap-3"><span className={`text-[10px] md:text-[12px] font-black font-mono ${color}`}>R$</span><input type="number" step="0.01" value={localEdit} onChange={e => setLocalEdit(e.target.value)} onBlur={() => { onUpdateValue?.(parseFloat(localEdit) || 0); setIsEditing(false); }} onFocus={() => setIsEditing(true)} className={`bg-transparent w-full text-xl md:text-2xl font-black font-mono outline-none border-b-2 tracking-tighter transition-all ${isEditing ? 'border-indigo-500 text-white' : 'border-transparent ' + color}`}/></div>
        ) : (<div className={`text-xl md:text-2xl font-black font-mono tracking-tighter leading-none ${color}`}>{value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>)}
        <p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-3 md:mt-4">{sub}</p>
        {extraLine && <p className="text-[7px] md:text-[8px] font-black text-rose-400/80 uppercase tracking-widest mt-1">{extraLine}</p>}
      </div>
    </div>
  );
};

const BalanceItem: React.FC<{ item: AccountItem; onUpdateBalance: (v: number) => void }> = ({ item, onUpdateBalance }) => {
  const [localVal, setLocalVal] = useState((item?.balance || 0).toString());
  useEffect(() => { setLocalVal((item?.balance || 0).toString()); }, [item?.balance]);
  return (
    <div className="bg-slate-50 p-6 md:p-7 rounded-[32px] md:rounded-[40px] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all relative group overflow-hidden">
      <div className="flex items-center gap-4 mb-6 md:mb-8 relative z-10"><div className="w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-200 rounded-2xl text-center text-xl md:text-2xl flex items-center justify-center shadow-sm">{item?.icon || '🏦'}</div><div className="flex-1 min-w-0"><span className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest truncate block leading-none">{item?.name}</span><span className="text-[7px] md:text-[8px] font-black text-slate-300 uppercase mt-2 flex items-center gap-1"><ShieldCheck size={8} /> Protegido</span></div></div>
      <div className="bg-white px-5 md:px-6 py-4 md:py-5 rounded-[24px] md:rounded-[32px] border border-slate-100 flex items-center gap-3 shadow-inner group-hover:bg-white transition-all relative z-10"><span className="text-[10px] md:text-[12px] font-black text-slate-300 font-mono">R$</span><input type="number" step="0.01" value={localVal} onChange={e => setLocalVal(e.target.value)} onBlur={() => onUpdateBalance(parseFloat(localVal) || 0)} className="bg-transparent w-full text-lg md:text-xl font-black text-slate-800 font-mono outline-none tracking-tighter" /></div>
    </div>
  );
};

const SimpleCardItem: React.FC<{ item: CreditCardItem; onUpdateBalance: (v: number) => void; onUpdateDate: (d: string) => void; onUpdateStatus: (s: Situation) => void }> = ({ item, onUpdateBalance, onUpdateDate, onUpdateStatus }) => {
  const [localVal, setLocalVal] = useState((item?.balance || 0).toString());
  useEffect(() => { setLocalVal((item?.balance || 0).toString()); }, [item?.balance]);
  return (
    <div className="bg-slate-50 p-5 md:p-6 rounded-[28px] md:rounded-[32px] border border-transparent hover:border-rose-100 hover:bg-white transition-all shadow-sm space-y-4 group">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <div className="p-2.5 md:p-3 bg-white rounded-xl text-slate-300 group-hover:text-rose-500 transition-colors shadow-sm"><CardIcon size={16} /></div>
          <div className="truncate"><span className="text-[10px] md:text-[11px] font-black text-slate-600 uppercase tracking-widest block leading-none">{item?.name}</span><span className="text-[7px] font-black text-slate-300 uppercase mt-1">Fatura do Mês</span></div>
        </div>
        <button onClick={() => onUpdateStatus(item.situation === 'PAGO' ? 'PENDENTE' : 'PAGO')} className={`px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[7px] md:text-[8px] font-black uppercase border-2 transition-all ${item.situation === 'PAGO' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>{item.situation}</button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-white px-3 md:px-4 py-2 md:py-3 rounded-2xl shadow-inner border border-slate-100 flex items-center gap-2">
          <Clock size={10} className="text-slate-300" />
          <input type="date" value={item.dueDate || ''} onChange={e => onUpdateDate(e.target.value)} className="bg-transparent text-[9px] md:text-[10px] font-black font-mono outline-none w-full text-slate-600" />
        </div>
        <div className="bg-white px-3 md:px-4 py-2 md:py-3 rounded-2xl shadow-inner border border-slate-100 flex items-center gap-2">
          <span className="text-[9px] md:text-[10px] font-black text-slate-300 font-mono">R$</span>
          <input type="number" step="0.01" value={localVal} onChange={e => setLocalVal(e.target.value)} onBlur={() => onUpdateBalance(parseFloat(localVal) || 0)} className="bg-transparent text-[10px] md:text-[11px] font-black font-mono outline-none w-full text-slate-800 tracking-tighter" />
        </div>
      </div>
    </div>
  );
};

const EmptyAsset: React.FC<{ message: string; icon: any }> = ({ message, icon: Icon }) => (
  <div className="py-8 md:py-10 border-2 border-dashed border-slate-200 rounded-[28px] md:rounded-[32px] flex flex-col items-center justify-center opacity-40">
    <Icon size={28} className="text-slate-300 mb-3" />
    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{message}</span>
  </div>
);

export default App;
