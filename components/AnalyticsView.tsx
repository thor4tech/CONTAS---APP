
import React, { useState, useEffect, useMemo } from 'react';
import { FinancialData, UserProfile } from '../types';
import { GoogleGenAI } from "@google/genai";
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, deleteDoc, doc, getDocs, setDoc, increment, writeBatch } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MONTHS } from '../constants';
import ConfirmModal from './ConfirmModal';
import { 
  Sparkles, Activity, Bot, Zap, Copy, Check, Clock, Trash2, Rocket, DollarSign, Filter, Brain, ChevronRight, History, Trash, AlertCircle, X
} from 'lucide-react';

interface Props {
  monthData: FinancialData;
  totals: any;
}

interface AIInsight {
  id: string;
  text: string;
  createdAt: any;
  focus?: string;
}

const AnalyticsView: React.FC<Props> = ({ monthData, totals }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [history, setHistory] = useState<AIInsight[]>([]);
  const [copied, setCopied] = useState(false);
  const [aiFocus, setAiFocus] = useState<'geral' | 'custos' | 'crescimento' | 'crise'>('geral');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleteAllMode, setIsDeleteAllMode] = useState(false);
  
  const maxCredits = 3;
  const isInfinite = useMemo(() => {
    const email = auth.currentUser?.email;
    const admins = ['thor4tech@gmail.com', 'Cleitontadeu10@gmail.com'];
    return admins.includes(email || '') || profile?.planId === 'MASTER';
  }, [auth.currentUser, profile]);
  
  const [dailyUsage, setDailyUsage] = useState(0);
  const remainingCredits = isInfinite ? Infinity : Math.max(0, maxCredits - dailyUsage);

  const monthId = useMemo(() => `${monthData.year}-${(MONTHS.indexOf(monthData.month) + 1).toString().padStart(2, '0')}`, [monthData]);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!auth.currentUser) return;

    onSnapshot(doc(db, `users/${auth.currentUser.uid}/profile`, 'settings'), snap => snap.exists() && setProfile(snap.data() as UserProfile));

    const historyRef = collection(db, `users/${auth.currentUser.uid}/data/${monthId}/ai_history`);
    const unsubHistory = onSnapshot(query(historyRef, orderBy('createdAt', 'desc'), limit(15)), snap => {
      const historyData = snap.docs.map(d => ({ id: d.id, ...d.data() })) as AIInsight[];
      setHistory(historyData);
      if (historyData.length > 0 && !analysis && !isActivated) {
        setAnalysis(historyData[0].text);
        setIsActivated(true);
      }
    });

    const usageRef = doc(db, `users/${auth.currentUser.uid}/usage`, todayStr);
    const unsubUsage = onSnapshot(usageRef, docSnap => setDailyUsage(docSnap.exists() ? docSnap.data().count || 0 : 0));

    return () => { unsubHistory(); unsubUsage(); };
  }, [monthId, todayStr]);

  const fetchAIAnalysis = async () => {
    if (!auth.currentUser || (!isInfinite && dailyUsage >= maxCredits)) return;
    setLoading(true);
    setIsActivated(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `VOCÊ É UM CFO SÊNIOR BRASILEIRO. ANALISE ESTES DADOS FINANCEIROS DO MÊS: FATURAMENTO R$ ${totals.totalIncomes}, GASTOS R$ ${totals.totalExpenses}, RESERVA R$ ${totals.reservaValue}, LIQUIDEZ R$ ${totals.availableCash}. FOCO: ${aiFocus.toUpperCase()}. RESPONDA EM PORTUGUÊS (BR) COM: 1. RESUMO EXECUTIVO, 2. PONTOS DE RISCO, 3. PLANO DE ATAQUE, 4. CONCLUSÃO. SEJA ESTRATÉGICO.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { systemInstruction: "Estrategista Financeiro Brasileiro de alto nível. Focado em lucro e clareza." }
      });
      
      const text = response.text || "Falha ao processar comando.";
      setAnalysis(text);
      await setDoc(doc(db, `users/${auth.currentUser.uid}/usage`, todayStr), { count: increment(1) }, { merge: true });
      await addDoc(collection(db, `users/${auth.currentUser.uid}/data/${monthId}/ai_history`), { text, createdAt: serverTimestamp(), focus: aiFocus });
    } catch (e) { setAnalysis("Erro de conexão com o estrategista."); } finally { setLoading(false); }
  };

  const renderMarkdown = (text: string) => text.split('\n').map((line, i) => {
    if (line.startsWith('###') || line.match(/^\d\./)) return <h4 key={i} className="text-sm md:text-base font-black text-slate-900 uppercase mt-8 mb-4 border-l-4 border-indigo-600 pl-4 tracking-widest">{line.replace('###', '').trim()}</h4>;
    return <p key={i} className="text-[12px] md:text-[14px] text-slate-600 mb-4 leading-relaxed font-medium">{line.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-slate-950 font-black">{part}</strong> : part)}</p>;
  });

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id);
    setIsDeleteAllMode(false);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteAllClick = () => {
    setIsDeleteAllMode(true);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!auth.currentUser) return;
    if (isDeleteAllMode) {
      const batch = writeBatch(db);
      const snapshot = await getDocs(collection(db, `users/${auth.currentUser.uid}/data/${monthId}/ai_history`));
      snapshot.forEach(docSnap => batch.delete(docSnap.ref));
      await batch.commit();
      setAnalysis(null);
      setIsActivated(false);
    } else if (pendingDeleteId) {
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/data/${monthId}/ai_history`, pendingDeleteId));
      if (history.length <= 1) { setAnalysis(null); setIsActivated(false); }
    }
    setIsConfirmModalOpen(false);
    setPendingDeleteId(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto w-full">
      <div className="flex-1 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <MetricCard label="Equilíbrio" value={Math.min((totals.totalIncomes/(totals.totalExpenses||1))*100, 100).toFixed(1) + '%'} icon={Filter} color="text-amber-500" />
           <MetricCard label="Margem Real" value={(totals.totalIncomes > 0 ? ((totals.totalIncomes - totals.totalExpenses)/totals.totalIncomes)*100 : 0).toFixed(1) + '%'} icon={DollarSign} color="text-emerald-500" />
           <MetricCard label="Fôlego" value={((totals.availableCash / ((totals.totalExpenses/30)||1)) || 0).toFixed(0) + ' d'} icon={Clock} color="text-indigo-500" />
           <MetricCard label="Custo Diário" value={(totals.totalExpenses/22 || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={Zap} color="text-rose-500" />
        </div>

        <div className="bg-white rounded-[48px] md:rounded-[56px] border border-slate-100 shadow-3xl overflow-hidden flex flex-col min-h-[600px] relative">
          <div className="px-6 py-8 md:px-8 md:py-10 bg-[#020617] flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5">
             <div className="flex items-center gap-4 md:gap-5">
                <div className="p-4 bg-indigo-600 text-white rounded-[20px] md:rounded-3xl shadow-2xl shadow-indigo-500/20"><Bot size={32} /></div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-white tracking-tighter uppercase">Auditoria <span className="text-indigo-400">Master</span></h3>
                  <p className="text-[9px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">{isInfinite ? 'ACESSO ILIMITADO' : `${remainingCredits} CRÉDITOS HOJE`}</p>
                </div>
             </div>
             <div className="flex gap-1.5 md:gap-2 bg-white/5 p-1 rounded-2xl border border-white/5 scale-[0.9] md:scale-100">
                {(['geral', 'custos', 'crise'] as const).map(f => (
                  <button key={f} onClick={() => setAiFocus(f)} className={`px-4 py-2 md:px-6 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${aiFocus === f ? 'bg-indigo-600 text-white shadow-xl' : 'text-white/40 hover:text-white'}`}>{f}</button>
                ))}
             </div>
          </div>

          <div className="p-6 md:p-10 flex-1 flex flex-col justify-center relative">
             {loading ? (
               <div className="flex flex-col items-center gap-6 animate-pulse py-20">
                  <Brain size={80} className="text-indigo-600 animate-bounce" />
                  <span className="text-[12px] font-black uppercase text-slate-400 tracking-[0.4em]">Estrategista processando dados...</span>
               </div>
             ) : !isActivated ? (
               <div className="text-center space-y-10 py-10 md:py-20">
                  <Brain size={80} className="mx-auto text-slate-100 mb-4" />
                  <div className="max-w-md mx-auto px-6">
                    <h4 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">Auditoria Preditiva Ativa</h4>
                    <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">Nossa IA analisa o ROI, furos de caixa e sugere ajustes imediatos baseados no seu cenário real deste mês.</p>
                  </div>
                  <button onClick={fetchAIAnalysis} className="px-12 py-5 md:px-14 md:py-6 bg-[#020617] text-white rounded-[24px] md:rounded-[28px] text-[11px] md:text-[12px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 hover:scale-105 transition-all shadow-4xl flex items-center gap-3 mx-auto group">
                    <Zap size={20} className="text-indigo-400 group-hover:text-white" /> Executar Análise ({aiFocus})
                  </button>
               </div>
             ) : (
               <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                  <div className="bg-slate-50/50 p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-slate-100 relative">
                     <div className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-2">
                        <button onClick={() => { navigator.clipboard.writeText(analysis || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-3 bg-white rounded-xl shadow-md hover:text-indigo-600 transition-all">{copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}</button>
                        <button onClick={() => setIsActivated(false)} className="p-3 bg-white rounded-xl shadow-md hover:text-rose-500 transition-all"><X size={20}/></button>
                     </div>
                     <div className="mt-8 md:mt-0">
                       {analysis && renderMarkdown(analysis)}
                     </div>
                     <div className="mt-10 pt-8 border-t border-slate-100 flex justify-center">
                        <button onClick={fetchAIAnalysis} className="flex items-center gap-2 px-6 py-3 bg-[#020617] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"><Zap size={14}/> Reanalisar Agora</button>
                     </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="lg:w-96 space-y-8">
         <div className="bg-white p-6 md:p-10 rounded-[48px] border border-slate-100 shadow-2xl flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
               <div className="flex items-center gap-3 text-slate-900">
                  <History size={20} className="text-indigo-500" />
                  <h4 className="text-[11px] md:text-[12px] font-black uppercase tracking-widest">Histórico</h4>
               </div>
               {history.length > 0 && (
                 <button onClick={handleDeleteAllClick} className="p-2 text-rose-300 hover:text-rose-500 transition-colors" title="Limpar tudo"><Trash size={16}/></button>
               )}
            </div>

            <div className="space-y-4 overflow-y-auto no-scrollbar pr-1 flex-1">
               {history.length > 0 ? (
                 history.map(item => (
                   <div key={item.id} className="group bg-slate-50 p-5 rounded-[28px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all cursor-pointer relative overflow-hidden" onClick={() => setAnalysis(item.text)}>
                      <div className="flex justify-between items-start mb-2">
                         <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${item.focus === 'crise' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-indigo-50 text-indigo-500 border-indigo-100'}`}>
                            {item.focus || 'geral'}
                         </span>
                         <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(item.id); }} className="p-1.5 text-slate-200 hover:text-rose-500 transition-all"><X size={14}/></button>
                      </div>
                      <p className="text-[10px] font-medium text-slate-600 line-clamp-2 leading-relaxed mb-3">{item.text.replace(/[#*]/g, '')}</p>
                      <div className="flex items-center gap-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                         <Clock size={10} /> {item.createdAt ? format(item.createdAt.toDate(), "dd MMM, HH:mm", { locale: ptBR }) : 'Gerando...'}
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
                    <History size={48} className="text-slate-200 mb-4" />
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">Nenhuma auditoria<br/>registrada</p>
                 </div>
               )}
            </div>
         </div>
      </div>

      <ConfirmModal 
        isOpen={isConfirmModalOpen} 
        title={isDeleteAllMode ? "Limpar Histórico" : "Remover Auditoria"} 
        message={isDeleteAllMode ? "Deseja excluir permanentemente todas as auditorias deste mês?" : "Deseja excluir este insight estratégico do seu histórico?"}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmModalOpen(false)}
        variant="danger"
        confirmLabel="Sim, Excluir"
      />
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-5 rounded-[28px] md:rounded-[32px] border border-slate-100 shadow-xl flex flex-col gap-4 group hover:translate-y-[-4px] transition-all">
    <div className="flex justify-between items-start">
       <div className="p-2.5 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner"><Icon size={18}/></div>
       <span className={`text-lg md:text-xl font-black font-mono tracking-tighter ${color}`}>{value}</span>
    </div>
    <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
  </div>
);

export default AnalyticsView;
