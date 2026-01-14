
import React, { useState, useMemo, useEffect } from 'react';
import { FinancialData, AnaliseCompleta, UserProfile, Category } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import { AnaliseNaming } from './IA/AnaliseNaming';
import { HistoricoAnalises } from './IA/HistoricoAnalises';
import { FloatingInfo } from './FloatingInfo';
import { Bot, Zap, Clock, Shield, DollarSign, Filter, TrendingUp, Brain, Download, ChevronRight, Sparkles, Trash2, Info, Lock, Crown, PieChart, BarChart3, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../constants';

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
  const [viewMode, setViewMode] = useState<'ai' | 'reports'>('ai');
  const [loading, setLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnaliseCompleta | null>(null);
  const [historyList, setHistoryList] = useState<AnaliseCompleta[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Verificação de segurança para o e-mail
  const userEmail = userProfile?.email ? userProfile.email.toLowerCase() : '';
  const planId = userProfile?.planId || 'ESSENTIAL';
  
  // Regras de Acesso
  const isAdm = ['thor4tech@gmail.com', 'cleitontadeu10@gmail.com'].includes(userEmail);
  const isMaster = planId === 'MASTER';
  const isPro = planId === 'PRO';
  const isTrial = userProfile?.subscriptionStatus === 'TRIAL';
  
  const isUnlimited = isAdm || isMaster;

  const creditInfo = useMemo(() => {
    if (isUnlimited) return { type: 'unlimited', remaining: Infinity };

    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // "YYYY-MM"
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

  // Lógica do Relatório Drill-Down
  const categoryReport = useMemo(() => {
    const report: Record<string, { total: number; paid: number; pending: number; count: number; transactions: any[] }> = {};
    const categories = userProfile.customCategories || DEFAULT_CATEGORIES;

    // Inicializar
    categories.forEach(c => {
      report[c.id] = { total: 0, paid: 0, pending: 0, count: 0, transactions: [] };
    });
    if (!report['other']) report['other'] = { total: 0, paid: 0, pending: 0, count: 0, transactions: [] };

    monthData.transactions.forEach(t => {
      // Considerar apenas despesas para este relatório principal, ou ambos? Geralmente gestão é sobre despesas por categoria.
      // Vamos fazer Despesas por padrão, pois é onde o drill-down é mais útil.
      if (t.type === 'Despesa') {
        const catId = report[t.categoryId] ? t.categoryId : 'other';
        report[catId].total += t.value;
        report[catId].count += 1;
        if (t.situation === 'PAGO') report[catId].paid += t.value;
        else report[catId].pending += t.value;
        report[catId].transactions.push(t);
      }
    });

    // Ordenar por maior gasto
    return Object.entries(report)
      .map(([id, data]) => ({ 
        id, 
        ...data, 
        category: categories.find(c => c.id === id) || { name: 'Outros', icon: '📦', color: 'bg-slate-100 text-slate-500' } 
      }))
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [monthData, userProfile.customCategories]);

  const handleAudit = async () => {
    if (creditInfo.remaining <= 0 && !isUnlimited) {
      if (creditInfo.type === 'blocked') {
        alert("Seu plano atual não inclui IA. Faça upgrade para Pro ou Master.");
      } else if (creditInfo.type === 'trial') {
        alert("Você usou todos os 3 créditos do seu período de teste. Assine para continuar usando.");
      } else {
        alert("Limite mensal atingido. Seus créditos renovam no dia 1 do próximo mês ou faça upgrade para Master (Ilimitado).");
      }
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
        
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const currentMonth = todayStr.slice(0, 7);
        
        let newCount = 1;
        
        if (creditInfo.type === 'trial') {
          newCount = (userProfile.aiUsage?.count || 0) + 1;
        } else if (creditInfo.type === 'monthly') {
          const lastDate = userProfile.aiUsage?.lastDate || '';
          if (lastDate.startsWith(currentMonth)) {
            newCount = (userProfile.aiUsage?.count || 0) + 1;
          } else {
            newCount = 1;
          }
        }

        await updateDoc(doc(db, `users/${auth.currentUser.uid}/profile`, 'settings'), {
          aiUsage: { lastDate: todayStr, count: newCount }
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
      {/* Toggle Header */}
      <div className="flex justify-center mb-8">
         <div className="flex p-1 bg-white border border-slate-200 rounded-full shadow-lg">
            <button 
              onClick={() => setViewMode('ai')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'ai' ? 'bg-[#020617] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
               <Brain size={14} /> Estrategista IA
            </button>
            <button 
              onClick={() => setViewMode('reports')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'reports' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
               <PieChart size={14} /> Relatórios
            </button>
         </div>
      </div>

      {viewMode === 'ai' ? (
        <>
          {/* Credit Header */}
          {!isUnlimited && (
            <div className="flex justify-center">
              <div className={`px-8 py-3 rounded-full border flex items-center gap-4 shadow-2xl ${creditInfo.remaining > 0 ? 'bg-[#020617] border-white/10' : 'bg-slate-200 border-slate-300'}`}>
                  <div className="flex items-center gap-2">
                    <Zap size={14} className={creditInfo.remaining > 0 ? "text-amber-400" : "text-slate-400"} fill="currentColor" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${creditInfo.remaining > 0 ? "text-white" : "text-slate-500"}`}>Créditos de IA:</span>
                  </div>
                  <span className={`text-sm font-black font-mono ${creditInfo.remaining > 0 ? "text-amber-400" : "text-slate-600"}`}>
                    {creditInfo.remaining} {creditInfo.type === 'monthly' ? '/ MÊS' : 'RESTANTES'}
                  </span>
                  <div className={`w-px h-4 mx-2 ${creditInfo.remaining > 0 ? "bg-white/10" : "bg-slate-300"}`} />
                  <span className={`text-[8px] font-bold uppercase ${creditInfo.remaining > 0 ? "text-slate-500" : "text-slate-400"}`}>
                    {creditInfo.type === 'trial' ? 'Período de Teste' : 'Renova dia 1'}
                  </span>
              </div>
            </div>
          )}

          {isUnlimited && (
            <div className="flex justify-center">
              <div className="bg-indigo-600/10 px-6 py-2 rounded-full border border-indigo-600/20 flex items-center gap-2">
                  <Crown size={12} className="text-indigo-600" fill="currentColor" />
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Master Intelligence Ilimitada</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard label="Saúde Geral" value={smeMetrics.healthScore + '%'} icon={Shield} color="text-indigo-600" sub="Score Operacional" />
            <MetricCard label="Ponto Equilíbrio" value={smeMetrics.equilibrium.toFixed(1) + '%'} icon={Filter} color="text-amber-500" sub="Comprometimento" />
            <MetricCard label="Fôlego de Caixa" value={smeMetrics.folegoReal.toFixed(0) + ' d'} icon={Clock} color="text-emerald-500" sub="Dias Sobrevivência" />
            <MetricCard label="Custo Diário" value={smeMetrics.consumoDiario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={DollarSign} color="text-rose-500" sub="Burn Rate Médio" />
          </div>

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
              disabled={loading || (creditInfo.remaining <= 0 && !isUnlimited)}
              className={`group relative px-16 py-8 rounded-[32px] text-lg font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4 shadow-4xl
                ${loading || (creditInfo.remaining <= 0 && !isUnlimited)
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95'}`}
            >
                {loading ? <Sparkles className="animate-spin" /> : creditInfo.remaining <= 0 && !isUnlimited ? <Lock size={20} /> : <Zap className="group-hover:animate-pulse" />}
                {loading ? 'Consultando IA...' : creditInfo.remaining <= 0 && !isUnlimited ? (creditInfo.type === 'blocked' ? 'Função Bloqueada' : 'Créditos Esgotados') : 'Gerar Auditoria Master'}
                
                {!isUnlimited && creditInfo.remaining > 0 && (
                  <div className="absolute -top-3 -right-3 bg-amber-400 text-[#020617] px-3 py-1 rounded-lg text-[9px] font-black shadow-xl">
                    -1 CRÉDITO
                  </div>
                )}
            </button>
          </div>

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
        </>
      ) : (
        /* ========================================================================================= */
        /* VIEW DE RELATÓRIOS (DRILL-DOWN) */
        /* ========================================================================================= */
        <div className="animate-in fade-in duration-500 space-y-8">
           <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Relatório de Despesas</h2>
              <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest">Onde seu dinheiro está indo? (Drill-down)</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryReport.map((item, idx) => (
                <div key={item.id} className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden transition-all hover:shadow-2xl hover:border-indigo-200">
                   <div 
                     className="p-6 cursor-pointer"
                     onClick={() => setExpandedCategory(expandedCategory === item.id ? null : item.id)}
                   >
                      <div className="flex justify-between items-start mb-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${item.category.color.split(' ')[0]} ${item.category.color.split(' ')[1]}`}>
                            {item.category.icon}
                         </div>
                         <div className="text-right">
                            <span className="block text-2xl font-black text-slate-900 tracking-tighter">
                               {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{((item.total / (totals.divTotal || 1)) * 100).toFixed(1)}% do total</span>
                         </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                         <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.category.name}</h4>
                         <div className={`p-2 rounded-full transition-transform duration-300 ${expandedCategory === item.id ? 'bg-indigo-50 text-indigo-600 rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                            <ChevronDown size={16} />
                         </div>
                      </div>

                      <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(item.paid / item.total) * 100}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
                         <span>Pago: {item.paid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                         <span>Restante: {item.pending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                   </div>

                   {/* DRILL DOWN AREA */}
                   {expandedCategory === item.id && (
                     <div className="bg-slate-50 border-t border-slate-100 p-4 animate-in slide-in-from-top-2 duration-300 max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                           <thead className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                              <tr>
                                 <th className="pb-2 pl-2">Descrição</th>
                                 <th className="pb-2 text-right pr-2">Valor</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-200/50">
                              {item.transactions.map((t: any) => (
                                <tr key={t.id} className="group">
                                   <td className="py-3 pl-2">
                                      <div className="text-[10px] font-bold text-slate-700 uppercase truncate max-w-[120px]">{t.description}</div>
                                      <div className="text-[8px] font-bold text-slate-400">{new Date(t.dueDate).toLocaleDateString('pt-BR')}</div>
                                   </td>
                                   <td className="py-3 text-right pr-2">
                                      <div className="text-[10px] font-black font-mono text-slate-900">{t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                      {t.situation === 'PAGO' ? (
                                         <span className="text-[7px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">Pago</span>
                                      ) : (
                                         <span className="text-[7px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded uppercase">Pendente</span>
                                      )}
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
        </div>
      )}
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
