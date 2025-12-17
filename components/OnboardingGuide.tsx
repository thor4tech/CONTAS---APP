
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle2, LayoutDashboard, Settings, Users, List, Sparkles } from 'lucide-react';

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
      title: `Bem-vindo, ${userName}!`,
      description: "Este é o seu novo Centro de Comando Financeiro Estratégico. Vamos configurar sua operação em 4 passos rápidos.",
      icon: Sparkles,
      color: "bg-indigo-600"
    },
    {
      title: "1. Ativos Estratégicos",
      description: "Vá em 'Configurações' para cadastrar seus Bancos e Cartões. Eles aparecerão no seu Dashboard para controle de saldo imediato.",
      icon: Settings,
      color: "bg-blue-600"
    },
    {
      title: "2. Gestão de Parceiros",
      description: "Cadastre seus Clientes e Fornecedores na aba 'Parceiros'. Isso dará clareza sobre quem move o seu capital.",
      icon: Users,
      color: "bg-emerald-600"
    },
    {
      title: "3. Fluxo Real",
      description: "Lance suas Receitas e Despesas. Use o botão de duplicação para agilizar o lançamento dos meses seguintes com datas automáticas.",
      icon: List,
      color: "bg-slate-900"
    },
    {
      title: "4. Inteligência Master",
      description: "No 'Analytics Pro', ative a consultoria de IA para receber diagnósticos profundos sobre sua saúde financeira e metas.",
      icon: LayoutDashboard,
      color: "bg-indigo-900"
    }
  ];

  const next = () => step < steps.length - 1 ? setStep(step + 1) : onClose();
  const prev = () => step > 0 && setStep(step - 1);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white rounded-[56px] w-full max-w-xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border border-white/20">
        <div className={`p-12 ${steps[step].color} text-white transition-all duration-500 relative overflow-hidden`}>
           <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
              {React.createElement(steps[step].icon, { size: 200 })}
           </div>
           <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30">
                 {React.createElement(steps[step].icon, { size: 32 })}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
           </div>
           <h3 className="text-3xl font-black tracking-tighter relative z-10 mb-4">{steps[step].title}</h3>
           <div className="flex gap-2 relative z-10">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}></div>
              ))}
           </div>
        </div>

        <div className="p-12 space-y-10">
           <p className="text-lg font-medium text-slate-600 leading-relaxed">
              {steps[step].description}
           </p>

           <div className="flex gap-4">
              {step > 0 && (
                <button onClick={prev} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Anterior</button>
              )}
              <button onClick={next} className="flex-[2] py-5 bg-indigo-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                 {step === steps.length - 1 ? (
                   <>CONCLUIR SETUP <CheckCircle2 size={18}/></>
                 ) : (
                   <>PRÓXIMO PASSO <ChevronRight size={18}/></>
                 )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;
