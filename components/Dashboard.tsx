
import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../lib/firebase';
import { onSnapshot, doc, setDoc, getDoc, query, collection, updateDoc, arrayUnion } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { MONTHS, DEFAULT_CATEGORIES, INITIAL_DATA } from '../constants';
import { AppState, FinancialData, BaseTransaction, Category, Partner, UserProfile, AssetMetadata, Situation } from '../types';
import SplitTransactionView from './SplitTransactionView';
import PartnerManager from './PartnerManager';
import CalendarView from './CalendarView';
import SettingsModal from './SettingsModal';
import AnalyticsView from './AnalyticsView';
import ReferralView from './ReferralView';
import OnboardingWizard from './Onboarding/OnboardingWizard';
import ConfirmModal from './ConfirmModal';
import TransactionModal from './TransactionModal';
import CategoryModal from './CategoryModal';
import { FloatingInfo } from './FloatingInfo';
import { 
  ChevronLeft, ChevronRight, LayoutDashboard, 
  Calendar, List, Users, Activity, 
  Landmark, Zap, Settings, CreditCard as CardIcon, 
  BarChart3, Heart, TrendingDown, TrendingUp, Clock, ShieldCheck,
  Briefcase, Eye, EyeOff, Target, ArrowUpRight, Share2, Copy, Check, CalendarDays, Wallet, Building2, Lock,
  Search, Bell, Moon, LogOut, Menu, X, Edit2, Eraser, Trash2
} from 'lucide-react';
import { addMonths, subMonths, endOfMonth, isBefore, startOfMonth, getDate, setDate, lastDayOfMonth, format } from 'date-fns';

interface DashboardProps {
  user: any;
}

// --- SUB-COMPONENTES DE UI ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-5 rounded-[20px] transition-all duration-300 group ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
  >
    <Icon size={22} className={`transition-colors ${active ? 'text-white' : 'text-slate-300 group-hover:text-slate-500'}`} strokeWidth={2.5} />
    <span className="text-[12px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

const KPIItem = ({ label, value, icon: Icon, color, showValues, info, gradient }: any) => {
  const iconStyles: any = {
    'blue': 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-blue-200',
    'emerald': 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-200',
    'amber': 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-200',
    'rose': 'bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-rose-200',
    'slate': 'bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-slate-300',
  };

  const selectedStyle = iconStyles[gradient] || iconStyles['slate'];
  
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between min-h-[160px] relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3.5 rounded-2xl shadow-lg ${selectedStyle} group-hover:scale-110 transition-transform duration-300 ring-2 ring-white`}>
           <Icon size={22} strokeWidth={2.5} />
        </div>
        <div className="flex items-center">
           <FloatingInfo title={label} text={info} />
        </div>
      </div>
      <div className="relative z-10">
        <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 opacity-60 ${color}`}>{label}</span>
        <div className={`text-3xl font-black font-mono tracking-tighter ${color}`}>
          {showValues ? (
            (value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          ) : '••••••'}
        </div>
      </div>
      <div className={`absolute -right-6 -bottom-6 opacity-[0.05] ${color} scale-[2.5] pointer-events-none`}>
         <Icon size={64} />
      </div>
    </div>
  );
};

