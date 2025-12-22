
import React, { useState, useMemo, useEffect } from 'react';
import { FinancialData, AnaliseCompleta, TomComunicacao, UserProfile } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import { AnaliseNaming } from './IA/AnaliseNaming';
import { HistoricoAnalises } from './IA/HistoricoAnalises';
import { Bot, Zap, Clock, Shield, DollarSign, Filter, TrendingUp, Target, Brain, History, Download, FileText, ChevronRight, LayoutGrid, Sparkles } from 'lucide-react';

interface Props {
  monthData: FinancialData;
  totals: any;
  userProfile: UserProfile;
}

// Componente para processar negritos e quebras de linha no relatório
const RelatorioRenderer = ({ text }: { text: string }) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i} className="mb-4 last:mb-0">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={j} className="text-indigo-800 font-extrabold bg-indigo-50 px-1 rounded">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <span key={j}>{part}</span>;
            })}
          </p>
        );
      })}
    </>
  );
};

const AnalyticsView: React.FC<Props> = ({ monthData, totals, userProfile }) => {
  const [loading, setLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnaliseCompleta | null>(null);
  const [historyList, setHistoryList] = useState<AnaliseCompleta[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, `users/${auth.currentUser.uid}/analises`),
      orderBy('data', 'desc')
    );
    return onSnapshot(q, snap => {
      setHistoryList(snap.docs.map(d => ({ ...d.data(), id: d.id }) as AnaliseCompleta));
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
    const roiAuditoria = rev > 0 ? ((rev - totals.divPend) / rev) * 100 : 0;
    const healthScore = Math.max(0, Math.min(100, Math.round((margin * 0.4) + (folegoReal > 30 ? 30 : (folegoReal / 30) * 30) + (rev > debt ? 30 : 0))));
    return { margin, consumoDiario, folegoReal, equilibrium, healthScore, roiAuditoria };
  }, [totals]);

  const handleAudit = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const onboarding = userProfile.onboarding;

      const prompt = `
        Aja como um **CFO Estratégico Master** de elite. Analise os dados da empresa **${userProfile.company}** para **${monthData.month}/${monthData.year}**.
        
        Sua escrita deve ser **ELEGANTE, PROFISSIONAL, IMPACTANTE e ORGANIZADA**. Use emojis para cada seção.
        MUITO IMPORTANTE: Use Markdown para aplicar **negrito** (envolvendo o texto entre asteriscos duplos, ex: **exemplo**) em métricas, valores monetários e conclusões vitais.

        DADOS FINANCEIROS DO MÊS:
        - Faturamento Previsto: **${totals.fatTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}**
        - Faturamento Realizado: **${totals.fatReal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}**
        - Receita Pendente: **${totals.fatPend.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}**
        - Dívida Pendente (Fluxo + Faturas): **${totals.divPend.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}**
        - Poder de Fogo Real (C/ Reserva): **${totals.comandoReal.comReserva.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}**
        - Saúde SME: **${smeMetrics.healthScore}/100**

        CONTEXTO DO ONBOARDING:
        - Segmento: ${onboarding?.empresa.segmento}
        - Desafios: ${onboarding?.objetivos.principaisDesafios?.join(', ')}
        - Tom: ${onboarding?.preferenciasIA.tomComunicacao}

        ESTRUTURA DA RESPOSTA (Máx 2000 caracteres):
        1. 🩺 **Diagnóstico de Pulso**: Um resumo belo sobre o estado atual do caixa.
        2. ⚔️ **Ação de Guerrilha**: Liste 3 ações numeradas com base nos desafios citados.
        3. 🚀 **Visão de Escala**: Projeção de onde a empresa pode chegar se as métricas forem ajustadas.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          maxOutputTokens: 1500,
          temperature: 0.75,
          thinkingConfig: { thinkingBudget: 400 }
        }
      });

      const indicadores = {
        indiceFolego: Math.floor(smeMetrics.folegoReal),
        endividamento: parseFloat(((totals.divTotal / (totals.fatReal || totals.fatTotal || 1)) * 100).toFixed(1)),
        taxaConversao: parseFloat(((totals.fatReal / (totals.fatTotal || 1)) * 100).toFixed(1)),
        margemLucro: parseFloat(smeMetrics.margin.toFixed(1)),
        tendencia: smeMetrics.margin > 10 ? 'FORTE_CRESCIMENTO' : 'ESTÁVEL_BAIXA',
        saudeGeral: smeMetrics.healthScore
      };

      const result = response.text;
      const baseAnalise = { indicadores, data: new Date().toISOString() };
      const nome = AnaliseNaming.gerarNomeAutomatico(baseAnalise as any);
      const tags = AnaliseNaming.gerarTagsAutomaticas(baseAnalise as any);

      const novaAnalise: Partial<AnaliseCompleta> = {
        nome,
        nomeEditavel: true,
        tags,
        data: baseAnalise.data,
        indicadores,
        relatorio: result,
        metadados: { versaoIA: '4.1 Master Elite', tempoProcessamento: 2000, perfilUsuario: userProfile.planId }
      };

      if (auth.currentUser) await addDoc(collection(db, `users/${auth.currentUser.uid}/analises`), novaAnalise);
      setCurrentAnalysis(novaAnalise as AnaliseCompleta);
    } catch (error) {
      console.error("Erro na Auditoria IA:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (id: string, novoNome: string) => {
    if (!auth.currentUser) return;
    await updateDoc(doc(db, `users/${auth.currentUser.uid}/analises`, id), { nome: novoNome });
  };

  const handleDelete = async (id: string) => {
    if (!auth.currentUser || !confirm("Excluir esta análise permanentemente?")) return;
    await deleteDoc(doc(db, `users/${auth.currentUser.uid}/analises`, id));
  };

  return (
    <div className="w-full space-y-10 animate-in fade-in pb-20 max-w-7xl mx-auto px-4">
      <div className="bg-[#020617] rounded-[48px] p-8 md:p-12 border border-indigo-500/20 shadow-4xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5 text-indigo-500 rotate-12"><Target size={240}/></div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-8">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl"><Shield size={24}/></div>
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.4em]">Master Intelligence Strategic v4.1</span>
               </div>
               <div className="flex items-baseline gap-2">
                  <span className="text-7xl md:text-9xl font-black text-white tracking-tighter">{smeMetrics.healthScore}</span>
                  <span className="text-2xl font-black text-white/30 uppercase tracking-tighter">/100</span>
               </div>
               <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm italic">"A maestria financeira reside na intersecção entre dados brutos e visão de futuro."</p>
            </div>
            <div className="flex flex-col justify-end space-y-10">
               <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase text-white/40 tracking-widest">
                     <span>Pontuação de Comando</span>
                     <span className="text-indigo-400">{smeMetrics.healthScore}%</span>
                  </div>
                  <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                     <div className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(79,70,229,0.5)]" style={{ width: `${smeMetrics.healthScore}%` }}></div>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-6 text-white">
                  <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 flex flex-col justify-between min-h-[120px]">
                     <span className="text-[9px] font-black text-white/30 uppercase block">Status Caixa</span>
                     <span className={`text-lg font-black uppercase ${smeMetrics.healthScore > 65 ? 'text-[#4ade80]' : 'text-rose-400'}`}>{smeMetrics.healthScore > 65 ? 'Resiliente' : 'Crítico'}</span>
                  </div>
                  <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 flex flex-col justify-between min-h-[120px]">
                     <span className="text-[9px] font-black text-white/30 uppercase block">Margem Líquida</span>
                     <span className="text-lg font-black text-indigo-400">{smeMetrics.margin.toFixed(1)}%</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         <MetricCard label="Ponto Equilíbrio" value={smeMetrics.equilibrium.toFixed(1) + '%'} icon={Filter} color="text-amber-500" sub="Meta Comprometida" />
         <MetricCard label="Fôlego Real" value={smeMetrics.folegoReal.toFixed(0) + ' d'} icon={Clock} color="text-indigo-500" sub="Dias de Sobrevivência" />
         <MetricCard label="ROI Operacional" value={smeMetrics.roiAuditoria.toFixed(1) + '%'} icon={TrendingUp} color="text-emerald-500" sub="Potencial de Capital" />
         <MetricCard label="Custo Diário" value={smeMetrics.consumoDiario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={DollarSign} color="text-rose-500" sub="Média de Gastos" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 bg-white rounded-[56px] border border-slate-200 shadow-3xl overflow-hidden min-h-[500px] flex flex-col p-10 md:p-16">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-pulse py-20">
                <div className="relative mb-10">
                   <div className="w-24 h-24 bg-indigo-600/10 rounded-[32px] flex items-center justify-center">
                      <Bot size={48} className="text-indigo-600 animate-bounce" />
                   </div>
                   <div className="absolute inset-0 border-4 border-indigo-200 border-t-indigo-600 rounded-[32px] animate-spin"></div>
                </div>
                <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400">Processando Inteligência de Elite...</p>
              </div>
            ) : currentAnalysis ? (
              <div className="animate-in zoom-in-95 duration-500 flex flex-col h-full">
                 <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-6">
                       <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-600 shadow-inner"><Sparkles size={32} /></div>
                       <div>
                          <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">{currentAnalysis.nome}</h4>
                          <div className="flex gap-2">
                             {currentAnalysis.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-lg bg-indigo-50 text-[8px] font-black uppercase text-indigo-400 tracking-widest">{t}</span>)}
                          </div>
                       </div>
                    </div>
                    <button onClick={() => setCurrentAnalysis(null)} className="p-3 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-900 hover:text-white transition-all shadow-sm"><ChevronRight className="rotate-180" /></button>
                 </div>
                 <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 flex-1 overflow-y-auto no-scrollbar font-medium text-sm leading-relaxed text-slate-700 shadow-inner">
                    <RelatorioRenderer text={currentAnalysis.relatorio} />
                 </div>
                 <div className="mt-10 flex flex-wrap gap-4">
                    <button onClick={handleAudit} className="flex-1 py-6 bg-indigo-600 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"><Zap size={20}/> Nova Auditoria Master</button>
                    <button className="px-10 py-6 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3"><Download size={20}/> Exportar Dados</button>
                 </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-24">
                <div className="w-32 h-32 bg-slate-50 rounded-[48px] flex items-center justify-center text-slate-200 mb-8 border-4 border-dashed border-slate-100">
                   <Brain size={64} strokeWidth={1} />
                </div>
                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">CFO Estratégico Master</h4>
                <p className="text-slate-400 text-sm font-medium mt-4 max-w-md mx-auto leading-relaxed">
                   A IA de elite agora está pronta para analisar seu caixa real, reserva e projeções. Execute a auditoria para diagnósticos precisos.
                </p>
                <button onClick={handleAudit} className="mt-12 px-14 py-7 bg-indigo-600 text-white rounded-full text-[12px] font-black uppercase tracking-[0.4em] hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-4xl group">
                   <Zap size={20} className="group-hover:animate-pulse"/> Executar Auditoria
                </button>
              </div>
            )}
        </div>

        <div className="lg:col-span-4 h-full">
           <HistoricoAnalises 
             analises={historyList}
             onSelectAnalise={(id) => setCurrentAnalysis(historyList.find(h => h.id === id) || null)}
             onRenameAnalise={handleRename}
             onDeleteAnalise={handleDelete}
             onExport={() => alert("Histórico exportado.")}
           />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color, sub }: any) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl flex flex-col gap-8 group hover:translate-y-[-6px] hover:shadow-2xl transition-all duration-500">
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
