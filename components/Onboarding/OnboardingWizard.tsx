
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { OnboardingData, SegmentoEmpresa, FaixaFaturamento, DesafioFinanceiro, TomComunicacao, FrequenciaAnalise } from '../../types';
import { Activity, Rocket, ArrowRight, ArrowLeft, Building2, TrendingUp, Target, Brain, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

interface Props {
  user: any;
  onFinish: () => void;
}

const OnboardingWizard: React.FC<Props> = ({ user, onFinish }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({
    empresa: { nomeFantasia: '', segmento: SegmentoEmpresa.SERVICOS, tempoAtuacao: '', quantidadeFuncionarios: '' },
    perfilFinanceiro: { faturamentoMedioMensal: FaixaFaturamento.ATE_10K, margemLucroEstimada: '', principaisDespesas: [], temReservaEmergencia: false },
    objetivos: { principaisDesafios: [], objetivoPrincipal: '', prazoObjetivo: '', experienciaGestao: '' },
    preferenciasIA: { frequenciaAnalise: FrequenciaAnalise.SEMANAL, nivelDetalhe: 'detalhado', alertasAutomaticos: true, tiposAlerta: [], tomComunicacao: TomComunicacao.CONSULTIVO }
  });

  const handleUpdate = (section: keyof OnboardingData, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: { ...(prev[section] as any), [field]: value }
    }));
  };

  const handleFinish = async () => {
    if (!user?.uid) return;
    const profileRef = doc(db, `users/${user.uid}/profile`, 'settings');
    await setDoc(profileRef, {
      onboarding: data,
      onboardingCompleto: true,
      onboardingCompletadoEm: Timestamp.now(),
      company: data.empresa?.nomeFantasia || 'Minha Empresa'
    }, { merge: true });
    onFinish();
  };

  const steps = [
    { id: 1, title: 'Empresa', icon: <Building2 />, subtitle: 'Identidade da Operação' },
    { id: 2, title: 'Perfil', icon: <TrendingUp />, subtitle: 'Mapa de Performance' },
    { id: 3, title: 'Metas', icon: <Target />, subtitle: 'Visão de Futuro' },
    { id: 4, title: 'Personalização IA', icon: <Brain />, subtitle: 'Seu Estrategista' }
  ];

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-4xl relative z-10">
        <header className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="inline-flex p-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl text-white mb-8 shadow-2xl">
              <Activity size={48} className="text-indigo-400" />
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">Configurando <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 italic">seu comando.</span></h1>
        </header>

        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-16 relative">
           <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 w-full z-0"></div>
           {steps.map(s => (
             <div key={s.id} className="relative z-10 flex flex-col items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${step >= s.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-[#0f172a] border-white/10 text-white/20'}`}>
                   {step > s.id ? <CheckCircle2 size={24}/> : React.cloneElement(s.icon as any, { size: 24 })}
                </div>
                <div className="text-center">
                  <span className={`text-[10px] font-black uppercase tracking-widest block ${step >= s.id ? 'text-white' : 'text-white/20'}`}>{s.title}</span>
                </div>
             </div>
           ))}
        </div>

        <main className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[56px] p-8 md:p-16 shadow-4xl min-h-[500px] flex flex-col">
           <AnimatePresence mode="wait">
             <motion.div 
               key={step} 
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: -20 }}
               className="flex-1"
             >
                {step === 1 && (
                  <div className="space-y-10">
                     <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Dados da Empresa</h2>
                        <p className="text-slate-400 text-sm">Precisamos entender seu contexto operacional para calibrar as auditorias.</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block px-2">Nome Fantasia</label>
                           <input value={data.empresa?.nomeFantasia} onChange={e => handleUpdate('empresa', 'nomeFantasia', e.target.value)} type="text" placeholder="Ex: Master Digital" className="w-full bg-white/5 border-2 border-white/10 rounded-3xl px-8 py-5 text-white outline-none focus:border-indigo-500 transition-all font-bold" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block px-2">Segmento</label>
                           <select value={data.empresa?.segmento} onChange={e => handleUpdate('empresa', 'segmento', e.target.value)} className="w-full bg-white/5 border-2 border-white/10 rounded-3xl px-8 py-5 text-white outline-none focus:border-indigo-500 transition-all font-bold appearance-none">
                              {Object.values(SegmentoEmpresa).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                           </select>
                        </div>
                     </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-10">
                     <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Perfil Financeiro</h2>
                        <p className="text-slate-400 text-sm">Qual o porte atual da sua operação financeira?</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block px-2">Faturamento Médio Mensal</label>
                           <select value={data.perfilFinanceiro?.faturamentoMedioMensal} onChange={e => handleUpdate('perfilFinanceiro', 'faturamentoMedioMensal', e.target.value)} className="w-full bg-white/5 border-2 border-white/10 rounded-3xl px-8 py-5 text-white outline-none focus:border-emerald-500 transition-all font-bold">
                              <option value={FaixaFaturamento.ATE_10K}>ATÉ R$ 10.000,00</option>
                              <option value={FaixaFaturamento.DE_10K_30K}>R$ 10K - R$ 30K</option>
                              <option value={FaixaFaturamento.DE_30K_50K}>R$ 30K - R$ 50K</option>
                              <option value={FaixaFaturamento.ACIMA_500K}>ACIMA DE R$ 500K</option>
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block px-2">Margem de Lucro Estimada (%)</label>
                           <input value={data.perfilFinanceiro?.margemLucroEstimada} onChange={e => handleUpdate('perfilFinanceiro', 'margemLucroEstimada', e.target.value)} type="number" placeholder="Ex: 20" className="w-full bg-white/5 border-2 border-white/10 rounded-3xl px-8 py-5 text-white outline-none focus:border-emerald-500 transition-all font-bold" />
                        </div>
                     </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-10">
                     <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Objetivos de Gestão</h2>
                        <p className="text-slate-400 text-sm">O que você busca alcançar com o sistema?</p>
                     </div>
                     <div className="grid grid-cols-1 gap-6">
                        <div className="flex flex-wrap gap-4">
                           {Object.values(DesafioFinanceiro).map(d => (
                             <button 
                              key={d} 
                              onClick={() => {
                                const challenges = data.objetivos?.principaisDesafios || [];
                                const next = challenges.includes(d) ? challenges.filter(c => c !== d) : [...challenges, d];
                                handleUpdate('objetivos', 'principaisDesafios', next);
                              }}
                              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${data.objetivos?.principaisDesafios.includes(d) ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
                             >
                               {d.replace('_', ' ')}
                             </button>
                           ))}
                        </div>
                        <div className="space-y-3 mt-6">
                           <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block px-2">Objetivo Principal do Ano</label>
                           <textarea value={data.objetivos?.objetivoPrincipal} onChange={e => handleUpdate('objetivos', 'objetivoPrincipal', e.target.value)} placeholder="Ex: Aumentar o faturamento em 30% mantendo o custo fixo." className="w-full bg-white/5 border-2 border-white/10 rounded-3xl px-8 py-5 text-white outline-none focus:border-indigo-500 transition-all font-bold h-32" />
                        </div>
                     </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-10">
                     <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Configuração do Estrategista</h2>
                        <p className="text-slate-400 text-sm">Como você quer que a IA se comunique com você?</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block px-2">Tom de Voz da Auditoria</label>
                           <div className="grid grid-cols-2 gap-3">
                              {Object.values(TomComunicacao).map(t => (
                                <button key={t} onClick={() => handleUpdate('preferenciasIA', 'tomComunicacao', t)} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${data.preferenciasIA?.tomComunicacao === t ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>{t}</button>
                              ))}
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block px-2">Frequência de Análise Profunda</label>
                           <div className="grid grid-cols-2 gap-3">
                              {Object.values(FrequenciaAnalise).map(f => (
                                <button key={f} onClick={() => handleUpdate('preferenciasIA', 'frequenciaAnalise', f)} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${data.preferenciasIA?.frequenciaAnalise === f ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>{f}</button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
                )}
             </motion.div>
           </AnimatePresence>

           <div className="mt-16 pt-10 border-t border-white/10 flex justify-between items-center">
              <button 
                onClick={() => step > 1 && setStep(step - 1)} 
                disabled={step === 1}
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${step === 1 ? 'opacity-0' : 'text-slate-400 hover:text-white'}`}
              >
                <ArrowLeft size={16} /> Voltar
              </button>
              
              <button 
                onClick={() => step < 4 ? setStep(step + 1) : handleFinish()}
                className="px-12 py-6 bg-white text-[#020617] rounded-[32px] text-[12px] font-black uppercase tracking-[0.4em] shadow-4xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group"
              >
                 {step === 4 ? 'Iniciar Comando' : 'Continuar'} <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
           </div>
        </main>

        <footer className="text-center mt-12">
           <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] flex items-center justify-center gap-2"><Zap size={10} className="text-indigo-600"/> Master Intelligence Strategic Onboarding v3.0</p>
        </footer>
      </div>
    </div>
  );
};

export default OnboardingWizard;
