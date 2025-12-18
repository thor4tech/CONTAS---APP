
import React, { useState } from 'react';
import { 
  X, ChevronRight, ChevronLeft, CheckCircle2, LayoutDashboard, 
  Settings, Users, List, Sparkles, Activity, ShieldCheck, 
  Zap, Brain, Target, ArrowRight
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const OnboardingGuide: React.FC<Props> = ({ isOpen, onClose, userName }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: `Boas-vindas ao Master Intelligence Pro`,
      subtitle: "CENTRAL DE COMANDO ESTRATÉGICO",
      description: "Você acaba de ativar o sistema de gestão financeira mais potente do mercado. Desenvolvido para transformar números em decisões lucrativas com simplicidade absoluta.",
      icon: Activity,
      color: "from-indigo-950 to-[#020617]",
      accent: "text-indigo-400"
    },
    {
      title: "Arquitetura de Ativos",
      subtitle: "BASE DE LIQUIDEZ",
      description: "Configure seus Bancos e Cartões no painel de Configurações. É aqui que o sistema lê sua disponibilidade real de caixa e exposição bancária em tempo real.",
      icon: Settings,
      color: "from-blue-900 to-slate-950",
      accent: "text-blue-400"
    },
    {
      title: "Fluxo Dinâmico Pro",
      subtitle: "GESTÃO DE ENTRADAS E SAÍDAS",
      description: "Lance suas transações com um clique. Use a função 'Duplicar Anterior' para clonar toda a estratégia do mês passado, economizando horas de digitação manual.",
      icon: Zap,
      color: "from-emerald-900 to-slate-950",
      accent: "text-emerald-400"
    },
    {
      title: "Auditoria por IA",
      subtitle: "MASTER INTELLIGENCE 2.0",
      description: "Nossa IA exclusiva analisa seu Burn Rate, Ponto de Equilíbrio e ROI. Ative-a manualmente para receber conselhos de um CFO experiente sobre seus dados.",
      icon: Brain,
      color: "from-indigo-900 to-[#020617]",
      accent: "text-indigo-400"
    },
    {
      title: "Controle Total Ativado",
      subtitle: "MISSÃO INICIAL CONCLUÍDA",
      description: "O sistema está pronto para sua primeira operação. Lembre-se: clareza financeira é a base para o crescimento exponencial. Vamos faturar?",
      icon: Target,
      color: "from-slate-900 to-black",
      accent: "text-white"
    }
  ];

  const next = () => step < steps.length - 1 ? setStep(step + 1) : onClose();
  const prev = () => step > 0 && setStep(step - 1);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-6 bg-[#020617]/90 backdrop-blur-2xl animate-in fade-in duration-700">
      <div className="bg-white rounded-[48px] md:rounded-[64px] w-full max-w-2xl shadow-[0_0_100px_rgba(79,70,229,0.2)] overflow-hidden flex flex-col border border-white/10 animate-in zoom-in-95 duration-500">
        
        {/* HEADER DINÂMICO */}
        <div className={`p-10 md:p-16 bg-gradient-to-br ${steps[step].color} text-white transition-all duration-700 relative overflow-hidden`}>
           {/* Background Deco */}
           <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 rounded-full -ml-24 -mb-24 blur-3xl"></div>
           </div>
           
           <div className="relative z-10 flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20">
                    {React.createElement(steps[step].icon, { size: 28, className: steps[step].accent })}
                 </div>
                 <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${steps[step].accent}`}>{steps[step].subtitle}</span>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white"><X size={20}/></button>
           </div>

           <h3 className="text-3xl md:text-5xl font-black tracking-tighter relative z-10 leading-none mb-6">
              {steps[step].title.split(' ').map((word, i) => (
                <span key={i} className={i === steps[step].title.split(' ').length - 1 ? steps[step].accent : ''}>{word} </span>
              ))}
           </h3>

           <div className="flex gap-2 relative z-10">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-12 bg-white' : 'w-2 bg-white/20'}`}></div>
              ))}
           </div>
        </div>

        {/* CONTEÚDO */}
        <div className="p-10 md:p-16 space-y-12">
           <div className="space-y-6">
              <p className="text-lg md:text-xl font-medium text-slate-500 leading-relaxed italic">
                 "{steps[step].description}"
              </p>
              
              <div className="flex items-center gap-4 py-4 px-6 bg-slate-50 rounded-3xl border border-slate-100">
                 <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    Privacidade de ponta a ponta com criptografia de auditoria militar.
                 </p>
              </div>
           </div>

           <div className="flex flex-col md:flex-row gap-4">
              {step > 0 && (
                <button 
                  onClick={prev} 
                  className="px-8 py-6 bg-slate-100 text-slate-500 rounded-[32px] text-[12px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                   <ChevronLeft size={18} /> Anterior
                </button>
              )}
              <button 
                onClick={next} 
                className="flex-1 py-6 bg-[#020617] text-white rounded-[32px] text-[12px] font-black uppercase tracking-widest shadow-4xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 group"
              >
                 {step === steps.length - 1 ? (
                   <>INICIAR OPERAÇÃO <CheckCircle2 size={20}/></>
                 ) : (
                   <>PRÓXIMO PASSO <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>
                 )}
              </button>
           </div>
           
           <div className="text-center">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Master Intelligence Strategic Guide v2.0</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;
