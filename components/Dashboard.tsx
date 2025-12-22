
import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../lib/firebase';
import { onSnapshot, doc, setDoc, query, collection } from 'firebase/firestore';
import { MONTHS, DEFAULT_CATEGORIES } from '../constants';
import { AppState, FinancialData, BaseTransaction, Category, Partner, UserProfile, AssetMetadata } from '../types';
import SplitTransactionView from './SplitTransactionView';
import PartnerManager from './PartnerManager';
import CalendarView from './CalendarView';
import SettingsModal from './SettingsModal';
import AnalyticsView from './AnalyticsView';
import ReferralView from './ReferralView';
import OnboardingWizard from './Onboarding/OnboardingWizard';
import { 
  Wallet, ChevronLeft, ChevronRight, LayoutDashboard, 
  Calendar, List, Users, Activity, 
  Landmark, Zap, Settings, CreditCard as CardIcon, 
  BarChart3, Heart, TrendingDown, TrendingUp, Clock, ShieldCheck,
  Briefcase, Eye, EyeOff, Shield
} from 'lucide-react';

interface DashboardProps {
  user: any;
}

const KPIItem = ({ label, value, sub, icon: Icon, color, special, showValues, dual }: any) => (
  <div className={`relative flex flex-col justify-between p-6 md:p-8 rounded-[40px] border transition-all group shadow-2xl overflow-hidden min-h-[180px] ${special ? 'bg-[#020617] text-white border-blue-500/30' : 'bg-white border-slate-100'}`}>
    <div className="relative z-10">
      <span className={`text-[9px] font-black uppercase tracking-[0.2em] block mb-4 ${special ? 'text-blue-400' : 'text-slate-400'}`}>{label}</span>
      {dual ? (
        <div className="space-y-4">
          <div>
            <span className="text-[8px] font-bold text-white/40 uppercase block mb-1 tracking-widest">Poder Total (C/ Reserva):</span>
            <div className="text-xl md:text-2xl font-black font-mono tracking-tighter text-[#4ade80] drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">
              {showValues ? (value.comReserva || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ ••••••'}
            </div>
          </div>
          <div className="pt-3 border-t border-white/10">
            <span className="text-[8px] font-bold text-white/40 uppercase block mb-1 tracking-widest">Líquido (S/ Reserva):</span>
            <div className="text-lg md:text-xl font-black font-mono tracking-tighter text-white">
              {showValues ? (value.semReserva || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ ••••••'}
            </div>
          </div>
        </div>
      ) : (
        <div className={`text-2xl md:text-3xl font-black font-mono tracking-tighter ${special ? 'text-white' : color}`}>
          {showValues ? (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ ••••••'}
        </div>
      )}
    </div>
    <div className={`absolute top-6 right-6 p-3 rounded-2xl border ${special ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'bg-slate-50 border-slate-100 ' + color}`}>
      <Icon size={20} />
    </div>
    {!dual && <span className={`text-[8px] font-black uppercase tracking-[0.2em] relative z-10 mt-4 ${special ? 'text-white/40' : 'text-slate-300'}`}>{sub}</span>}
  </div>
);

const AssetCard = ({ item, onUpdateBalance, showValues, onUpdateDetail, isReserva }: any) => {
  const [val, setVal] = useState(item.balance?.toString() || "0");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setVal(item.balance?.toString() || "0");
  }, [item.balance, isEditing]);

  return (
    <div className={`p-5 rounded-[32px] border transition-all flex flex-col gap-4 group relative overflow-hidden shadow-lg
      ${isReserva ? 'bg-[#0f172a] border-blue-500/40 border-2' : 'bg-white border-slate-100 hover:border-blue-200'}
    `}>
       {isReserva && (
         <div className="absolute top-0 right-0 p-3 z-20">
            <div className="bg-amber-500 text-black text-[8px] font-black px-3 py-1 rounded-full shadow-lg animate-pulse uppercase tracking-widest">
              PROTEGIDO
            </div>
         </div>
       )}
       
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className={`p-2.5 rounded-xl ${isReserva ? 'bg-blue-500/20 text-blue-400' : item.type === 'bank' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                {isReserva ? <Heart size={18} fill="currentColor"/> : item.type === 'bank' ? <Landmark size={18}/> : <CardIcon size={18}/>}
             </div>
             <div>
                <h5 className={`text-[10px] font-black uppercase tracking-widest ${isReserva ? 'text-white' : 'text-slate-900'}`}>{item.name}</h5>
                {item.type === 'card' && (
                   <div className="flex items-center gap-2 mt-1">
                     <span className="text-[7px] font-black text-slate-400 uppercase">Dia Venc:</span>
                     <input 
                       type="number" 
                       className="w-10 text-[10px] font-black text-blue-600 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 outline-none focus:border-blue-400"
                       value={item.dueDate || ''}
                       onChange={e => onUpdateDetail('dueDate', e.target.value)}
                     />
                   </div>
                )}
             </div>
          </div>

          <div className="flex flex-col items-end">
            {isEditing ? (
              <input 
                autoFocus 
                type="number" 
                className={`w-28 bg-transparent border-b-2 border-blue-500 outline-none text-right font-mono font-black text-sm ${isReserva ? 'text-[#4ade80]' : 'text-slate-900'}`}
                value={val}
                onChange={e => setVal(e.target.value)}
                onBlur={() => { onUpdateBalance(parseFloat(val) || 0); setIsEditing(false); }}
                onKeyDown={e => e.key === 'Enter' && (e.target as any).blur()}
              />
            ) : (
              <div onClick={() => setIsEditing(true)} className={`text-sm md:text-base font-black font-mono cursor-pointer transition-colors ${isReserva ? 'text-[#4ade80] drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]' : 'text-slate-900 hover:text-blue-600'}`}>
                 {showValues ? (item.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ •••'}
              </div>
            )}
          </div>
       </div>

       {item.type === 'card' && (
         <div className="flex items-center justify-between pt-3 border-t border-slate-50">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status da Fatura:</span>
            <button 
              onClick={() => onUpdateDetail('situation', item.situation === 'PAGO' ? 'PENDENTE' : 'PAGO')}
              className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${item.situation === 'PAGO' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}
            >
              {item.situation || 'PENDENTE'}
            </button>
         </div>
       )}
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [showValues, setShowValues] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appState, setAppState] = useState<AppState>({
    currentMonth: MONTHS[new Date().getMonth()],
    currentYear: new Date().getFullYear(),
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
    onSnapshot(doc(db, `users/${user.uid}/profile`, 'settings'), snap => {
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        setAppState(p => ({ ...p, userProfile: profile }));
        if (!profile.onboardingCompleto) setAppState(p => ({ ...p, view: 'onboarding' }));
      }
    });
    onSnapshot(query(collection(db, `users/${user.uid}/data`)), snap => setAppState(p => ({ ...p, data: snap.docs.map(d => d.data() as FinancialData) })));
    onSnapshot(query(collection(db, `users/${user.uid}/partners`)), snap => setAppState(p => ({ ...p, partners: snap.docs.map(d => d.data() as Partner) })));
  }, [user?.uid]);

  const currentMonthId = `${appState.currentYear}-${(MONTHS.indexOf(appState.currentMonth) + 1).toString().padStart(2, '0')}`;
  
  const currentMonthData = useMemo(() => {
    const found = appState.data.find(d => `${d.year}-${(MONTHS.indexOf(d.month) + 1).toString().padStart(2, '0')}` === currentMonthId);
    const base = found || { transactions: [], balances: {}, reserva: 0, cardDetails: {}, reservaEmergencia: 0 };
    const assets = appState.userProfile.globalAssets || [];
    return {
      ...base,
      reservaEmergencia: base.reservaEmergencia || 0,
      accounts: assets.filter(a => a.type === 'bank').map(a => ({ ...a, balance: (base.balances || {})[a.id] || 0 })),
      creditCards: assets.filter(a => a.type === 'card').map(a => ({ 
        ...a, 
        balance: (base.balances || {})[a.id] || 0, 
        dueDate: base.cardDetails?.[a.id]?.dueDate || '10', 
        situation: base.cardDetails?.[a.id]?.situation || 'PENDENTE' 
      }))
    };
  }, [currentMonthId, appState.data, appState.userProfile]);

  const totals = useMemo(() => {
    const txs = currentMonthData.transactions || [];
    const fatTotal = txs.filter(t => t.type === 'Receita').reduce((a, t) => a + (t.value || 0), 0);
    const fatReal = txs.filter(t => t.type === 'Receita' && t.situation === 'PAGO').reduce((a, t) => a + (t.value || 0), 0);
    const fatPend = txs.filter(t => t.type === 'Receita' && t.situation !== 'PAGO').reduce((a, t) => a + (t.value || 0), 0);
    
    const divTotal = txs.filter(t => t.type === 'Despesa').reduce((a, t) => a + (t.value || 0), 0) + currentMonthData.creditCards.reduce((a, c) => a + (c.balance || 0), 0);
    const divPend = txs.filter(t => t.type === 'Despesa' && t.situation !== 'PAGO').reduce((a, t) => a + (t.value || 0), 0) + 
                  currentMonthData.creditCards.filter(c => c.situation !== 'PAGO').reduce((a, c) => a + (c.balance || 0), 0);
    
    const totalCarteira = currentMonthData.accounts.reduce((a, b) => a + (b.balance || 0), 0);
    const res = currentMonthData.reservaEmergencia || 0;
    
    // Novas fórmulas solicitadas:
    // TOTAL EM CARTEIRA + PENDENTE DE RECEBIMENTO + RESERVA - DIVIDA PENDENTE.
    const comReserva = totalCarteira + fatPend + res - divPend;
    // TOTAL EM CARTEIRA + PENDENTE DE RECEBIMENTO - DIVIDA PENDENTE.
    const semReserva = totalCarteira + fatPend - divPend;

    return { 
      fatTotal, fatReal, fatPend, divTotal, divPend, totalCarteira, 
      comandoReal: { comReserva, semReserva },
      reserva: res
    };
  }, [currentMonthData]);

  const changeMonth = (dir: number) => {
    let mIdx = MONTHS.indexOf(appState.currentMonth) + dir;
    let year = appState.currentYear;
    if (mIdx > 11) { mIdx = 0; year++; }
    if (mIdx < 0) { mIdx = 11; year--; }
    setAppState(p => ({ ...p, currentMonth: MONTHS[mIdx], currentYear: year }));
  };

  const updateAsset = async (id: string, val: number) => {
    const bals = { ...(currentMonthData.balances || {}) };
    bals[id] = val;
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, balances: bals, month: appState.currentMonth, year: appState.currentYear }, { merge: true });
  };

  const updateReservaEmergencia = async (val: number) => {
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, reservaEmergencia: val, month: appState.currentMonth, year: appState.currentYear }, { merge: true });
  };

  const updateCardDetail = async (id: string, field: string, val: any) => {
    const details = { ...(currentMonthData.cardDetails || {}) };
    details[id] = { ...(details[id] || {}), [field]: val };
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, cardDetails: details, month: appState.currentMonth, year: appState.currentYear }, { merge: true });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col w-full items-center pb-24 overflow-x-hidden animate-in fade-in">
      <header className="bg-white/90 border-b border-slate-100 sticky top-0 z-[110] backdrop-blur-xl w-full h-20 md:h-24 flex items-center px-6 md:px-12 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black shadow-xl">T</div>
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter hidden md:block">Cria Gestão <span className="text-blue-600">Pro</span></h1>
        </div>

        <div className="flex items-center bg-slate-100 rounded-full p-1 scale-90 md:scale-100">
          <button onClick={() => changeMonth(-1)} className="p-2.5 text-slate-400 hover:bg-white rounded-full transition-all"><ChevronLeft size={20}/></button>
          <div className="px-6 text-center min-w-[140px]">
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">{appState.currentMonth}</span>
            <span className="text-[8px] font-bold text-blue-500 block uppercase mt-0.5">{appState.currentYear}</span>
          </div>
          <button onClick={() => changeMonth(1)} className="p-2.5 text-slate-400 hover:bg-white rounded-full transition-all"><ChevronRight size={20}/></button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setShowValues(!showValues)} className={`p-3 rounded-2xl border transition-all ${showValues ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-blue-600 text-white shadow-lg'}`}>{showValues ? <Eye size={20}/> : <EyeOff size={20}/>}</button>
          <button onClick={() => setIsSettingsOpen(true)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100"><Settings size={20}/></button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full space-y-10 flex flex-col items-center">
        <div className="flex justify-center w-full sticky top-[94px] z-[100]">
          <div className="flex items-center gap-1 p-1 bg-white/95 border border-slate-200 rounded-full shadow-2xl backdrop-blur-xl max-w-full overflow-x-auto no-scrollbar">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Painel' }, 
              { id: 'analytics', icon: BarChart3, label: 'Estratégia' }, 
              { id: 'transactions', icon: List, label: 'Fluxos' }, 
              { id: 'partners', icon: Users, label: 'CRM' }, 
              { id: 'calendar', icon: Calendar, label: 'Agenda' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setAppState(p => ({ ...p, view: tab.id as any }))} className={`flex items-center gap-2 px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${appState.view === tab.id ? 'bg-[#020617] text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>
                <tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {appState.view === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full animate-in slide-in-from-bottom-5 duration-700 items-start">
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <KPIItem showValues={showValues} label="Faturamento Previsto" value={totals.fatTotal} color="text-slate-900" icon={TrendingUp} sub="Total de entradas projetadas" />
                <KPIItem showValues={showValues} label="Faturamento Real" value={totals.fatReal} color="text-emerald-600" icon={ShieldCheck} sub="O que já está no bolso" />
                <KPIItem showValues={showValues} label="Dívida Total" value={totals.divTotal} color="text-slate-900" icon={TrendingDown} sub="Saídas fixas + faturas totais" />
                <KPIItem showValues={showValues} label="Dívida Pendente" value={totals.divPend} color="text-rose-600" icon={Clock} sub="O que falta pagar no mês" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <KPIItem dual showValues={showValues} label="Saldo de Comando Real" value={totals.comandoReal} icon={Zap} special />
                <KPIItem showValues={showValues} label="Carteira Global (Disponível)" value={totals.totalCarteira} color="text-indigo-600" icon={Briefcase} sub="Soma de todos os saldos bancários" />
              </div>
              
              <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl flex flex-col gap-6">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><ShieldCheck size={24}/></div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Visão Estratégica {appState.currentMonth}</h3>
                 </div>
                 <p className="text-slate-500 text-sm font-medium leading-relaxed">
                   Seu saldo de comando projeta seu poder de fogo real. A métrica líquida ignora a reserva protegida, focando exclusivamente na operação. Use este número para guiar investimentos agressivos ou contenção de danos.
                 </p>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <div className="bg-[#0b1221] p-8 rounded-[48px] text-white shadow-3xl border border-blue-500/20 relative overflow-hidden group">
                  <div className="absolute top-4 right-4 z-30">
                    <div className="bg-amber-500 text-black text-[7px] font-black px-4 py-1.5 rounded-full shadow-lg animate-pulse uppercase tracking-[0.2em] border border-black/10">
                      PROTEGIDO
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-blue-500/20 rounded-[24px] text-blue-400 group-hover:scale-110 transition-transform"><Heart size={28} fill="currentColor"/></div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Reserva de Emergência</h4>
                      <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">PATRIMÔNIO BLINDADO</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between bg-white/5 p-6 rounded-3xl border border-white/10">
                    <input 
                      type="number" 
                      className="bg-transparent border-none outline-none text-3xl font-black font-mono text-[#4ade80] w-full drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]"
                      value={currentMonthData.reservaEmergencia || ''}
                      onChange={e => updateReservaEmergencia(parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                    />
                    <span className="text-[10px] font-black text-white/20 ml-2">BRL</span>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-2xl">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-8 flex items-center gap-2"><Landmark size={18}/> Bancos Ativos</h4>
                  <div className="space-y-4">
                    {currentMonthData.accounts.length > 0 ? currentMonthData.accounts.map(acc => (
                      <AssetCard key={acc.id} item={acc} showValues={showValues} onUpdateBalance={(v: number) => updateAsset(acc.id, v)} />
                    )) : (
                      <p className="text-[9px] font-bold text-slate-300 uppercase text-center py-4">Configure seus bancos nas configurações</p>
                    )}
                  </div>
               </div>
               
               <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-2xl">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 mb-8 flex items-center gap-2"><CardIcon size={18}/> Faturas Ativas</h4>
                  <div className="space-y-4">
                    {currentMonthData.creditCards.length > 0 ? currentMonthData.creditCards.map(card => (
                      <AssetCard key={card.id} item={card} showValues={showValues} onUpdateBalance={(v: number) => updateAsset(card.id, v)} onUpdateDetail={(f: string, v: any) => updateCardDetail(card.id, f, v)} />
                    )) : (
                      <p className="text-[9px] font-bold text-slate-300 uppercase text-center py-4">Configure seus cartões nas configurações</p>
                    )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {appState.view === 'transactions' && <SplitTransactionView transactions={currentMonthData.transactions} categories={appState.categories} partners={appState.partners} onToggleStatus={() => {}} onDelete={() => {}} onEdit={() => {}} onAddNew={() => {}} onQuickUpdate={() => {}} totals={totals} showValues={showValues} />}
        {appState.view === 'analytics' && <AnalyticsView monthData={currentMonthData} totals={totals} userProfile={appState.userProfile} />}
        {appState.view === 'partners' && <PartnerManager partners={appState.partners} onAdd={() => {}} onDelete={() => {}} onUpdate={() => {}} />}
        {appState.view === 'calendar' && <CalendarView month={appState.currentMonth} year={appState.currentYear} transactions={currentMonthData.transactions} />}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} userProfile={appState.userProfile} userEmail={user.email || ''} onSaveProfile={() => {}} />
    </div>
  );
};

export default Dashboard;
