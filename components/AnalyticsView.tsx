
import React, { useState, useEffect, useMemo } from 'react';
import { FinancialData, BaseTransaction, UserProfile } from '../types';
import { GoogleGenAI } from "@google/genai";
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, deleteDoc, doc, getDocs, setDoc, getDoc, increment } from 'firebase/firestore';
import { format } from 'date-fns';
import { MONTHS } from '../constants';
import ConfirmModal from './ConfirmModal';
import { 
  Sparkles, Activity, TrendingUp, TrendingDown, Target, 
  BarChart3, PieChart, Info, Bot, Zap, ArrowRight, 
  ShieldCheck, BrainCircuit, CreditCard, PlayCircle,
  History, Copy, Check, Calendar, AlertTriangle, Clock,
  Trash2, Filter, Rocket, Search, DollarSign, Wallet, Lock, Unlock,
  ChevronRight, Brain
} from 'lucide-react';

interface Props {
  monthData: FinancialData;
  totals: any;
}

interface AIInsight {
  id: string;
  text: string;
  createdAt: any;
  metaReference?: number;
  commitmentRate?: number;
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
  
  // Estados para Controle de Confirmação Customizado
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Controle de Créditos
  const [dailyUsage, setDailyUsage] = useState(0);
  const maxCredits = 3;
  
  // Créditos infinitos para thor4tech, Cleitontadeu10 ou plano MASTER
  const isInfinite = useMemo(() => {
    const email = auth.currentUser?.email;
    return email === 'thor4tech@gmail.com' || email === 'Cleitontadeu10@gmail.com' || profile?.planId === 'MASTER';
  }, [auth.currentUser, profile]);
  
  const remainingCredits = isInfinite ? Infinity : Math.max(0, maxCredits - dailyUsage);

  const monthId = useMemo(() => {
    const mIdx = MONTHS.indexOf(monthData.month) + 1;
    return `${monthData.year}-${mIdx.toString().padStart(2, '0')}`;
  }, [monthData.month, monthData.year]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!auth.currentUser) return;

    // Carrega Perfil para checar plano
    const unsubProfile = onSnapshot(doc(db, `users/${auth.currentUser.uid}/profile`, 'settings'), (snap) => {
      if (snap.exists()) setProfile(snap.data() as UserProfile);
    });

    const q = query(
      collection(db, `users/${auth.currentUser.uid}/data/${monthId}/ai_history`),
      orderBy('createdAt', 'desc'),
      limit(15)
    );

    const unsubHistory = onSnapshot(q, (snapshot) => {
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AIInsight[];
      setHistory(historyData);
      
      if (historyData.length > 0 && !analysis && !isActivated) {
        setAnalysis(historyData[0].text);
        setIsActivated(true);
      }
    });

    const usageRef = doc(db, `users/${auth.currentUser.uid}/usage`, todayStr);
    const unsubUsage = onSnapshot(usageRef, (docSnap) => {
      if (docSnap.exists()) {
        setDailyUsage(docSnap.data().count || 0);
      } else {
        setDailyUsage(0);
      }
    });

