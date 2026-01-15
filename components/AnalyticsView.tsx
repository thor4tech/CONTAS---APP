
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FinancialData, AnaliseCompleta, UserProfile, BaseTransaction } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, getDoc, setDoc } from 'firebase/firestore';
import { HistoricoAnalises } from './IA/HistoricoAnalises';
import { AnaliseNaming } from './IA/AnaliseNaming';
import { ADMIN_EMAILS } from '../lib/subscription';
import { GoogleGenAI } from "@google/genai";
import { Bot, Zap, Clock, Shield, DollarSign, Brain, Download, Sparkles, PieChart, CalendarRange, Printer, TrendingDown, CalendarDays, ChevronDown, CheckCircle2, Lock, Crown, ScanFace, Activity, Binary, Aperture, ArrowRight } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../constants';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { format, isWithinInterval, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  monthData: FinancialData;
  allData?: FinancialData[];
  totals: any;
  userProfile: UserProfile;
}

// --- COMPONENTES VISUAIS PREMIUM ---

const NeuralCore = ({ loading, active }: { loading: boolean; active: boolean }) => (
  <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto flex items-center justify-center">
    {/* Camadas de Brilho de Fundo */}
    <div className={`absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl transition-all duration-1000 ${loading ? 'scale-150 opacity-50' : 'scale-100 opacity-20'}`}></div>
    <div className={`absolute inset-0 bg-blue-500/10 rounded-full blur-2xl animate-pulse transition-all duration-500`}></div>
    
    {/* Anéis Orbitais CSS */}
    <div className={`absolute w-full h-full border border-indigo-500/30 rounded-full border-t-transparent animate-[spin_4s_linear_infinite] ${loading ? 'duration-[1s]' : ''}`}></div>
    <div className={`absolute w-[80%] h-[80%] border border-blue-400/30 rounded-full border-b-transparent animate-[spin_6s_linear_infinite_reverse] ${loading ? 'duration-[2s]' : ''}`}></div>
    <div className="absolute w-[60%] h-[60%] border border-emerald-400/20 rounded-full border-l-transparent animate-[spin_8s_linear_infinite]"></div>

    {/* Núcleo Central */}
    <div className={`relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#0f172a] to-black border border-indigo-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)] transition-all duration-500 ${loading ? 'scale-95 border-indigo-400 shadow-[0_0_80px_rgba(79,70,229,0.6)]' : ''}`}>
       <div className="absolute inset-0 rounded-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
       {loading ? (
         <ScanFace size={48} className="text-indigo-400 animate-pulse" />
       ) : active ? (
         <Brain size={48} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
       ) : (
         <Bot size={48} className="text-slate-400" />
       )}
    </div>

    {/* Status Badge */}
    <div className="absolute -bottom-4 bg-[#020617] border border-indigo-500/30 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl">
       <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-ping' : active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-100">
          {loading ? 'PROCESSANDO DADOS...' : active ? 'SISTEMA ONLINE' : 'AGUARDANDO'}
       </span>
    </div>
  </div>
);

const StrategyCard = ({ label, value, icon: Icon, color, sub, trend }: any) => (
  <div className="relative bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[32px] overflow-hidden group hover:bg-white/10 transition-all duration-500">
    <div className={`absolute top-0 right-0 p-16 opacity-[0.05] ${color} rotate-12 transition-transform group-hover:scale-125 duration-700`}>
       <Icon size={80} fill="currentColor" />
    </div>
    <div className="relative z-10 flex justify-between items-start mb-4">
       <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} bg-opacity-10 shadow-lg border border-white/10`}>
          <Icon size={20} className="text-white" />
       </div>
       {trend && (
         <span className={`text-[9px] font-black uppercase tracking-widest py-1 px-2 rounded-lg bg-white/5 border border-white/10 ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
         </span>
       )}
    </div>
    <div className="relative z-10">
       <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">{label}</span>
       <div className="text-2xl md:text-3xl font-black font-mono tracking-tighter text-white drop-shadow-md">
          {value}
       </div>
       <div className="h-0.5 w-12 bg-white/20 mt-3 mb-2 rounded-full overflow-hidden">
          <div className="h-full bg-white/60 w-[60%] animate-pulse"></div>
       </div>
       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{sub}</span>
    </div>
  </div>
);

