
import React, { useState, useEffect, useMemo } from 'react';
import { FinancialData, UserProfile } from '../types';
import { GoogleGenAI } from "@google/genai";
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, deleteDoc, doc, getDocs, setDoc, increment } from 'firebase/firestore';
import { format } from 'date-fns';
import { MONTHS } from '../constants';
import ConfirmModal from './ConfirmModal';
import { 
  Sparkles, Activity, Bot, Zap, Copy, Check, Clock, Trash2, Rocket, DollarSign, Filter, Brain, ChevronRight
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
  
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

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
    onSnapshot(query(collection(db, `users/${auth.currentUser.uid}/data/${monthId}/ai_history`), orderBy('createdAt', 'desc'), limit(15)), snap => {
      const historyData = snap.docs.map(d => ({ id: d.id, ...d.data() })) as AIInsight[];
      setHistory(historyData);
      if (historyData.length > 0 && !analysis && !isActivated) { setAnalysis(historyData[0].text); setIsActivated(true); }
    });
    onSnapshot(doc(db, `users/${auth.currentUser.uid}/usage`, todayStr), docSnap => setDailyUsage(docSnap.exists() ? docSnap.data().count || 0 : 0));
  }, [monthId, todayStr]);

  const fetchAIAnalysis = async () => {
    if (!auth.currentUser || (!isInfinite && dailyUsage >= maxCredits)) return;
    setLoading(true);
    setIsActivated(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `ANALISE FINANCEIRA MASTER PRO - FOCO: ${aiFocus.toUpperCase()}
      DADOS: Faturamento R$ ${totals.totalIncomes}, Gastos R$ ${totals.totalExpenses}, Reserva R$ ${totals.reservaValue}, Liquidez R$ ${totals.availableCash}.
      RESPONDA OBRIGATORIAMENTE EM PORTUGUÊS (BR). Estrutura: Resumo Executivo, Riscos, Plano de Ação e Conclusão.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { systemInstruction: "Você é um CFO consultor financeiro sênior brasileiro. Seja direto, técnico e estratégico. Linguagem: Português do Brasil." }
      });
      
      const text = response.text || "Erro ao gerar insight.";
      setAnalysis(text);
      await setDoc(doc(db, `users/${auth.currentUser.uid}/usage`, todayStr), { count: increment(1) }, { merge: true });
      await addDoc(collection(db, `users/${auth.currentUser.uid}/data/${monthId}/ai_history`), { text, createdAt: serverTimestamp(), focus: aiFocus });
    } catch (e) { setAnalysis("Erro na análise preditiva."); } finally { setLoading(false); }
  };

  const renderMarkdown = (text: string) => text.split('\n').map((line, i) => {
    if (line.startsWith('###')) return <h4 key={i} className="text-sm font-black text-slate-900 uppercase mt-6 mb-3 border-l-4 border-blue-600 pl-3">{line.replace('###', '').trim()}</h4>;
    return <p key={i} className="text-[11px] text-slate-600 mb-3 leading-relaxed">{line.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-slate-900 font-black">{part}</strong> : part)}</p>;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <MetricCard label="Equilíbrio" value={Math.min((totals.totalIncomes/(totals.totalExpenses||1))*100, 100).toFixed(1) + '%'} icon={Filter} color="text-amber-500" />
         <MetricCard label="Margem Real" value={(totals.totalIncomes > 0 ? ((totals.totalIncomes - totals.totalExpenses)/totals.totalIncomes)*100 : 0).toFixed(1) + '%'} icon={DollarSign} color="text-emerald-500" />
         <MetricCard label="Fôlego (Dias)" value={((totals.availableCash / ((totals.totalExpenses/30)||1)) || 30).toFixed(0)} icon={Clock} color="text-indigo-500" />
         <MetricCard label="Gasto Diário" value={(totals.totalExpenses/22 || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={Zap} color="text-slate-900" />
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-4xl overflow-hidden flex flex-col min-h-[500px]">
        <div className="px-6 py-8 bg-[#020617] flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl"><Bot size={24} /></div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tighter uppercase">Master Intelligence <span className="text-blue-400">PRO</span></h3>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">{isInfinite ? 'ACESSO ILIMITADO' : `${remainingCredits} CRÉDITOS DISPONÍVEIS`}</p>
              </div>
           </div>
           <div className="flex gap-2 bg-white/5 p-1 rounded-2xl">
              {(['geral', 'custos', 'crise'] as const).map(f => (
                <button key={f} onClick={() => setAiFocus(f)} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${aiFocus === f ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}>{f}</button>
              ))}
           </div>
        </div>

        <div className="p-8 flex-1 flex flex-col justify-center">
           {loading ? (
             <div className="flex flex-col items-center gap-4 animate-pulse">
                <Brain size={48} className="text-blue-600 animate-bounce" />
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Consultando Estrategista IA...</span>
             </div>
           ) : !isActivated ? (
             <div className="text-center space-y-6">
                <Brain size={64} className="mx-auto text-slate-200" />
                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">Pronto para a Auditoria?</h4>
                <button onClick={fetchAIAnalysis} className="px-10 py-5 bg-[#020617] text-white rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">Ativar Análise ({aiFocus})</button>
             </div>
           ) : (
             <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 relative">
                   <button onClick={() => { navigator.clipboard.writeText(analysis || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="absolute top-4 right-4 p-3 bg-white rounded-xl shadow-sm hover:text-blue-600 transition-all">{copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}</button>
                   {analysis && renderMarkdown(analysis)}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-lg flex flex-col gap-4">
    <div className="flex justify-between items-start">
       <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl"><Icon size={18}/></div>
       <span className={`text-xl font-black font-mono tracking-tighter ${color}`}>{value}</span>
    </div>
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
  </div>
);

export default AnalyticsView;
