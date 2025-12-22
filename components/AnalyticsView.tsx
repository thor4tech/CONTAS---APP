
import React, { useState, useMemo, useEffect } from 'react';
import { FinancialData, AnaliseCompleta, UserProfile } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import { AnaliseNaming } from './IA/AnaliseNaming';
import { HistoricoAnalises } from './IA/HistoricoAnalises';
import { FloatingInfo } from './FloatingInfo';
import { Bot, Zap, Clock, Shield, DollarSign, Filter, TrendingUp, Brain, Download, ChevronRight, Sparkles, Trash2, Info } from 'lucide-react';

interface Props {
  monthData: FinancialData;
  totals: any;
  userProfile: UserProfile;
}

const RelatorioRenderer = ({ text }: { text: string }) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-6">
      {lines.map((line, i) => {
        if (line.includes('**') && (line.includes('🩺') || line.includes('⚔️') || line.includes('🚀') || line.includes('📊'))) {
          const content = line.replace(/\*\*/g, '');
          return <h4 key={i} className="text-xl md:text-2xl font-black text-slate-900 border-b-2 border-indigo-100 pb-2 mt-8 mb-4 flex items-center gap-3 uppercase tracking-tighter">{content}</h4>;
        }
        if (/^\d\./.test(line.trim())) {
          return (
            <div key={i} className="flex gap-4 p-4 bg-white rounded-3xl border border-indigo-100 shadow-sm ml-0 md:ml-4">
              <span className="text-indigo-600 font-black">{line.trim().split('.')[0]}.</span>
              <span className="text-slate-700 font-medium text-sm md:text-base">{line.trim().substring(line.trim().indexOf('.') + 1)}</span>
            </div>
          );
        }
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i} className="text-sm md:text-base leading-relaxed text-slate-700">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-indigo-900 font-extrabold bg-indigo-50 px-1.5 rounded-lg border border-indigo-100/30">{part.slice(2, -2)}</strong>;
              }
              return <span key={j}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
};