    return () => {
      unsubHistory();
      unsubUsage();
      unsubProfile();
    };
  }, [monthId, todayStr]);

  const executeDeleteHistoryItem = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/data/${monthId}/ai_history`, id);
      await deleteDoc(docRef);
      if (analysis === history.find(h => h.id === id)?.text) {
        setAnalysis(null);
        setIsActivated(false);
      }
    } catch (err) {
      console.error("Erro ao excluir:", err);
    } finally {
      setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmConfig({
      isOpen: true,
      title: "Excluir Relatório?",
      message: "Deseja apagar permanentemente esta análise estratégica? Essa ação não pode ser desfeita e removerá o insight do seu histórico.",
      onConfirm: () => executeDeleteHistoryItem(id)
    });
  };

  const executeClearAllHistory = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, `users/${auth.currentUser.uid}/data/${monthId}/ai_history`));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      setAnalysis(null);
      setIsActivated(false);
    } catch (err) {
      console.error("Erro ao limpar histórico:", err);
    } finally {
      setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleClearAllHistory = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Zerar Histórico Estratégico?",
      message: "ALERTA: Você está prestes a apagar TODOS os relatórios de IA deste mês. Toda a inteligência e auditorias geradas serão removidas definitivamente.",
      onConfirm: executeClearAllHistory
    });
  };

  const copyToClipboard = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fetchAIAnalysis = async (focusOverride?: typeof aiFocus) => {
    if (!auth.currentUser) return;
    if (!isInfinite && dailyUsage >= maxCredits) {
      alert("Limite diário atingido. Novos créditos disponíveis amanhã ou faça upgrade para o plano MASTER!");
      return;
    }

    const focus = focusOverride || aiFocus;
    setIsActivated(true);
    setLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const alertsContext = totals.cashFlowAlerts?.length > 0 
        ? `SINAL DE RUPTURA: ${totals.cashFlowAlerts.map((a: any) => `Dia ${a.date.split('-')[2]}: -R$ ${Math.abs(a.projectedBalance).toLocaleString('pt-BR')}`).join('; ')}`
        : "Sistema auditado: Nenhuma ruptura projetada.";

      const prompt = `Gere ANÁLISE MASTER INTELLIGENCE PRO - FOCO: ${focus.toUpperCase()}
      DATA: ${monthData.month}/${monthData.year}
      
      DADOS FINANCEIROS BRUTOS:
      - Faturamento Atual: R$ ${(totals.totalIncomes || 0).toLocaleString('pt-BR')}
      - Meta Comercial: R$ ${(totals.metaFaturamento || 0).toLocaleString('pt-BR')}
      - Gastos Totais: R$ ${(totals.totalExpenses || 0).toLocaleString('pt-BR')}
      - Dívida Cartões: R$ ${(totals.pendingCardDebt || 0).toLocaleString('pt-BR')}
      - Reserva: R$ ${(totals.reservaValue || 0).toLocaleString('pt-BR')}
      - Auditoria de Alerta: ${alertsContext}
      - Liquidez Imediata: R$ ${(totals.availableCash || 0).toLocaleString('pt-BR')}
      
      ESTRUTURA OBRIGATÓRIA (Markdown - OBRIGATORIAMENTE EM PORTUGUÊS):
      ### 🎯 RESUMO EXECUTIVO
      ### ⚠️ ANÁLISE DE RISCO
      ### 🚀 PLANO DE ATAQUE: ${focus.toUpperCase()}
      ### 💡 CONCLUSÃO ESTRATÉGICA
      
      Regra: O texto deve ser inteiramente em PORTUGUÊS (BR). Use **negrito** para números. Tom executivo CFO.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Você é o Master Intelligence PRO. Consultor financeiro de alto nível especializado no mercado brasileiro. Sua análise deve ser técnica, direta e inteiramente em PORTUGUÊS (BR). Forneça caminhos estratégicos para lucratividade."
        }
      });
      
      const text = response.text || "Insight indisponível.";
      setAnalysis(text);

      const usageRef = doc(db, `users/${auth.currentUser.uid}/usage`, todayStr);
      await setDoc(usageRef, { count: increment(1) }, { merge: true });

      await addDoc(collection(db, `users/${auth.currentUser.uid}/data/${monthId}/ai_history`), {
        text: text,
        createdAt: serverTimestamp(),
        metaReference: totals.metaFaturamento || 0,
        commitmentRate: totals.totalIncomes > 0 ? (totals.totalExpenses / totals.totalIncomes) * 100 : 0,
        focus: focus
      });

    } catch (e) {
      setAnalysis("Erro na análise preditiva. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('###')) {
        return <h4 key={i} className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tighter mt-8 mb-4 border-l-4 border-indigo-600 pl-4">{line.replace('###', '').trim()}</h4>;
      }
      if (line.startsWith('*')) {
        return <div key={i} className="flex items-start gap-3 mb-3 pl-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 shrink-0"></div><p className="text-[11px] md:text-sm text-slate-600 font-medium leading-relaxed">{line.replace('*', '').trim().split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-slate-900 font-black">{part}</strong> : part)}</p></div>;
      }
      const processedLine = line.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-slate-900 font-black">{part}</strong> : part);
      return <p key={i} className="text-[11px] md:text-sm text-slate-600 font-medium leading-relaxed mb-4">{processedLine}</p>;
    });
  };

  const currentMeta = totals.metaFaturamento || 0;
  const faturamento = totals.totalIncomes || 0;
  const despesas = totals.totalExpenses || 0;
  const incomePercent = Math.min((faturamento / (currentMeta || 1)) * 100, 100);
  const marginPercent = faturamento > 0 ? ((faturamento - despesas) / faturamento) * 100 : 0;
  const creditExposure = totals.availableCash > 0 ? (totals.pendingCardDebt / totals.availableCash) * 100 : 100;

  return (
    <div className="space-y-10 md:space-y-16 animate-in fade-in duration-700 pb-32">
      
      {/* GRID DE MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <MetricCardPro label="Ponto de Equilíbrio" value={Math.min((faturamento/(despesas||1))*100, 100).toFixed(1) + '%'} sub={faturamento >= despesas ? 'Operação no Azul' : 'Abaixo do Equilíbrio'} icon={Filter} color={faturamento >= despesas ? "text-emerald-500" : "text-amber-500"} />
         <MetricCardPro label="Margem de Lucro" value={marginPercent.toFixed(1) + '%'} sub="Eficiência Real" icon={DollarSign} color={marginPercent > 0 ? "text-emerald-500" : "text-rose-500"} />
         <MetricCardPro label="Cash Runway" value={(totals.pendingExpenses > 0 ? (totals.availableCash / (totals.pendingExpenses / 30)) : 30).toFixed(0) + ' dias'} sub="Fôlego de Caixa" icon={Clock} color="text-indigo-500" />
         <MetricCardPro label="Burn Rate Diário" value={(despesas/22 || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sub="Média Dias Úteis" icon={Zap} color="text-slate-900" />
      </div>

      <div className="flex flex-col gap-12">
        
        {/* BLOCO CENTRAL DE INTELIGÊNCIA */}
        <div className="bg-white rounded-[48px] md:rounded-[64px] border border-slate-200 shadow-4xl relative overflow-hidden flex flex-col min-h-[600px]">
          
          {/* TOOLBAR SUPERIOR - CRÉDITOS E FOCO */}
          <div className="px-6 md:px-12 py-12 bg-[#020617] flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 border-b border-white/5">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-indigo-600 text-white rounded-[24px] shadow-2xl"><Bot size={32} /></div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter">Master Intelligence <span className="text-indigo-400">PRO 2.0</span></h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    {isInfinite ? (
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-400/10 px-3 py-1 rounded-full border border-indigo-400/20"><Unlock size={12}/> Acesso Ilimitado ADM</span>
                    ) : (
                      <div className="flex items-center gap-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                         <div className="flex gap-1.5">
                            {[1, 2, 3].map(i => (
                              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i <= remainingCredits ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-white/10'}`}></div>
                            ))}
                         </div>
                         <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">{remainingCredits} CRÉDITOS DISPONÍVEIS HOJE</span>
                      </div>
                    )}
                  </div>
                </div>
             </div>

             <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-[22px] border border-white/10">
                {(['geral', 'custos', 'crescimento', 'crise'] as const).map(f => (
                  <button key={f} onClick={() => setAiFocus(f)} className={`px-5 py-2.5 rounded-[18px] text-[9px] font-black uppercase tracking-widest transition-all ${aiFocus === f ? 'bg-indigo-600 text-white shadow-xl' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>{f}</button>
                ))}
             </div>
          </div>
          
          <div className="flex-1 p-8 md:p-16 flex flex-col relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-indigo-50/30 pointer-events-none"></div>
            
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-in fade-in zoom-in-95">
                 <div className="relative">
                    <div className="w-24 h-24 border-8 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center"><Activity size={32} className="text-indigo-600" /></div>
                 </div>
                 <div className="text-center space-y-2">
                   <p className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.3em] animate-pulse">Processando Auditoria...</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cruzando {monthData.transactions.length} registros financeiros</p>
                 </div>
              </div>
            ) : !isActivated ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                 <div className="relative">
                    <div className="p-12 bg-indigo-50 rounded-full text-indigo-600 relative z-10">
                       <Brain size={80} className="animate-pulse" />
                    </div>
                    <div className="absolute inset-0 bg-indigo-200/20 rounded-full animate-ping scale-150 opacity-20"></div>
                 </div>
                 
                 <div className="max-w-md space-y-4">
                   <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Pronto para a Auditoria?</h4>
                   <p className="text-sm font-medium text-slate-500 leading-relaxed">
                     O sistema Master Pro 2.0 está calibrado para analisar sua estratégia de <strong>{monthData.month}</strong> com foco em <strong>{aiFocus.toUpperCase()}</strong>.
                   </p>
                 </div>
                 
                 <div className="flex flex-col items-center gap-6">
                    <button 
                      disabled={!isInfinite && remainingCredits === 0}
                      onClick={() => fetchAIAnalysis()} 
                      className={`px-16 py-7 rounded-[32px] text-[13px] font-black uppercase tracking-[0.2em] shadow-4xl flex items-center gap-4 transition-all hover:scale-[1.05] active:scale-95 ${!isInfinite && remainingCredits === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#020617] text-white hover:bg-indigo-600'}`}
                    >
                       {!isInfinite && remainingCredits === 0 ? <Lock size={20}/> : <Zap size={20} className="text-indigo-400"/>}
                       {!isInfinite && remainingCredits === 0 ? 'Limite Diário Atingido' : `Ativar Auditoria (${aiFocus})`}
                    </button>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] max-w-xs leading-loose">
                      Geração manual obrigatória para otimização de recursos.
                    </p>
                 </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
                <div className="relative group/analysis">
                  <div className="bg-slate-50 border-2 border-slate-100 p-10 md:p-14 rounded-[48px] md:rounded-[64px] shadow-inner">
                    {analysis && renderMarkdown(analysis)}
                  </div>
                  <div className="absolute top-8 right-8 flex gap-3">
                    <button onClick={() => setIsActivated(false)} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:shadow-xl transition-all" title="Nova Consulta">
                      <Rocket size={20} />
                    </button>
                    <button onClick={copyToClipboard} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:shadow-xl transition-all" title="Copiar Análise">
                      {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>

                {/* DASHBOARD DE APOIO À ANÁLISE */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   <MiniStat label="Alcance Meta" value={incomePercent.toFixed(0) + '%'} color="text-indigo-600" />
                   <MiniStat label="Margem Saúde" value={marginPercent.toFixed(0) + '%'} color={marginPercent > 0 ? "text-emerald-600" : "text-rose-600"} />
                   <MiniStat label="Risco Crédito" value={creditExposure.toFixed(0) + '%'} color={creditExposure > 60 ? "text-rose-600" : "text-slate-400"} />
                   <MiniStat label="Fluxo Base" value={monthData.transactions.length.toString()} color="text-slate-900" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* HISTÓRICO ESTRUTURADO - ABAIXO DA ANÁLISE */}
        {history.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-10">
            <div className="flex justify-between items-center px-8">
               <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-900 text-white rounded-xl"><History size={20}/></div>
                  <h5 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.4em]">Linha do Tempo Estratégica</h5>
               </div>
               <button 
                onClick={handleClearAllHistory} 
                className="text-[10px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest transition-colors flex items-center gap-2 group/clear px-6 py-3 bg-rose-50 rounded-2xl border border-rose-100"
               >
                 <Trash2 size={14} className="group-hover/clear:animate-bounce" /> Limpar Todo Histórico
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
              {history.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => { setAnalysis(item.text); setIsActivated(true); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  className="bg-white p-10 rounded-[48px] border border-slate-100 hover:border-indigo-500/30 hover:shadow-3xl transition-all group cursor-pointer flex flex-col h-full relative"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1.5 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest">{item.createdAt ? format(item.createdAt.toDate(), "dd/MM 'às' HH:mm") : 'Agora'}</span>
                    <button 
                      onClick={(e) => handleDeleteHistoryItem(item.id, e)} 
                      className="p-3 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      title="Excluir Relatório"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${item.focus === 'crise' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{item.focus || 'geral'}</span>
                  </div>
                  <p className="text-[12px] font-medium text-slate-400 line-clamp-4 leading-relaxed flex-1">
                    {item.text.replace(/#/g, '').slice(0, 180)}...
                  </p>
                  <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center group-hover:text-indigo-600 transition-all">
                    <span className="text-[9px] font-black uppercase tracking-widest">Ver Análise Completa</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        confirmLabel="Confirmar Exclusão"
        cancelLabel="Manter Relatório"
        variant="danger"
      />
    </div>
  );
};

const MetricCardPro = ({ label, value, sub, icon: Icon, color }: any) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl flex flex-col justify-between min-h-[160px] group transition-all hover:scale-[1.02] hover:shadow-2xl">
    <div className="flex justify-between items-start">
       <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><Icon size={20}/></div>
       <span className={`text-2xl font-black font-mono tracking-tighter ${color}`}>{value}</span>
    </div>
    <div className="mt-6">
       <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">{label}</span>
       <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">{sub}</p>
    </div>
  </div>
);

const MiniStat = ({ label, value, color }: any) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-inner text-center">
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">{label}</span>
    <span className={`text-base font-black font-mono tracking-tighter ${color}`}>{value}</span>
  </div>
);

const DashMetricPro = ({ label, value, sub, color, icon: Icon }: any) => (
  <div className="group">
    <div className="flex justify-between items-center mb-4">
       <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{label}</span>
       <Icon size={18} className="text-white/10 group-hover:text-indigo-400 transition-colors" />
    </div>
    <div className={`text-5xl font-black font-mono tracking-tighter leading-none ${color}`}>{value}</div>
    <div className="flex items-center gap-2 mt-4 text-white/20">
       <ArrowRight size={12} className="opacity-50" />
       <p className="text-[9px] font-black uppercase tracking-widest">{sub}</p>
    </div>
  </div>
);

export default AnalyticsView;
