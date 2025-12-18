
import React, { useState } from 'react';
import { Check, Star, Zap, Crown, ShieldCheck, Rocket, ArrowRight, X, Sparkles, TrendingUp, Shield, BarChart3, Clock } from 'lucide-react';
import { PlanId, UserProfile } from '../types';
import { KIWIFY_LINKS, TEST_EMAILS, testWebhookIntegration } from '../lib/subscription';

interface PricingPageProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpgrade: (plan: PlanId) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ isOpen, onClose, userProfile, onUpgrade }) => {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const isTester = TEST_EMAILS.includes((userProfile?.email || '').toLowerCase());

  if (!isOpen) return null;

  const handleTestUpgrade = async (plan: PlanId) => {
    setLoadingPlan(plan);
    const success = await testWebhookIntegration(userProfile.email, plan);
    if (success) {
      onUpgrade(plan);
    }
    setLoadingPlan(null);
  };

  const plans = [
    {
      id: 'ESSENTIAL' as PlanId,
      name: 'Essencial',
      price: '39,90',
      tagline: 'A base do crescimento',
      description: 'Ideal para quem está saindo do caos e quer começar a enxergar o lucro real da operação.',
      icon: <Rocket className="text-slate-400" />,
      features: [
        'Controle Total de Fluxo de Caixa',
        'Gestão de Bancos e Cartões',
        'Agenda Financeira Inteligente',
        'Relatórios de Performance',
        'Suporte via Email'
      ],
      link: KIWIFY_LINKS.ESSENTIAL,
      color: 'slate'
    },
    {
      id: 'PRO' as PlanId,
      name: 'Pro Estratégico',
      price: '69,90',
      tagline: 'O comando definitivo',
      description: 'A inteligência artificial que seu negócio precisa para escalar com segurança e previsibilidade.',
      icon: <Zap className="text-indigo-400" />,
      features: [
        'Tudo do Plano Essencial',
        'IA Master Intelligence (3 créditos/dia)',
        'Auditoria de Saúde Líquida',
        'Gestão de Parceiros Estratégicos',
        'Análise de Ponto de Equilíbrio',
        'Suporte Prioritário'
      ],
      link: KIWIFY_LINKS.PRO,
      popular: true,
      color: 'indigo'
    },
    {
      id: 'MASTER' as PlanId,
      name: 'Master Intelligence',
      price: '129,90',
      tagline: 'Poder absoluto',
      description: 'Controle total para grandes operações e empreendedores que não aceitam limites.',
      icon: <Crown className="text-amber-500" />,
      features: [
        'Tudo do Plano Pro Estratégico',
        'IA Master Intelligence ILIMITADA',
        'Dashboard Multi-empresa (Beta)',
        'Consultoria Mensal em Grupo',
        'Acesso Antecipado a Novas Funções',
        'Suporte via WhatsApp Direto'
      ],
      link: KIWIFY_LINKS.MASTER,
      color: 'amber'
    }
  ];

  const comparisonRows = [
    { name: 'Fluxo de Caixa', essential: true, pro: true, master: true },
    { name: 'Bancos e Cartões', essential: true, pro: true, master: true },
    { name: 'Auditoria IA', essential: false, pro: '3x Dia', master: 'ILIMITADO' },
    { name: 'Saúde Líquida', essential: false, pro: true, master: true },
    { name: 'Parceiros/CRM', essential: 'Básico', pro: 'Avançado', master: 'Avançado' },
    { name: 'Agenda Financeira', essential: 'Simples', pro: 'Estratégica', master: 'Estratégica' },
    { name: 'Multi-empresa', essential: false, pro: false, master: true },
    { name: 'Suporte', essential: 'Padrão', pro: 'Prioritário', master: 'VIP/Direto' },
  ];

  return (
    <div className="fixed inset-0 z-[300] bg-[#020617] overflow-y-auto no-scrollbar animate-in fade-in duration-500">
      <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-indigo-600 rounded-full blur-[180px]"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[800px] h-[800px] bg-emerald-600 rounded-full blur-[180px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 relative z-10">
        <div className="flex justify-between items-center mb-16 md:mb-24">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xl border border-white/20">
              <Sparkles className="text-indigo-400" size={24} />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Cria Gestão <span className="text-indigo-400">Master</span></h2>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-full transition-all border border-white/10"><X size={24} /></button>
        </div>

        <div className="text-center mb-16 md:mb-24 px-4">
          <h1 className="text-4xl md:text-8xl font-black text-white tracking-tight leading-[1] md:leading-[0.9] mb-8">
            Domine o jogo com <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-emerald-400">inteligência estratégica.</span>
          </h1>
          <p className="text-base md:text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
            Pare de apenas anotar gastos. Comece a tomar decisões baseadas em auditorias automáticas de IA e transforme seu fluxo de caixa em uma máquina de lucro.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24 md:mb-40 px-4">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative bg-white/[0.03] backdrop-blur-3xl rounded-[40px] md:rounded-[48px] p-8 md:p-14 border transition-all duration-700 hover:translate-y-[-12px] group flex flex-col ${plan.popular ? 'border-indigo-500 shadow-[0_0_100px_rgba(79,70,229,0.25)]' : 'border-white/10'}`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl whitespace-nowrap">
                  <Star size={14} fill="currentColor" /> RECOMENDADO
                </div>
              )}
              <div className="mb-10 md:mb-12">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className={`p-4 md:p-5 rounded-2xl border border-white/10 bg-white/5`}>{plan.icon}</div>
                  <div className="text-right">
                    <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Mensal</span>
                    <div className="flex items-baseline justify-end gap-1"><span className="text-white font-black text-4xl md:text-5xl font-mono tracking-tighter">R$ {plan.price}</span></div>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-2">{plan.name}</h3>
                <span className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-4">{plan.tagline}</span>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">{plan.description}</p>
              </div>
              <div className="space-y-4 md:space-y-5 mb-10 md:mb-14 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 md:gap-4">
                    <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg mt-1 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Check size={14} /></div>
                    <span className="text-slate-300 text-xs md:text-sm font-bold uppercase tracking-tight leading-tight">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <a href={plan.link} target="_blank" className={`w-full py-5 md:py-7 rounded-[24px] md:rounded-[32px] text-[11px] md:text-[13px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 md:gap-4 transition-all shadow-4xl transform active:scale-95 ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-white text-[#020617] hover:bg-slate-100'}`}>Ativar Plano <ArrowRight size={18} /></a>
                {isTester && (
                  <button onClick={() => handleTestUpgrade(plan.id)} disabled={loadingPlan !== null} className="w-full py-4 rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 md:gap-3">{loadingPlan === plan.id ? 'Ativando...' : 'Simular Kiwify'}</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