const RelatorioRenderer = ({ text }: { text: string }) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-6 font-inter text-slate-300">
      {lines.map((line, i) => {
        // Títulos Principais
        if (line.includes('**') && (line.includes('🩺') || line.includes('⚔️') || line.includes('🚀') || line.includes('📊'))) {
          const content = line.replace(/\*\*/g, '');
          return (
            <div key={i} className="mt-10 mb-6 animate-in slide-in-from-left duration-500">
              <h4 className="text-lg md:text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
                 <div className="w-1.5 h-8 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>
                 {content}
              </h4>
              <div className="h-px w-full bg-gradient-to-r from-indigo-500/30 via-indigo-500/10 to-transparent mt-3"></div>
            </div>
          );
        }
        // Itens de lista numerada
        if (/^\d\./.test(line.trim())) {
          return (
            <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors ml-0 md:ml-2 animate-in fade-in duration-700">
              <span className="text-indigo-400 font-black font-mono text-lg">{line.trim().split('.')[0]}</span>
              <span className="text-slate-300 font-medium text-sm md:text-base leading-relaxed">{line.trim().substring(line.trim().indexOf('.') + 1)}</span>
            </div>
          );
        }
        // Parágrafos normais com bold
        const parts = line.split(/(\*\*.*?\*\*)/g);
        if (line.trim().length === 0) return <br key={i}/>;
        return (
          <p key={i} className="text-sm md:text-base leading-relaxed">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-indigo-200 font-bold bg-indigo-500/10 px-1 rounded border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">{part.slice(2, -2)}</strong>;
              }
              return <span key={j}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
};

const AnalyticsView: React.FC<Props> = ({ monthData, allData = [], totals, userProfile }) => {
  const [viewMode, setViewMode] = useState<'ai' | 'reports'>('ai');
  const [loading, setLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnaliseCompleta | null>(null);
  const [historyList, setHistoryList] = useState<AnaliseCompleta[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const reportRef = useRef<HTMLDivElement>(null);

  const userEmail = userProfile?.email ? userProfile.email.toLowerCase() : '';
  const planId = userProfile?.planId || 'ESSENTIAL';
  const isAdm = ADMIN_EMAILS.includes(userEmail);
  const isMaster = planId === 'MASTER';
  const isPro = planId === 'PRO';
  const isTrial = userProfile?.subscriptionStatus === 'TRIAL';
  const isUnlimited = isAdm || isMaster;

  const creditInfo = useMemo(() => {
    if (isUnlimited) return { type: 'unlimited', remaining: Infinity };
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    const lastUsageDate = userProfile.aiUsage?.lastDate || '';
    const lastUsageCount = userProfile.aiUsage?.count || 0;

    if (isTrial) {
      const limit = 3;
      const remaining = Math.max(0, limit - lastUsageCount);
      return { type: 'trial', remaining, limit };
    }
    if (isPro) {
      const limit = 3;
      const usedThisMonth = lastUsageDate.startsWith(currentMonth) ? lastUsageCount : 0;
      const remaining = Math.max(0, limit - usedThisMonth);
      return { type: 'monthly', remaining, limit };
    }
    return { type: 'blocked', remaining: 0, limit: 0 };
  }, [userProfile.aiUsage, isUnlimited, isTrial, isPro]);

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

  const aggregatedReport = useMemo(() => {
    let allTransactions: BaseTransaction[] = [];
    const sourceData = allData.length > 0 ? allData : [monthData];
    
    sourceData.forEach(d => {
      if (d.transactions) allTransactions = [...allTransactions, ...d.transactions];
    });

    const startDate = new Date(dateRange.start + 'T00:00:00');
    const endDate = new Date(dateRange.end + 'T23:59:59');

    const filteredTransactions = allTransactions.filter(t => {
      try {
        const tDate = new Date(t.dueDate + 'T00:00:00');
        return isWithinInterval(tDate, { start: startDate, end: endDate });
      } catch { return false; }
    });

    const totalIncome = filteredTransactions.filter(t => t.type === 'Receita').reduce((acc, t) => acc + t.value, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === 'Despesa').reduce((acc, t) => acc + t.value, 0);
    const result = totalIncome - totalExpense;
    const margin = totalIncome > 0 ? (result / totalIncome) * 100 : 0;

    const categories = userProfile.customCategories || DEFAULT_CATEGORIES;
    const catReport: Record<string, { total: number; count: number; transactions: BaseTransaction[] }> = {};
    
    categories.forEach(c => catReport[c.id] = { total: 0, count: 0, transactions: [] });
    if (!catReport['other']) catReport['other'] = { total: 0, count: 0, transactions: [] };

    filteredTransactions.filter(t => t.type === 'Despesa').forEach(t => {
      const catId = catReport[t.categoryId] ? t.categoryId : 'other';
      catReport[catId].total += t.value;
      catReport[catId].count += 1;
      catReport[catId].transactions.push(t);
    });

    const categoryList = Object.entries(catReport)
      .map(([id, data]) => ({
        id,
        ...data,
        category: categories.find(c => c.id === id) || { name: 'Outros', icon: '📦', color: 'bg-slate-100 text-slate-500' }
      }))
      .filter(i => i.total > 0)
      .sort((a, b) => b.total - a.total);

    const topExpenses = [...filteredTransactions]
      .filter(t => t.type === 'Despesa')
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dailyData = days.map(day => {
       const dayStr = format(day, 'yyyy-MM-dd');
       const dayTxs = filteredTransactions.filter(t => t.dueDate === dayStr);
       return {
          date: day,
          income: dayTxs.filter(t => t.type === 'Receita').reduce((a, b) => a + b.value, 0),
          expense: dayTxs.filter(t => t.type === 'Despesa').reduce((a, b) => a + b.value, 0),
       };
    }).filter(d => d.income > 0 || d.expense > 0);

    return { totalIncome, totalExpense, result, margin, categoryList, topExpenses, dailyData, transactionCount: filteredTransactions.length };
  }, [dateRange, allData, monthData, userProfile.customCategories]);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setPdfGenerating(true);
    try {
      const element = reportRef.current;
      element.style.display = 'block';
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      element.style.display = 'none';
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = canvas.height;
      const imgWidth = canvas.width;
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Relatorio_Financeiro_${dateRange.start}.pdf`);
    } catch (error) {
      console.error("Erro PDF", error);
      alert("Erro ao gerar PDF.");
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleAudit = async () => {
    if (creditInfo.remaining <= 0 && !isUnlimited) {
      alert("Seus créditos de IA acabaram. Faça um upgrade para continuar.");
      return;
    }
    
    setLoading(true);

    try {
      // 1. Preparar Dados para a IA
      const promptData = {
        empresa: userProfile.company,
        faturamento: totals.fatReal,
        faturamentoPrevisto: totals.fatTotal,
        divida: totals.divTotal,
        dividaPendente: totals.divPend,
        margem: smeMetrics.margin,
        folegoCaixa: smeMetrics.folegoReal,
        saudeScore: smeMetrics.healthScore,
        principaisDespesas: aggregatedReport.topExpenses.map(t => `${t.description} (R$ ${t.value})`).join(', '),
        distribuicaoCategorias: aggregatedReport.categoryList.slice(0, 5).map(c => `${c.category.name}: ${((c.total / aggregatedReport.totalExpense) * 100).toFixed(1)}%`).join(', ')
      };

      const prompt = `
        Aja como um CFO de alto nível (Chief Financial Officer). Analise estes dados financeiros:
        
        EMPRESA: ${promptData.empresa}
        FATURAMENTO REAL: R$ ${promptData.faturamento} (Previsto: R$ ${promptData.faturamentoPrevisto})
        DÍVIDA TOTAL: R$ ${promptData.divida}
        MARGEM DE LUCRO: ${promptData.margem.toFixed(2)}%
        FÔLEGO DE CAIXA (Runway): ${promptData.folegoCaixa.toFixed(1)} dias
        SCORE SAÚDE: ${promptData.saudeScore}/100
        
        TOP DESPESAS: ${promptData.principaisDespesas}
        CATEGORIAS PRINCIPAIS: ${promptData.distribuicaoCategorias}

        Gere uma auditoria estratégica curta, direta e impactante.
        ESTRUTURA OBRIGATÓRIA (Use exatamente estes títulos com os emojis):

        **🩺 DIAGNÓSTICO OPERACIONAL**
        (Análise breve de 2-3 linhas sobre a situação atual)

        **⚔️ TÁTICAS DE GUERRA**
        (3 ações práticas numeradas para melhorar o resultado imediatamente)

        **🚀 PROJEÇÃO DE CENÁRIO**
        (Uma previsão se manter o ritmo atual vs se aplicar as correções)

        **📊 AUDITORIA DE DADOS**
        (Conclusão final em uma frase de impacto)
      `;

      // 2. Chamar Gemini API
      const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      const relatorioTexto = response.text || "Erro na geração do relatório.";

      // 3. Montar Objeto da Análise
      const novaAnalise: Partial<AnaliseCompleta> = {
        data: new Date().toISOString(),
        indicadores: {
          indiceFolego: smeMetrics.folegoReal,
          endividamento: smeMetrics.equilibrium,
          taxaConversao: smeMetrics.healthScore, // Usando healthScore como proxy de conversão/saúde
          margemLucro: smeMetrics.margin,
          tendencia: smeMetrics.margin > 0 ? 'FORTE_CRESCIMENTO' : 'QUEDA',
          saudeGeral: smeMetrics.healthScore
        },
        relatorio: relatorioTexto,
        acoes: [], // Simplificado para este MVP
        metadados: {
          versaoIA: 'Gemini 2.5 Flash',
          tempoProcessamento: 2.5,
          perfilUsuario: userProfile.planId
        }
      };

      // Gerar Nome e Tags via Helper
      const nomeGerado = AnaliseNaming.gerarNomeAutomatico(novaAnalise);
      const tagsGeradas = AnaliseNaming.gerarTagsAutomaticas(novaAnalise);

      const analiseFinal = {
        ...novaAnalise,
        nome: nomeGerado,
        nomeEditavel: true,
        tags: tagsGeradas
      } as AnaliseCompleta;

      // 4. Salvar no Firestore
      if (auth.currentUser) {
        const docRef = await addDoc(collection(db, `users/${auth.currentUser.uid}/analises`), analiseFinal);
        setCurrentAnalysis({ ...analiseFinal, id: docRef.id });

        // 5. Atualizar Créditos (se não for ilimitado)
        if (!isUnlimited) {
          const profileRef = doc(db, `users/${auth.currentUser.uid}/profile`, 'settings');
          const todayStr = new Date().toISOString().slice(0, 7); // YYYY-MM
          
          let newCount = 1;
          if (userProfile.aiUsage && userProfile.aiUsage.lastDate.startsWith(todayStr)) {
             newCount = userProfile.aiUsage.count + 1;
          }

          await setDoc(profileRef, {
             aiUsage: {
               lastDate: new Date().toISOString(),
               count: newCount
             }
          }, { merge: true });
        }
      }

    } catch (error) {
      console.error("Erro na auditoria:", error);
      alert("Falha ao conectar com o Núcleo Neural. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-10 animate-in fade-in pb-20 max-w-[1600px] mx-auto">
      
      {/* HEADER DE COMANDO */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-2 rounded-full border border-slate-200 shadow-lg max-w-2xl mx-auto">
          <button 
            onClick={() => setViewMode('ai')}
            className={`flex-1 flex items-center justify-center gap-3 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${viewMode === 'ai' ? 'bg-[#020617] text-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
              <Brain size={14} className={viewMode === 'ai' ? 'animate-pulse text-indigo-400' : ''} /> Estrategista IA
          </button>
          <button 
            onClick={() => setViewMode('reports')}
            className={`flex-1 flex items-center justify-center gap-3 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${viewMode === 'reports' ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
              <PieChart size={14} /> Relatórios & PDF
          </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'ai' ? (
          <motion.div 
            key="ai-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* PAINEL DE COMANDO DARK MODE */}
            <div className="relative bg-[#020617] rounded-[48px] overflow-hidden border border-slate-800 shadow-4xl p-8 md:p-12 text-white min-h-[600px] flex flex-col md:flex-row gap-12 items-center">
               {/* Background FX */}
               <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                  <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px] -ml-20 -mb-20"></div>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
               </div>

               {/* ESQUERDA: NÚCLEO E AÇÃO */}
               <div className="w-full md:w-5/12 flex flex-col items-center justify-center relative z-10 space-y-10">
                  <div className="text-center space-y-2">
                     <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[9px] font-black uppercase tracking-[0.3em]">
                        <Binary size={12} /> Master Intelligence 2.0
                     </div>
                     <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-300 to-slate-500">
                        Auditoria <br/> Estratégica
                     </h2>
                  </div>

                  <NeuralCore loading={loading} active={creditInfo.remaining > 0 || isUnlimited} />

                  <button 
                    onClick={handleAudit} 
                    disabled={loading || (creditInfo.remaining <= 0 && !isUnlimited)}
                    className={`group relative w-full max-w-xs py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-3 overflow-hidden shadow-[0_0_30px_rgba(79,70,229,0.3)]
                      ${loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400 hover:scale-105 active:scale-95'}`}
                  >
                      {loading && <div className="absolute inset-0 bg-white/10 animate-pulse"></div>}
                      {loading ? <Aperture className="animate-spin" size={16}/> : <Zap size={16} className={creditInfo.remaining > 0 ? "fill-amber-400 text-amber-400" : ""} />}
                      <span className="relative z-10">{loading ? 'PROCESSANDO...' : 'EXECUTAR ANÁLISE'}</span>
                  </button>

                  <div className="text-center">
                     {isUnlimited ? (
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 justify-center">
                           <Crown size={12}/> Acesso Ilimitado Master
                        </span>
                     ) : (
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                           {creditInfo.remaining} Créditos Disponíveis
                        </span>
                     )}
                  </div>
               </div>

               {/* DIREITA: METRICAS E DIAGNÓSTICO */}
               <div className="w-full md:w-7/12 flex flex-col gap-6 relative z-10 h-full">
                  {/* Grid de Cards 3D */}
                  <div className="grid grid-cols-2 gap-4">
                     <StrategyCard label="Saúde Operacional" value={smeMetrics.healthScore + '%'} icon={Shield} color="from-indigo-600 to-blue-600" sub="Score Geral" trend={5} />
                     <StrategyCard label="Fôlego de Caixa" value={smeMetrics.folegoReal.toFixed(0) + 'd'} icon={Clock} color="from-emerald-600 to-teal-600" sub="Sobrevivência" />
                     <StrategyCard label="Ponto Equilíbrio" value={smeMetrics.equilibrium.toFixed(1) + '%'} icon={Activity} color="from-amber-600 to-orange-600" sub="Comprometimento" />
                     <StrategyCard label="Burn Rate Diário" value={smeMetrics.consumoDiario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} icon={DollarSign} color="from-rose-600 to-pink-600" sub="Custo/Dia" />
                  </div>

                  {/* Área de Texto da IA (Estilo Terminal) */}
                  <div className="flex-1 bg-[#0b1221] rounded-[32px] border border-white/10 p-6 md:p-8 overflow-y-auto custom-scrollbar min-h-[300px] shadow-inner relative group">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 opacity-50"></div>
                     {currentAnalysis ? (
                        <RelatorioRenderer text={currentAnalysis.relatorio} />
                     ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
                           <div className="p-4 bg-white/5 rounded-full"><Brain size={48} className="text-white"/></div>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white max-w-xs leading-relaxed">
                              Aguardando dados para processamento neural... <br/> Selecione uma auditoria ou inicie uma nova.
                           </p>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* HISTÓRICO EM BAIXO */}
            <div className="grid grid-cols-1 gap-8">
               <HistoricoAnalises 
                  analises={historyList}
                  onSelectAnalise={(id) => setCurrentAnalysis(historyList.find(h => h.id === id) || null)}
                  onRenameAnalise={async (id, name) => { await updateDoc(doc(db, `users/${auth.currentUser?.uid}/analises`, id), { nome: name }) }}
                  onDeleteAnalise={async (id) => { await deleteDoc(doc(db, `users/${auth.currentUser?.uid}/analises`, id)) }}
               />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="reports-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
             {/* CONTROLES DE RELATÓRIO (Estilo Dashboard) */}
             <div className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-200 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                   <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl"><CalendarRange size={24}/></div>
                   <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Período de Análise</h3>
                      <div className="flex items-center gap-4 mt-2">
                         <input 
                           type="date" 
                           value={dateRange.start}
                           onChange={e => setDateRange({...dateRange, start: e.target.value})}
                           className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-black text-slate-700 outline-none focus:border-indigo-400 transition-all"
                         />
                         <span className="text-slate-300 font-black">ATÉ</span>
                         <input 
                           type="date" 
                           value={dateRange.end}
                           onChange={e => setDateRange({...dateRange, end: e.target.value})}
                           className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-black text-slate-700 outline-none focus:border-indigo-400 transition-all"
                         />
                      </div>
                   </div>
                </div>
                <button 
                  onClick={handleDownloadPDF}
                  disabled={pdfGenerating}
                  className="px-8 py-4 bg-[#020617] text-white rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                   {pdfGenerating ? <Sparkles className="animate-spin" size={16}/> : <Printer size={16}/>}
                   {pdfGenerating ? 'Gerando Documento...' : 'Baixar PDF Oficial'}
                </button>
             </div>

             {/* KPIs de Relatório */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-lg group hover:shadow-xl transition-all">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><ArrowRight size={12} className="text-emerald-500 rotate-[-45deg]"/> Entradas Totais</div>
                   <div className="text-3xl font-black text-emerald-600 font-mono tracking-tighter">
                      {aggregatedReport.totalIncome.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                   </div>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-lg group hover:shadow-xl transition-all">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><ArrowRight size={12} className="text-rose-500 rotate-[45deg]"/> Saídas Totais</div>
                   <div className="text-3xl font-black text-rose-600 font-mono tracking-tighter">
                      {aggregatedReport.totalExpense.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                   </div>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-lg group hover:shadow-xl transition-all">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity size={12} className={aggregatedReport.result >= 0 ? "text-indigo-500" : "text-amber-500"}/> Resultado Líquido</div>
                   <div className={`text-3xl font-black font-mono tracking-tighter ${aggregatedReport.result >= 0 ? 'text-indigo-600' : 'text-amber-600'}`}>
                      {aggregatedReport.result.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                   </div>
                </div>
             </div>

             {/* Tabela Diária */}
             <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden p-8">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><CalendarDays size={20}/></div>
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Fluxo Diário Comparativo</h4>
                </div>
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                     <thead>
                        <tr className="border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                           <th className="pb-4 pl-2">Data</th>
                           <th className="pb-4 text-right">Entradas</th>
                           <th className="pb-4 text-right">Saídas</th>
                           <th className="pb-4 text-right pr-2">Saldo Dia</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {aggregatedReport.dailyData.map((day, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                             <td className="py-3 pl-2 text-xs font-bold text-slate-700">{format(day.date, 'dd/MM (eee)', {locale: ptBR})}</td>
                             <td className="py-3 text-right text-xs font-black font-mono text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity">{day.income > 0 ? day.income.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '-'}</td>
                             <td className="py-3 text-right text-xs font-black font-mono text-rose-600 opacity-60 group-hover:opacity-100 transition-opacity">{day.expense > 0 ? day.expense.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '-'}</td>
                             <td className={`py-3 text-right pr-2 text-xs font-black font-mono ${day.income - day.expense >= 0 ? 'text-indigo-600' : 'text-amber-600'}`}>{(day.income - day.expense).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
             </div>

             {/* Categorias (Grid) */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start pb-20">
                {aggregatedReport.categoryList.map((item, idx) => (
                  <div key={item.id} className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden transition-all hover:shadow-2xl hover:border-indigo-200 self-start group">
                     <div 
                       className="p-6 cursor-pointer"
                       onClick={() => setExpandedCategory(expandedCategory === item.id ? null : item.id)}
                     >
                        <div className="flex justify-between items-start mb-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110 ${item.category.color.split(' ')[0]} ${item.category.color.split(' ')[1]}`}>
                              {item.category.icon}
                           </div>
                           <div className="text-right">
                              <span className="block text-2xl font-black text-slate-900 tracking-tighter">
                                 {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{((item.total / (aggregatedReport.totalExpense || 1)) * 100).toFixed(1)}% do total</span>
                           </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                           <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.category.name}</h4>
                           <div className={`p-2 rounded-full transition-transform duration-300 ${expandedCategory === item.id ? 'bg-indigo-50 text-indigo-600 rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                              <ChevronDown size={16} />
                           </div>
                        </div>
                     </div>

                     {expandedCategory === item.id && (
                       <div className="bg-slate-50 border-t border-slate-100 p-4 animate-in slide-in-from-top-2 duration-300 max-h-[300px] overflow-y-auto no-scrollbar">
                          <table className="w-full text-left">
                             <tbody className="divide-y divide-slate-200/50">
                                {item.transactions.map((t: any) => (
                                  <tr key={t.id}>
                                     <td className="py-3 pl-2">
                                        <div className="text-[10px] font-bold text-slate-700 uppercase truncate max-w-[120px]">{t.description}</div>
                                        <div className="text-[8px] font-bold text-slate-400">{new Date(t.dueDate).toLocaleDateString('pt-BR')}</div>
                                     </td>
                                     <td className="py-3 text-right pr-2">
                                        <div className="text-[10px] font-black font-mono text-slate-900">{t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                     </td>
                                  </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                     )}
                  </div>
                ))}
             </div>

             {/* ELEMENTO PDF OCULTO (Mantido igual) */}
             <div style={{ position: 'absolute', top: -10000, left: -10000 }}>
                <div ref={reportRef} style={{ width: '210mm', minHeight: '297mm', padding: '15mm', backgroundColor: 'white', fontFamily: 'Inter, sans-serif' }}>
                   <div className="flex justify-between items-center border-b-4 border-slate-900 pb-6 mb-10">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-2xl">T</div>
                         <div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Relatório Financeiro</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cria Gestão Pro • Auditoria Oficial</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Período de Análise</p>
                         <p className="text-lg font-black text-slate-900">{format(new Date(dateRange.start), 'dd/MM/yy')} - {format(new Date(dateRange.end), 'dd/MM/yy')}</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-3 gap-6 mb-12">
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Receita Bruta</span>
                         <span className="text-2xl font-black text-emerald-600 font-mono">{aggregatedReport.totalIncome.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Despesa Total</span>
                         <span className="text-2xl font-black text-rose-600 font-mono">{aggregatedReport.totalExpense.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Resultado</span>
                         <span className={`text-2xl font-black font-mono ${aggregatedReport.result >= 0 ? 'text-indigo-600' : 'text-amber-600'}`}>{aggregatedReport.result.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                      </div>
                   </div>
                   <div className="mb-12">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                         <TrendingDown size={16}/> Top 5 Maiores Despesas
                      </h3>
                      <table className="w-full text-left text-sm">
                         <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500">
                            <tr>
                               <th className="p-3 rounded-l-lg">Descrição</th>
                               <th className="p-3">Categoria</th>
                               <th className="p-3">Data</th>
                               <th className="p-3 text-right rounded-r-lg">Valor</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {aggregatedReport.topExpenses.map((t, i) => (
                               <tr key={i}>
                                  <td className="p-3 font-bold text-slate-700">{t.description}</td>
                                  <td className="p-3 text-xs font-bold text-slate-500 uppercase">{userProfile.customCategories?.find(c => c.id === t.categoryId)?.name || 'Outros'}</td>
                                  <td className="p-3 text-xs font-mono text-slate-500">{format(new Date(t.dueDate), 'dd/MM')}</td>
                                  <td className="p-3 text-right font-black font-mono text-slate-900">{t.value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                   <div className="mb-10">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                         <PieChart size={16}/> Detalhamento por Categoria
                      </h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                         {aggregatedReport.categoryList.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border-b border-slate-100">
                               <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${item.category.color.split(' ')[0]} ${item.category.color.split(' ')[1]}`}>{item.category.icon}</div>
                                  <div>
                                     <span className="text-xs font-black text-slate-800 uppercase block">{item.category.name}</span>
                                     <span className="text-[10px] font-bold text-slate-400">{item.count} lançamentos</span>
                                  </div>
                               </div>
                               <span className="text-sm font-black font-mono text-slate-900">{item.total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                   <div className="mt-auto pt-8 border-t border-slate-200 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Documento gerado eletronicamente por Cria Gestão Pro</p>
                      <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">{new Date().toLocaleString('pt-BR')}</p>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsView;