const AnalyticsView: React.FC<Props> = ({ monthData, totals, userProfile }) => {
  const [loading, setLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnaliseCompleta | null>(null);
  const [historyList, setHistoryList] = useState<AnaliseCompleta[]>([]);

  const UNLIMITED_EMAILS = ['thor4tech@gmail.com', 'cleitontadeu10@gmail.com'];
  
  // Safe access to email with fallback to empty string to prevent toLowerCase error
  const userEmail = (userProfile?.email || '').toLowerCase();
  const isUnlimited = UNLIMITED_EMAILS.includes(userEmail);

  const dailyCredits = useMemo(() => {
    if (isUnlimited) return Infinity;
    const today = new Date().toISOString().split('T')[0];
    if (userProfile.aiUsage?.lastDate === today) {
      return Math.max(0, 3 - userProfile.aiUsage.count);
    }
    return 3;
  }, [userProfile.aiUsage, isUnlimited]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, `users/${auth.currentUser.uid}/analises`), orderBy('data', 'desc'));
    return onSnapshot(q, snap => {
      setHistoryList(snap.docs.map(d => ({ ...d.data(), id: d.id } as AnaliseCompleta)));
    });
  }, []);

  const smeMetrics = useMemo(() => {
    const rev = totals.fatTotal || 0;
    const debt = totals.divTotal || 0;
    const available = totals.totalCarteira || 0;
    const margin = rev > 0 ? ((rev - debt) / rev) * 100 : 0;
    const consumoDiario = debt / 30;
    const folegoReal = consumoDiario > 0 ? available / consumoDiario : 0;
    const equilibrium = rev > 0 ? (debt / rev) * 100 : 0;
    const healthScore = Math.max(0, Math.min(100, Math.round((margin * 0.4) + (folegoReal > 30 ? 30 : (folegoReal / 30) * 30) + (rev > debt ? 30 : 0))));
    return { margin, consumoDiario, folegoReal, equilibrium, healthScore };
  }, [totals]);

  const handleAudit = async () => {
    if (dailyCredits <= 0 && !isUnlimited) {
      alert("Créditos diários esgotados. Novos créditos amanhã!");
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise a empresa ${userProfile.company || 'Minha Empresa'} para ${monthData.month}/${monthData.year}. Faturamento: ${totals.fatReal}. Dívida: ${totals.divTotal}. Fôlego: ${smeMetrics.folegoReal} dias. Dê um diagnóstico curto com 3 ações práticas.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      const indicadores = {
        indiceFolego: Math.floor(smeMetrics.folegoReal),
        endividamento: parseFloat(smeMetrics.equilibrium.toFixed(1)),
        taxaConversao: 0,
        margemLucro: parseFloat(smeMetrics.margin.toFixed(1)),
        tendencia: smeMetrics.margin > 10 ? 'FORTE_CRESCIMENTO' : 'ESTÁVEL',
        saudeGeral: smeMetrics.healthScore
      };

      const result = response.text || '';
      const baseAnalise = { indicadores, data: new Date().toISOString() };
      const nome = AnaliseNaming.gerarNomeAutomatico(baseAnalise as any);
      
      const novaAnalise: Partial<AnaliseCompleta> = {
        nome, nomeEditavel: true, tags: AnaliseNaming.gerarTagsAutomaticas(baseAnalise as any),
        data: baseAnalise.data, indicadores, relatorio: result, metadados: { versaoIA: '5.2 Master', tempoProcessamento: 2000, perfilUsuario: userProfile.planId }
      };

      if (auth.currentUser) {
        await addDoc(collection(db, `users/${auth.currentUser.uid}/analises`), novaAnalise);
        
        const today = new Date().toISOString().split('T')[0];
        const newCount = (userProfile.aiUsage?.lastDate === today ? userProfile.aiUsage.count : 0) + 1;
        await updateDoc(doc(db, `users/${auth.currentUser.uid}/profile`, 'settings'), {
          aiUsage: { lastDate: today, count: newCount }
        });
      }
      setCurrentAnalysis(novaAnalise as AnaliseCompleta);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar análise. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-10 animate-in fade-in pb-20 max-w-7xl mx-auto px-4">
      {/* Credit Header */}
      <div className="flex justify-center">
         <div className="bg-[#020617] px-8 py-3 rounded-full border border-white/10 flex items-center gap-4 shadow-2xl">
            <div className="flex items-center gap-2">
               <Zap size={14} className="text-amber-400" fill="currentColor" />
               <span className="text-[10px] font-black text-white uppercase tracking-widest">Créditos de IA:</span>
            </div>
            <span className="text-sm font-black font-mono text-amber-400">
               {isUnlimited ? '∞ ILIMITADOS' : `${dailyCredits} RESTANTES`}
            </span>
            {!isUnlimited && <div className="w-px h-4 bg-white/10 mx-2" />}
            {!isUnlimited && <span className="text-[8px] font-bold text-slate-500 uppercase">Renova em 24h</span>}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <MetricCard label="Saúde Geral" value={smeMetrics.healthScore + '%'} icon={Shield} color="text-indigo-600" sub="Score Operacional" />
         <MetricCard label="Ponto Equilíbrio" value={smeMetrics.equilibrium.toFixed(1) + '%'} icon={Filter} color="text-amber-500" sub="Comprometimento" />
         <MetricCard label="Fôlego de Caixa" value={smeMetrics.folegoReal.toFixed(0) + ' d'} icon={Clock} color="text-emerald-500" sub="Dias Sobrevivência" />
         <MetricCard label="Custo Diário" value={smeMetrics.consumoDiario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={DollarSign} color="text-rose-500" sub="Burn Rate Médio" />
      </div>

      {/* Main Action - Centralized Button */}
      <div className="flex flex-col items-center gap-8 py-10">
         <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-indigo-600/10 rounded-[32px] flex items-center justify-center mx-auto border-2 border-indigo-500/20 shadow-inner">
               <Brain size={48} className="text-indigo-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Estrategista Master</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">Sua inteligência artificial está pronta para auditar os números deste mês e fornecer táticas de guerra.</p>
         </div>

         <button 
           onClick={handleAudit} 
           disabled={loading || (dailyCredits <= 0 && !isUnlimited)}
           className={`group relative px-16 py-8 rounded-[32px] text-lg font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4 shadow-4xl
             ${loading || (dailyCredits <= 0 && !isUnlimited) 
               ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
               : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95'}`}
         >
            {loading ? <Sparkles className="animate-spin" /> : <Zap className="group-hover:animate-pulse" />}
            {loading ? 'Consultando IA...' : 'Gerar Auditoria Master'}
            <div className="absolute -top-3 -right-3 bg-amber-400 text-[#020617] px-3 py-1 rounded-lg text-[9px] font-black shadow-xl">
               {isUnlimited ? '∞' : '-1 CRÉDITO'}
            </div>
         </button>
      </div>

      {/* History and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 bg-white rounded-[56px] border border-slate-200 shadow-3xl overflow-hidden min-h-[500px] flex flex-col p-8 md:p-16">
            {currentAnalysis ? (
              <div className="animate-in zoom-in-95 duration-500 flex flex-col h-full">
                 <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-6">
                       <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-600"><Sparkles size={32} /></div>
                       <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{currentAnalysis.nome}</h4>
                    </div>
                    <button onClick={() => setCurrentAnalysis(null)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400"><Download size={24}/></button>
                 </div>
                 <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 flex-1 overflow-y-auto no-scrollbar shadow-inner">
                    <RelatorioRenderer text={currentAnalysis.relatorio} />
                 </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                 <Bot size={80} strokeWidth={1} className="text-slate-300 mb-6" />
                 <p className="text-[11px] font-black uppercase tracking-[0.4em] max-w-xs">Nenhuma auditoria selecionada. Clique no histórico ou gere uma nova.</p>
              </div>
            )}
        </div>

        <div className="lg:col-span-4">
           <HistoricoAnalises 
             analises={historyList}
             onSelectAnalise={(id) => setCurrentAnalysis(historyList.find(h => h.id === id) || null)}
             onRenameAnalise={async (id, name) => { await updateDoc(doc(db, `users/${auth.currentUser?.uid}/analises`, id), { nome: name }) }}
             onDeleteAnalise={async (id) => { await deleteDoc(doc(db, `users/${auth.currentUser?.uid}/analises`, id)) }}
           />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color, sub }: any) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-500">
    <div className="flex justify-between items-start">
       <div className="p-4 bg-slate-50 text-slate-300 rounded-[24px] group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner"><Icon size={24}/></div>
       <span className={`text-2xl font-black font-mono tracking-tighter ${color}`}>{value}</span>
    </div>
    <div className="space-y-1">
       <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] block">{label}</span>
       <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">{sub}</span>
    </div>
  </div>
);

export default AnalyticsView;
