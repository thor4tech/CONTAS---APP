
import React, { useState, useEffect } from 'react';
import { FinancialData, BaseTransaction } from '../types';
import { GoogleGenAI } from "@google/genai";
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { 
  Sparkles, Activity, TrendingUp, TrendingDown, Target, 
  BarChart3, PieChart, Info, Bot, Zap, ArrowRight, 
  ShieldCheck, BrainCircuit, CreditCard, PlayCircle,
  History, Copy, Check, Calendar
} from 'lucide-react';

interface Props {
  monthData: FinancialData;
  totals: any;
}

interface AIInsight {
  id: string;
  text: string;
  createdAt: any;
}

const AnalyticsView: React.FC<Props> = ({ monthData, totals }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [history, setHistory] = useState<AIInsight[]>([]);
  const [copied, setCopied] = useState(false);

  // Carregar histórico do Firestore
  useEffect(() => {
    if (!auth.currentUser) return;

    const monthId = `${monthData.year}-${monthData.month}`;
    const q = query(
      collection(db, `users/${auth.currentUser.uid}/data/${monthId}/ai_history`),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AIInsight[];
      setHistory(historyData);
      if (historyData.length > 0 && !analysis) {
        setAnalysis(historyData[0].text);
        setIsActivated(true);
      }
    });

    return () => unsubscribe();
  }, [monthData.month, monthData.year]);

  const fetchAIAnalysis = async () => {
    setIsActivated(true);
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Gere uma ANÁLISE PRO FINANCEIRA ESTRATÉGICA para a empresa ${monthData.month}/${monthData.year}:
      - Faturamento Projetado: R$ ${totals.totalIncomes.toLocaleString('pt-BR')}
      - Saídas Totais (Bruto): R$ ${totals.totalExpenses.toLocaleString('pt-BR')}
      - Pendências Imediatas (A Pagar): R$ ${totals.pendingExpenses.toLocaleString('pt-BR')}
      - Saúde Líquida (Disponível + A Receber - A Pagar): R$ ${totals.liquidHealth.toLocaleString('pt-BR')}
      - Reserva Estratégica: R$ ${totals.reservaValue.toLocaleString('pt-BR')}
      - Meta Comercial: R$ ${monthData.metaFaturamento.toLocaleString('pt-BR')}
      
      Estruture a resposta em Markdown com:
      1. 🎯 RESUMO EXECUTIVO (Status Geral da Operação)
      2. ⚠️ ALERTAS DE RISCO (Liquidez e Cartões)
      3. 🚀 PLANO DE ATAQUE (Ações para bater a meta de R$ ${monthData.metaFaturamento.toLocaleString('pt-BR')})
      4. 💡 INSIGHT DE OURO (Uma dica técnica de ROI)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Você é o Master Analytics Bot da Thor4Tech. Responda em Markdown profissional, focado em alta performance financeira. Não use introduções genéricas."
        }
      });
      
      const text = response.text || "Análise indisponível no momento.";
      setAnalysis(text);

      // Salvar no Firestore
      if (auth.currentUser) {
        const monthId = `${monthData.year}-${monthData.month}`;
        await addDoc(collection(db, `users/${auth.currentUser.uid}/data/${monthId}/ai_history`), {
          text: text,
          createdAt: serverTimestamp()
        });
      }

    } catch (e) {
      console.error(e);
      setAnalysis("Falha ao gerar inteligência de mercado. Verifique sua conexão e chave de API.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const incomePercent = Math.min((totals.totalIncomes / (monthData.metaFaturamento || 1)) * 100, 100);
  const expensePercent = Math.min((totals.totalExpenses / (totals.totalIncomes || 1)) * 100, 100);

  // Cálculos do Painel Executivo
  const rentabilidade = totals.totalIncomes > 0 ? (totals.liquidHealth / totals.totalIncomes) * 100 : 0;
  const exposicaoCredito = totals.availableCash > 0 ? (totals.pendingCardDebt / totals.availableCash) * 100 : 0;
  const fatorSobrevivencia = totals.pendingExpenses > 0 ? totals.availableCash / totals.pendingExpenses : totals.availableCash > 0 ? 10 : 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Coluna Principal: IA Insight */}
        <div className="lg:col-span-2 space-y-12">
          <div className="bg-white rounded-[56px] border border-slate-200 shadow-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-[3s]">
               <BrainCircuit size={400} />
            </div>
            
            {/* Header da IA */}
            <div className="px-12 py-10 bg-slate-950 flex justify-between items-center relative z-10 border-b border-white/5">
               <div className="flex items-center gap-6">
                  <div className="p-4 bg-indigo-600 text-white rounded-[24px] shadow-2xl animate-pulse">
                     <Bot size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter">Master Intelligence <span className="text-indigo-400">PRO</span></h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Análise Preditiva de Caixa Ativada</p>
                    </div>
                  </div>
               </div>
               {isActivated && (
                 <div className="flex gap-3">
                   <button onClick={copyToClipboard} className="p-4 bg-white/5 hover:bg-white/10 text-white/60 rounded-[20px] transition-all" title="Copiar Análise">
                      {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
                   </button>
                   <button onClick={fetchAIAnalysis} className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[20px] transition-all shadow-xl shadow-indigo-900/40">
                      <Activity size={24} className={loading ? 'animate-spin' : ''} />
                   </button>
                 </div>
               )}
            </div>
            
            <div className="p-12">
              {!isActivated ? (
                <div className="py-24 flex flex-col items-center justify-center gap-8 relative z-10">
                   <div className="p-10 bg-indigo-50 rounded-[40px] text-indigo-600 shadow-inner">
                      <Sparkles size={64} className="animate-bounce" />
                   </div>
                   <div className="text-center space-y-3">
                      <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Estratégia sob Demanda</h4>
                      <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">O Master Intelligence aguarda seu comando para auditar o faturamento e as pendências de {monthData.month}.</p>
                   </div>
                   <button 
                    onClick={fetchAIAnalysis}
                    className="flex items-center gap-4 px-14 py-6 bg-slate-950 text-white rounded-[32px] text-[12px] font-black shadow-3xl hover:bg-indigo-600 hover:scale-[1.05] active:scale-95 transition-all"
                   >
                      <PlayCircle size={22} /> INICIAR AUDITORIA AI
                   </button>
                </div>
              ) : loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-8 relative z-10">
                   <div className="relative">
                      <div className="w-24 h-24 border-8 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                      <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={32} />
                   </div>
                   <div className="text-center">
                     <p className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.4em] animate-pulse">Escaneando Fluxos de Caixa...</p>
                     <p className="text-[10px] font-bold text-slate-300 uppercase mt-2">Cruzando dados com metas comerciais</p>
                   </div>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="prose prose-slate max-w-none prose-sm font-medium text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 p-10 rounded-[48px] shadow-inner relative z-10 animate-in slide-in-from-bottom-4 whitespace-pre-wrap">
                    {analysis}
                  </div>

                  {/* Histórico Recente no Rodapé da Análise */}
                  {history.length > 1 && (
                    <div className="space-y-6 pt-6 border-t border-slate-100">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <History size={14} /> Histórico de Insights do Mês
                      </h5>
                      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {history.slice(1).map((item) => (
                          <button 
                            key={item.id}
                            onClick={() => setAnalysis(item.text)}
                            className="flex-none w-64 p-6 bg-white border border-slate-100 rounded-[32px] text-left hover:border-indigo-300 hover:shadow-xl transition-all group"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <Calendar size={12} className="text-indigo-400" />
                              <span className="text-[9px] font-black text-slate-400 uppercase">Insight Anterior</span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-600 line-clamp-3 leading-relaxed">
                              {item.text}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Gráficos de Metas e Comprometimento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-xl flex flex-col justify-between h-[340px] hover:scale-[1.02] transition-transform">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm"><Target size={22}/></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progresso da Meta</span>
                  </div>
                  <span className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{incomePercent.toFixed(1)}%</span>
               </div>
               
               <div className="space-y-6">
                  <div className="relative h-8 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200 p-1">
                     <div 
                       className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-[2s] ease-out shadow-2xl rounded-full" 
                       style={{ width: `${incomePercent}%` }}
                     ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-2">
                     <span className="text-slate-400">R$ {totals.totalIncomes.toLocaleString('pt-BR')}</span>
                     <span className="text-indigo-600">Alvo: R$ {monthData.metaFaturamento.toLocaleString('pt-BR')}</span>
                  </div>
               </div>
               <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex items-center gap-4">
                  <Zap size={20} className="text-indigo-600" />
                  <p className="text-[10px] font-bold text-indigo-900 leading-tight uppercase">
                    {incomePercent >= 100 ? "ALVO CONQUISTADO! FOCO EM OVERDELIVERY." : `FALTAM R$ ${(monthData.metaFaturamento - totals.totalIncomes).toLocaleString('pt-BR')} PARA CONSOLIDAR.`}
                  </p>
               </div>
            </div>

            <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-xl flex flex-col justify-between h-[340px] hover:scale-[1.02] transition-transform">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shadow-sm"><BarChart3 size={22}/></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxa de Comprometimento</span>
                  </div>
                  <span className={`text-2xl font-black font-mono tracking-tighter ${expensePercent > 70 ? 'text-rose-600' : 'text-emerald-600'}`}>{expensePercent.toFixed(1)}%</span>
               </div>
               
               <div className="space-y-6">
                  <div className="relative h-8 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200 p-1">
                     <div 
                       className={`h-full transition-all duration-[2s] ease-out shadow-2xl rounded-full ${expensePercent > 70 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                       style={{ width: `${expensePercent}%` }}
                     ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-2">
                     <span className="text-slate-400">Gastos Brutos</span>
                     <span className={expensePercent > 70 ? 'text-rose-600 font-black' : 'text-emerald-600 font-black'}>{expensePercent > 70 ? 'ALTO RISCO DE CAIXA' : 'ESTRUTURA SAUDÁVEL'}</span>
                  </div>
               </div>
               <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 flex items-center gap-4">
                  <ShieldCheck size={20} className="text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-500 leading-tight uppercase">Baseado em Saídas Brutas de R$ {totals.totalExpenses.toLocaleString('pt-BR')}.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Coluna Lateral: Painel Executivo */}
        <div className="space-y-12">
          <div className="bg-slate-950 p-12 rounded-[56px] text-white shadow-4xl border border-white/5 space-y-10 sticky top-32 transition-all hover:border-indigo-500/30">
            <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-white/30 flex items-center gap-4 border-b border-white/10 pb-8">
               <PieChart size={22} className="text-indigo-500" /> Dashboard Executivo
            </h4>
            
            <div className="space-y-10">
               <SummaryItem 
                 label="Rentabilidade Líquida" 
                 value={rentabilidade.toFixed(1) + '%'} 
                 sub="ROI do Fluxo Mensal" 
                 color={rentabilidade >= 15 ? "text-emerald-400" : "text-amber-400"} 
                 icon={TrendingUp}
               />
               <SummaryItem 
                 label="Exposição de Crédito" 
                 value={exposicaoCredito.toFixed(1) + '%'} 
                 sub="Risco Bancário Imediato" 
                 color={exposicaoCredito > 40 ? "text-rose-400" : "text-indigo-400"} 
                 icon={CreditCard}
               />
               <SummaryItem 
                 label="Saúde de Sobrevivência" 
                 value={fatorSobrevivencia.toFixed(1) + 'x'} 
                 sub="Meses de Cobertura de Caixa" 
                 color={fatorSobrevivencia >= 3 ? "text-emerald-400" : (fatorSobrevivencia >= 1 ? "text-indigo-400" : "text-rose-400")} 
                 icon={Activity}
               />
            </div>

            <div className="pt-8 border-t border-white/10">
               <div className="p-8 bg-indigo-600/10 rounded-[40px] border border-indigo-500/20 hover:bg-indigo-600/20 transition-all">
                  <div className="flex items-center gap-4 mb-5">
                     <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400 shadow-inner"><Sparkles size={20}/></div>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Conclusão Estratégica</span>
                  </div>
                  <p className="text-[12px] font-medium text-white/60 leading-relaxed italic">
                    {totals.liquidHealth > 0 
                      ? "O fluxo atual apresenta saldo positivo sustentável. O foco deve ser otimização tributária e expansão de reserva." 
                      : "Atenção Crítica: O comprometimento de caixa exige renegociação de prazos ou aporte imediato para manter a operação."}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value, sub, color, icon: Icon }: any) => (
  <div className="p-8 bg-white/5 rounded-[40px] border border-white/5 hover:border-white/20 transition-all group cursor-default shadow-inner">
    <div className="flex justify-between items-center mb-4">
       <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</span>
       <Icon size={18} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
    </div>
    <div className={`text-4xl font-black font-mono tracking-tighter ${color}`}>{value}</div>
    <div className="flex items-center gap-3 mt-4">
       <ArrowRight size={12} className="text-white/10" />
       <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{sub}</span>
    </div>
  </div>
);

export default AnalyticsView;