const BankRow = ({ item, onUpdateBalance, showValues }: any) => {
  const [val, setVal] = useState(item.balance?.toString() || "0");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { if (!isEditing) setVal(item.balance?.toString() || "0"); }, [item.balance, isEditing]);

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    onUpdateBalance(parseFloat(val) || 0);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-6 hover:bg-slate-50 rounded-3xl transition-colors group border-b border-slate-50 last:border-0">
       <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200/50 shadow-sm group-hover:scale-105 transition-transform">
             <Building2 size={24} />
          </div>
          <div>
             <span className="text-sm font-black uppercase tracking-tight text-slate-900 block mb-1">{item.name}</span>
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-lg">Conta Corrente</span>
          </div>
       </div>
       <div>
          {isEditing ? (
             <form onSubmit={handleSave} className="flex items-center">
                <input 
                  autoFocus 
                  type="number" step="0.01"
                  className="w-32 md:w-40 bg-indigo-50/30 border-b-2 border-indigo-500 rounded-lg px-2 py-1 text-right font-mono font-black text-lg outline-none text-indigo-700 transition-all placeholder:text-indigo-300"
                  value={val}
                  onChange={e => setVal(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onBlur={() => setTimeout(handleSave, 200)}
                />
             </form>
          ) : (
             <div onClick={() => setIsEditing(true)} className="text-right cursor-pointer hover:scale-105 transition-transform origin-right p-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100">
                <div className={`font-black font-mono text-slate-900 text-lg md:text-xl ${showValues ? '' : 'tracking-widest'}`}>
                   {showValues ? (item.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '•••••'}
                </div>
             </div>
          )}
       </div>
    </div>
  );
};

const CreditCardCompact = ({ item, onUpdateDetail, showValues, onUpdateBalance }: any) => {
   const [val, setVal] = useState(item.balance?.toString() || "0");
   const [isEditing, setIsEditing] = useState(false);
   
   const [isEditingDate, setIsEditingDate] = useState(false);
   const [dateVal, setDateVal] = useState(item.dueDate || '10');

   useEffect(() => { if (!isEditing) setVal(item.balance?.toString() || "0"); }, [item.balance, isEditing]);
   useEffect(() => { if (!isEditingDate) setDateVal(item.dueDate || '10'); }, [item.dueDate, isEditingDate]);

   const handleSave = (e?: React.FormEvent) => {
     e?.preventDefault();
     onUpdateBalance(parseFloat(val) || 0);
     setIsEditing(false);
   };

   const handleSaveDate = (e?: React.FormEvent) => {
     e?.preventDefault();
     if(parseInt(dateVal) > 0 && parseInt(dateVal) <= 31) {
        onUpdateDetail('dueDate', dateVal);
     }
     setIsEditingDate(false);
   };

   const getCardStyle = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes('nubank')) return 'bg-[#820ad1]';
      if (n.includes('inter')) return 'bg-[#ff7a00]';
      if (n.includes('xp')) return 'bg-slate-900';
      return 'bg-[#1e293b]';
   };

   return (
      <div className={`${getCardStyle(item.name)} p-6 rounded-[32px] text-white shadow-lg relative overflow-hidden group transition-transform hover:-translate-y-1 hover:shadow-2xl`}>
         <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm shadow-inner border border-white/10">
                  <CardIcon size={18} className="text-white/90"/>
               </div>
               <span className="text-xs font-black uppercase tracking-widest truncate max-w-[120px] text-shadow-sm">{item.name}</span>
            </div>
            <button 
               onClick={() => onUpdateDetail('situation', item.situation === 'PAGO' ? 'PENDENTE' : 'PAGO')}
               className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border tracking-widest transition-all ${item.situation === 'PAGO' ? 'bg-emerald-50 border-emerald-400 text-white shadow-lg' : 'bg-black/20 border-white/20 text-white/50 hover:bg-black/40 hover:text-white hover:border-white/40'}`}
            >
               {item.situation}
            </button>
         </div>
         <div className="mb-4">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-2">Fatura Atual</span>
            {isEditing ? (
                <form onSubmit={handleSave}>
                   <input 
                     autoFocus 
                     type="number" step="0.01" 
                     className="w-full bg-black/20 rounded-xl px-3 py-2 text-2xl font-mono font-black text-white outline-none border border-white/20 focus:border-white/50 transition-all shadow-inner" 
                     value={val} 
                     onChange={e => setVal(e.target.value)} 
                     onFocus={(e) => e.target.select()}
                     onBlur={() => setTimeout(handleSave, 200)} 
                   />
                </form>
            ) : (
                <div onClick={() => setIsEditing(true)} className="text-3xl font-mono font-black tracking-tighter cursor-pointer hover:opacity-80 transition-opacity p-1 -ml-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10">
                   {showValues ? (item.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '••••••'}
                </div>
            )}
         </div>
         <div className="pt-4 border-t border-white/10 min-h-[42px] flex items-center">
            {isEditingDate ? (
                <form onSubmit={handleSaveDate} className="flex items-center gap-3 w-full animate-in fade-in duration-200">
                   <div className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-1.5 border border-white/20 w-full shadow-inner">
                      <CalendarDays size={14} className="text-white/60" />
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest whitespace-nowrap">DIA</span>
                      <input 
                        autoFocus
                        type="number"
                        min="1"
                        max="31"
                        className="w-full bg-transparent text-sm font-black text-white outline-none text-center"
                        value={dateVal}
                        onChange={e => setDateVal(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        onBlur={() => setTimeout(handleSaveDate, 200)}
                      />
                   </div>
                </form>
            ) : (
                <div 
                  onClick={() => setIsEditingDate(true)} 
                  className="flex justify-between items-center w-full cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-xl transition-colors group/date"
                >
                   <div className="flex items-center gap-2 text-[9px] font-bold text-white/60 uppercase tracking-widest group-hover/date:text-white transition-colors">
                      <CalendarDays size={12}/> Vence dia <span className="text-white font-black text-xs ml-1 border-b border-white/20 pb-0.5 shadow-sm">{item.dueDate || '10'}</span>
                   </div>
                   <div className="h-2 w-2 rounded-full bg-white/20 animate-pulse group-hover/date:bg-white transition-colors shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                </div>
            )}
         </div>
      </div>
   );
};

const ReservaWidget = ({ value, onChange, showValues }: any) => {
  return (
    <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group border border-slate-800 ring-1 ring-white/5">
      <div className="absolute top-0 right-0 p-16 opacity-[0.03] text-white rotate-12 pointer-events-none transition-transform group-hover:scale-110 duration-700">
         <ShieldCheck size={120}/>
      </div>
      
      <div className="relative z-10 flex flex-col justify-between h-full gap-6">
         <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reserva de Emergência</span>
                  <FloatingInfo title="Reserva" text="Valor guardado em conta separada (Cofre/Investimento). Este valor SOMA ao seu patrimônio total." />
               </div>
               <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest animate-pulse">● Blindado</span>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl text-white shadow-[0_10px_20px_rgba(16,185,129,0.3)] ring-2 ring-white/20 transform group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
               <ShieldCheck size={26} strokeWidth={2.5} className="drop-shadow-md" />
            </div>
         </div>
         
         <div className="bg-[#050912]/60 p-5 rounded-[24px] border border-white/5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] flex items-center gap-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
            <span className="text-slate-600 font-mono font-black text-xl select-none z-10">R$</span>
            <input 
               type="number" 
               className="bg-transparent border-none outline-none text-3xl md:text-4xl font-black font-mono text-white w-full placeholder:text-slate-800 p-0 focus:ring-0 z-10 text-shadow-lg"
               value={value || ''}
               onChange={e => onChange(parseFloat(e.target.value) || 0)}
               onFocus={(e) => e.target.select()}
               placeholder="0,00"
            />
         </div>

         <div className="pt-4 border-t border-white/5 flex justify-between items-center">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Patrimônio Protegido</span>
            <Lock size={12} className="text-slate-600" />
         </div>
      </div>
   </div>
  );
};

const ComandoWidget = ({ value, showValues }: any) => {
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group border border-indigo-500/30 flex flex-col justify-between ring-1 ring-white/10">
       <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-white rounded-full blur-[120px] opacity-10 -mr-20 -mt-20 pointer-events-none animate-pulse"></div>
       <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-indigo-900 rounded-full blur-[100px] opacity-40 -ml-10 -mb-10 pointer-events-none"></div>
       
       <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg"><Zap size={20} className="text-amber-300 drop-shadow-md" fill="currentColor" /></div>
                <div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100 block">Poder de Comando</span>
                   <div className="flex items-center mt-1">
                      <FloatingInfo title="Comando Real" text="Projeção de fim de mês: (Saldo Atual + A Receber) - (Contas a Pagar). Se positivo, você fecha o mês no verde." />
                   </div>
                </div>
             </div>
          </div>
          
          <div className="space-y-6">
             <div className="bg-white/10 p-5 rounded-[24px] border border-white/10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
                <span className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest block mb-2 flex items-center gap-2"><Activity size={12}/> Líquido (Sem Reserva)</span>
                <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter text-white drop-shadow-md">
                   {showValues ? (value?.semReserva || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : 'R$ ••••••'}
                </div>
             </div>
             <div className="px-2 pt-2">
                <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest block mb-1">Total (Com Reserva)</span>
                <div className="text-xl font-black font-mono tracking-tighter text-indigo-200 opacity-90 text-shadow-sm">
                   {showValues ? (value?.comReserva || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : 'R$ ••••••'}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [showValues, setShowValues] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<BaseTransaction | undefined>(undefined);
  const [defaultTransactionType, setDefaultTransactionType] = useState<'Receita' | 'Despesa'>('Despesa');
  
  // Novo estado para exclusão com pop-up
  const [transactionToDeleteId, setTransactionToDeleteId] = useState<string | null>(null);

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
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.view) {
        setAppState(p => ({ ...p, view: event.state.view }));
      } else {
        setAppState(p => ({ ...p, view: 'dashboard' }));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setView = (newView: any) => {
    setAppState(p => ({ ...p, view: newView }));
    window.history.pushState({ view: newView }, '', '');
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (!user?.uid) return;
    onSnapshot(doc(db, `users/${user.uid}/profile`, 'settings'), snap => {
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        setAppState(p => ({ 
          ...p, 
          userProfile: profile,
          categories: profile.customCategories || DEFAULT_CATEGORIES 
        }));
        if (profile.onboardingCompleto === false) setAppState(p => ({ ...p, view: 'onboarding' }));
      }
    });
    onSnapshot(query(collection(db, `users/${user.uid}/data`)), snap => {
        setAppState(p => ({ ...p, data: snap.docs.map(d => ({...d.data(), docId: d.id}) as FinancialData) }));
    });
    onSnapshot(query(collection(db, `users/${user.uid}/partners`)), snap => setAppState(p => ({ ...p, partners: snap.docs.map(d => d.data() as Partner) })));
  }, [user?.uid]);

  const currentMonthId = `${appState.currentYear}-${(MONTHS.indexOf(appState.currentMonth) + 1).toString().padStart(2, '0')}`;
  
  const currentMonthData = useMemo(() => {
    const found = appState.data.find(d => `${d.year}-${(MONTHS.indexOf(d.month) + 1).toString().padStart(2, '0')}` === currentMonthId);
    
    const completeData: FinancialData = {
      month: found?.month || appState.currentMonth,
      year: found?.year || appState.currentYear,
      metaFaturamento: found?.metaFaturamento || 0,
      reserva: found?.reserva || 0,
      reservaEmergencia: found?.reservaEmergencia || 0,
      investimento: found?.investimento || 0,
      transactions: found?.transactions || [],
      balances: found?.balances || {},
      cardDetails: found?.cardDetails || {}
    };

    const assets = appState.userProfile.globalAssets || [];
    return {
      ...completeData,
      accounts: assets.filter(a => a.type === 'bank').map(a => ({ ...a, balance: (completeData.balances || {})[a.id] || 0 })),
      creditCards: assets.filter(a => a.type === 'card').map(a => ({ 
        ...a, 
        balance: (completeData.balances || {})[a.id] || 0, 
        dueDate: completeData.cardDetails?.[a.id]?.dueDate || '10', 
        situation: completeData.cardDetails?.[a.id]?.situation || 'PENDENTE' 
      }))
    };
  }, [currentMonthId, appState.data, appState.userProfile, appState.currentMonth, appState.currentYear]);

  const totals = useMemo(() => {
    const txs = currentMonthData.transactions || [];
    const fatTotal = txs.filter(t => t.type === 'Receita').reduce((a, t) => a + (t.value || 0), 0);
    const fatReal = txs.filter(t => t.type === 'Receita' && t.situation === 'PAGO').reduce((a, t) => a + (t.value || 0), 0);
    const fatPend = txs.filter(t => t.type === 'Receita' && t.situation !== 'PAGO').reduce((a, t) => a + (t.value || 0), 0);
    const divTotal = txs.filter(t => t.type === 'Despesa').reduce((a, t) => a + (t.value || 0), 0) + currentMonthData.creditCards.reduce((a, c) => a + (c.balance || 0), 0);
    const divPend = txs.filter(t => t.type === 'Despesa' && t.situation !== 'PAGO').reduce((a, t) => a + (t.value || 0), 0) + 
                  currentMonthData.creditCards.filter(c => c.situation !== 'PAGO').reduce((a, c) => a + (c.balance || 0), 0);
    
    const saldoBancos = currentMonthData.accounts.reduce((a, b) => a + (b.balance || 0), 0);
    const res = currentMonthData.reservaEmergencia || 0;
    const totalCarteira = saldoBancos + res;
    const disponivel = saldoBancos;
    const meta = appState.userProfile.defaultMeta || 0;
    
    const comReserva = totalCarteira + fatPend - divPend;
    const semReserva = disponivel + fatPend - divPend;

    const metaProgresso = meta > 0 ? (fatReal / meta) * 100 : 0;
    const gapMeta = Math.max(0, meta - fatReal);
    
    return { 
      fatTotal, fatReal, fatPend, divTotal, divPend, 
      totalCarteira, 
      saldoBancos,
      meta, metaProgresso, gapMeta,
      comandoReal: { comReserva, semReserva },
      reserva: res,
      disponivel
    };
  }, [currentMonthData, appState.userProfile.defaultMeta]);

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
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, balances: bals }, { merge: true });
  };

  const updateReservaEmergencia = async (val: number) => {
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, reservaEmergencia: val }, { merge: true });
  };

  const updateCardDetail = async (id: string, field: string, val: any) => {
    const details = { ...(currentMonthData.cardDetails || {}) };
    details[id] = { ...(details[id] || {}), [field]: val };
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, cardDetails: details }, { merge: true });
  };

  const handleQuickUpdateTransaction = async (id: string, field: keyof BaseTransaction, value: any) => {
    const txs = [...(currentMonthData.transactions || [])];
    const idx = txs.findIndex(t => t.id === id);
    if (idx !== -1) {
      txs[idx] = { ...txs[idx], [field]: value };
      await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, transactions: txs }, { merge: true });
    }
  };

  const handleToggleStatus = async (id: string) => {
    const txs = [...(currentMonthData.transactions || [])];
    const idx = txs.findIndex(t => t.id === id);
    if (idx !== -1) {
      const current = txs[idx].situation;
      let next: Situation = 'PENDENTE';
      if (current === 'PENDENTE') next = 'PAGO';
      else if (current === 'PAGO') next = 'ATRASADO';
      else if (current === 'ATRASADO') next = 'PENDENTE';
      else next = 'PENDENTE';
      
      txs[idx] = { ...txs[idx], situation: next };
      await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, transactions: txs }, { merge: true });
    }
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDeleteId) return;
    const txs = (currentMonthData.transactions || []).filter(t => t.id !== transactionToDeleteId);
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, transactions: txs }, { merge: true });
    setTransactionToDeleteId(null);
  };

  const handleClearMonth = async () => {
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, transactions: [] }, { merge: true });
    setIsClearModalOpen(false);
  };

  const handleSaveTransaction = async (transactions: BaseTransaction[]) => {
    if (transactions.length === 0) return;
    const updatesByMonth: Record<string, BaseTransaction[]> = {};
    
    transactions.forEach(tx => {
       const date = new Date(tx.dueDate + 'T00:00:00');
       const mId = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
       const txWithCorrectMonth = { ...tx, monthRef: mId };
       if (!updatesByMonth[mId]) updatesByMonth[mId] = [];
       updatesByMonth[mId].push(txWithCorrectMonth);
    });

    for (const [mId, newTxs] of Object.entries(updatesByMonth)) {
       const docRef = doc(db, `users/${user.uid}/data`, mId);
       const docSnap = await getDoc(docRef);
       
       let monthDataToUpdate: FinancialData;
       if (docSnap.exists()) {
          monthDataToUpdate = docSnap.data() as FinancialData;
       } else {
          const [yearStr, monthNumStr] = mId.split('-');
          monthDataToUpdate = { 
            ...INITIAL_DATA, 
            year: parseInt(yearStr), 
            month: MONTHS[parseInt(monthNumStr) - 1],
            transactions: []
          };
       }

       let updatedTransactions = [...(monthDataToUpdate.transactions || [])];
       newTxs.forEach(newTx => {
          const index = updatedTransactions.findIndex(t => t.id === newTx.id);
          if (index !== -1) updatedTransactions[index] = newTx;
          else updatedTransactions.push(newTx);
       });

       await setDoc(docRef, { ...monthDataToUpdate, transactions: updatedTransactions }, { merge: true });
    }
  };

  const handleDuplicatePreviousMonth = async () => {
    let prevIdx = MONTHS.indexOf(appState.currentMonth) - 1;
    let prevYear = appState.currentYear;
    if (prevIdx < 0) { prevIdx = 11; prevYear--; }
    const prevMonthId = `${prevYear}-${(prevIdx + 1).toString().padStart(2, '0')}`;
    const prevData = appState.data.find(d => `${d.year}-${(MONTHS.indexOf(d.month) + 1).toString().padStart(2, '0')}` === prevMonthId);
    if (!prevData || !prevData.transactions || prevData.transactions.length === 0) {
      alert("Nenhum lançamento encontrado no mês anterior para duplicar.");
      setIsDuplicateModalOpen(false);
      return;
    }
    const currentMonthIndex = MONTHS.indexOf(appState.currentMonth);
    const newTransactions = prevData.transactions.map(t => {
      let targetDay = 1;
      try {
        const oldDate = new Date(t.dueDate + 'T00:00:00');
        targetDay = oldDate.getDate();
      } catch { targetDay = 1; }
      const targetDate = setDate(new Date(appState.currentYear, currentMonthIndex), Math.min(targetDay, getDate(lastDayOfMonth(new Date(appState.currentYear, currentMonthIndex)))));
      const newDateStr = targetDate.toISOString().split('T')[0];
      return { 
          ...t, 
          id: Math.random().toString(36).substr(2, 9), 
          dueDate: newDateStr, 
          situation: 'PENDENTE' as Situation, 
          monthRef: currentMonthId 
      };
    });
    const mergedTransactions = [...(currentMonthData.transactions || []), ...newTransactions];
    await setDoc(doc(db, `users/${user.uid}/data`, currentMonthId), { ...currentMonthData, transactions: mergedTransactions }, { merge: true });
    setIsDuplicateModalOpen(false);
  };

  if (appState.view === 'onboarding') return <OnboardingWizard user={user} onFinish={() => setView('dashboard')} />;

  const handleSaveProfile = async (profile: any) => {
    await setDoc(doc(db, `users/${user.uid}/profile`, 'settings'), profile);
  };

  const SidebarContent = () => (
    <>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">C</div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-tight">Cria Gestão <br/><span className="text-indigo-600">Pro</span></h1>
        </div>
        
        <nav className="space-y-3">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={appState.view === 'dashboard'} onClick={() => setView('dashboard')} />
            <SidebarItem icon={BarChart3} label="Estratégia" active={appState.view === 'analytics'} onClick={() => setView('analytics')} />
            <SidebarItem icon={List} label="Fluxos" active={appState.view === 'transactions'} onClick={() => setView('transactions')} />
            <SidebarItem icon={Users} label="CRM" active={appState.view === 'partners'} onClick={() => setView('partners')} />
            <SidebarItem icon={Calendar} label="Agenda" active={appState.view === 'calendar'} onClick={() => setView('calendar')} />
            <SidebarItem icon={Share2} label="Indicar" active={appState.view === 'referral'} onClick={() => setView('referral')} />
        </nav>
      </div>

      <div className="p-8 border-t border-slate-50 mt-auto">
        <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-4 w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors mb-2 border border-slate-100 group">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden border-2 border-white group-hover:border-indigo-100 transition-colors">
              {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : user.email?.[0].toUpperCase()}
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-[11px] font-black text-slate-900 truncate">{user.displayName || user.email?.split('@')[0]}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Configurar</p>
            </div>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col justify-between z-20 shadow-xl">
         <SidebarContent />
      </aside>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900"><X size={24}/></button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
         <header className="px-6 md:px-8 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex justify-between items-center border-b border-slate-100">
            <div className="lg:hidden flex items-center gap-3">
               <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                  <Menu size={24} />
               </button>
            </div>

            <div className="hidden lg:block">
               <h2 className="text-xl font-black text-slate-900 tracking-tight">Visão Geral</h2>
               <p className="text-xs font-medium text-slate-400">Bem-vindo de volta ao comando.</p>
            </div>

            <div className="flex items-center gap-2 md:gap-4 bg-white p-1 rounded-full border border-slate-200 shadow-sm">
               <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><ChevronLeft size={16}/></button>
               <div className="px-2 md:px-6 text-center min-w-[100px] md:min-w-[140px]">
                  <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-900 block">{appState.currentMonth}</span>
                  <span className="text-[8px] md:text-[9px] font-bold uppercase text-indigo-500">{appState.currentYear}</span>
               </div>
               <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><ChevronRight size={16}/></button>
            </div>

            <div className="flex items-center gap-3">
               <button onClick={() => setShowValues(!showValues)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all bg-slate-50 border border-slate-100">{showValues ? <Eye size={20}/> : <EyeOff size={20}/>}</button>
            </div>
         </header>

         <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-slate-50">
            <AnimatePresence mode="wait">
               <motion.div 
                  key={appState.view}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-[1600px] mx-auto space-y-8 pb-10"
               >
                  {appState.view === 'dashboard' && (
                     <>
                        <div className="w-full bg-[#0f172a] rounded-[48px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border border-slate-800">
                           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none"></div>
                           
                           <div className="relative z-10 flex flex-col lg:flex-row justify-between items-end gap-10">
                              <div className="space-y-6">
                                 <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10"><Briefcase size={24} className="text-indigo-400"/></div>
                                    <div className="flex items-center gap-2">
                                       <div>
                                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-1">Carteira Global</span>
                                          <span className="px-3 py-1 rounded-full text-[8px] font-bold uppercase bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 tracking-widest inline-block">Integrado</span>
                                       </div>
                                       <FloatingInfo title="Carteira Global" text="Soma dos saldos bancários + Reserva de Emergência (Patrimônio Total)." />
                                    </div>
                                 </div>
                                 <div>
                                    <div className="text-4xl md:text-8xl font-black font-mono tracking-tighter text-white mb-2 leading-none break-all">
                                       {showValues ? totals.totalCarteira.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ •••••••'}
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium pl-1">Patrimônio líquido consolidado em todas as contas</p>
                                 </div>
                              </div>

                              <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
                                 <div className="bg-[#1e293b]/50 border border-white/10 p-6 rounded-3xl backdrop-blur-md flex-1 lg:min-w-[220px]">
                                    <div className="flex justify-between items-start mb-2">
                                       <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div> Disponível (Livre)</span>
                                       <FloatingInfo title="Disponível" text="Saldo total das contas correntes. Dinheiro livre para movimentação imediata." />
                                    </div>
                                    <div className="text-2xl font-black font-mono text-white tracking-tight">{showValues ? totals.disponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }) : '••••'}</div>
                                    <p className="text-[8px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Para uso imediato</p>
                                 </div>
                                 
                                 <div className="bg-[#1e293b]/50 border border-white/10 p-6 rounded-3xl backdrop-blur-md flex-1 lg:min-w-[220px]">
                                    <div className="flex justify-between items-start mb-2">
                                       <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div> Reserva Protegida</span>
                                       <FloatingInfo title="Reserva Protegida" text="Valor guardado à parte. Soma-se ao patrimônio, mas não conta como liquidez diária." />
                                    </div>
                                    <div className="text-2xl font-black font-mono text-white tracking-tight">{showValues ? (currentMonthData.reservaEmergencia || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }) : '••••'}</div>
                                    <p className="text-[8px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Fundo de Emergência</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                           <KPIItem label="Faturamento Previsto" value={totals.fatTotal} icon={TrendingUp} color="text-blue-600" gradient="blue" showValues={showValues} info="Total projetado de entradas." />
                           <KPIItem label="Faturamento Real" value={totals.fatReal} icon={Check} color="text-emerald-500" gradient="emerald" showValues={showValues} info="O que já caiu na conta." />
                           <KPIItem label="Dívida Total" value={totals.divTotal} icon={TrendingDown} color="text-amber-600" gradient="amber" showValues={showValues} info="Soma de custos fixos e variáveis." />
                           <KPIItem label="Dívida Pendente" value={totals.divPend} icon={Clock} color="text-rose-500" gradient="rose" showValues={showValues} info="Contas a pagar restante." />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                           <div className="lg:col-span-2 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <ReservaWidget value={currentMonthData.reservaEmergencia} onChange={(v: number) => updateReservaEmergencia(v)} showValues={showValues} />
                                 <ComandoWidget value={totals.comandoReal} showValues={showValues} />
                              </div>

                              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl min-h-[400px]">
                                 <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-3">
                                       <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Landmark size={20}/></div>
                                       Bancos Ativos
                                    </h3>
                                    <FloatingInfo title="BANCOS" text="Gerencie os saldos das suas contas correntes aqui. Mantenha atualizado para a Carteira Global refletir a realidade." />
                                 </div>
                                 <div className="space-y-4">
                                    {currentMonthData.accounts.map(acc => (
                                       <BankRow key={acc.id} item={acc} onUpdateBalance={(v: number) => updateAsset(acc.id, v)} showValues={showValues} />
                                    ))}
                                    {currentMonthData.accounts.length === 0 && (
                                       <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center gap-4">
                                          <div className="p-4 bg-slate-50 rounded-full text-slate-300"><Landmark size={32}/></div>
                                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Nenhum banco conectado</p>
                                       </div>
                                    )}
                                 </div>
                                 <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center bg-slate-50 p-6 rounded-3xl">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total em Contas</span>
                                    <span className="text-xl md:text-2xl font-black font-mono text-slate-900">{showValues ? totals.saldoBancos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ •••••'}</span>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-6">
                              <div className="flex items-center justify-between px-2 mb-2">
                                 <div className="flex items-center gap-3">
                                    <CardIcon size={18} className="text-slate-400" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Faturas & Crédito</span>
                                 </div>
                                 <FloatingInfo title="Faturas" text="Controle os pagamentos de cartão de crédito. Isso impacta seu fluxo de caixa futuro." />
                              </div>
                              <div className="space-y-4">
                                 {currentMonthData.creditCards.map(card => (
                                    <CreditCardCompact key={card.id} item={card} onUpdateDetail={(f: string, v: any) => updateCardDetail(card.id, f, v)} showValues={showValues} onUpdateBalance={(v: number) => updateAsset(card.id, v)} />
                                 ))}
                                 {currentMonthData.creditCards.length === 0 && (
                                    <div className="bg-white p-12 rounded-[32px] border border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
                                       <CardIcon size={24} className="text-slate-300"/>
                                       <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Sem cartões ativos</p>
                                    </div>
                                 )}
                              </div>
                           </div>

                        </div>
                     </>
                  )}

                  {appState.view === 'transactions' && (
                    <SplitTransactionView 
                      transactions={currentMonthData.transactions} 
                      categories={appState.categories} 
                      partners={appState.partners} 
                      onToggleStatus={handleToggleStatus} 
                      onDelete={(id) => setTransactionToDeleteId(id)} 
                      onEdit={(tx) => { setEditingTransaction(tx); setIsTransactionModalOpen(true); }} 
                      onAddNew={(type) => { setEditingTransaction(undefined); setDefaultTransactionType(type); setIsTransactionModalOpen(true); }} 
                      onQuickUpdate={handleQuickUpdateTransaction} 
                      totals={totals} 
                      showValues={showValues}
                      onDuplicatePrevious={() => setIsDuplicateModalOpen(true)}
                      onClearMonth={() => setIsClearModalOpen(true)}
                    />
                  )}
                  {appState.view === 'analytics' && (
                    <AnalyticsView 
                      monthData={currentMonthData} 
                      allData={appState.data} 
                      totals={totals} 
                      userProfile={appState.userProfile} 
                    />
                  )}
                  {appState.view === 'partners' && <PartnerManager partners={appState.partners} onAdd={() => {}} onDelete={() => {}} onUpdate={() => {}} />}
                  {appState.view === 'calendar' && <CalendarView month={appState.currentMonth} year={appState.currentYear} transactions={currentMonthData.transactions} />}
                  {appState.view === 'referral' && <ReferralView userProfile={appState.userProfile} />}
               </motion.div>
            </AnimatePresence>
         </div>
      </main>

      {/* MODALS */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} userProfile={appState.view === 'onboarding' ? ({} as UserProfile) : appState.userProfile} userEmail={user.email || ''} onSaveProfile={handleSaveProfile} />
      
      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
        onSave={handleSaveTransaction} 
        onDelete={(id) => setTransactionToDeleteId(id)} 
        categories={appState.categories} 
        partners={appState.partners} 
        initialData={editingTransaction} 
        defaultMonthRef={currentMonthId} 
        defaultType={defaultTransactionType} 
      />

      <ConfirmModal 
        isOpen={transactionToDeleteId !== null} 
        title="Excluir Lançamento?" 
        message="Esta operação é permanente. Deseja realmente remover este registro do seu fluxo?" 
        confirmLabel="Sim, Excluir" 
        cancelLabel="Manter Registro" 
        onConfirm={handleDeleteTransaction} 
        onCancel={() => setTransactionToDeleteId(null)} 
        variant="danger" 
      />

      <ConfirmModal isOpen={isDuplicateModalOpen} title="Duplicar Mês Anterior?" message="Deseja clonar todos os lançamentos do mês passado? Eles serão criados como PENDENTES." confirmLabel="Sim, Duplicar" cancelLabel="Cancelar" onConfirm={handleDuplicatePreviousMonth} onCancel={() => setIsDuplicateModalOpen(false)} variant="info" />
      
      <ConfirmModal isOpen={isClearModalOpen} title="Limpar Tudo?" message="Deseja apagar TODOS os fluxos de entrada e saída deste mês? Esta ação é irreversível." confirmLabel="Sim, Apagar Tudo" cancelLabel="Cancelar" onConfirm={handleClearMonth} onCancel={() => setIsClearModalOpen(false)} variant="danger" />
    </div>
  );
};

export default Dashboard;
