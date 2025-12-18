
import React from 'react';
import { 
  Activity, CheckCircle2, Zap, Brain, ShieldCheck, 
  Target, LayoutDashboard, List, BarChart3, Users, 
  Calendar, ArrowRight, Sparkles, X, Scale, Clock, 
  AlertTriangle, PieChart, Star, TrendingUp, TrendingDown, 
  DollarSign, Shield, Rocket, ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onEntrar: () => void;
  onTesteGratis: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEntrar, onTesteGratis }) => {
  return (
    <div className="bg-[#f8fafc] text-slate-900 font-inter selection:bg-indigo-100 selection:text-indigo-900 w-full overflow-x-hidden">
      
      {/* 1. HEADER FIXO SUPERIOR */}
      <header className="fixed top-0 left-0 right-0 h-20 md:h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-[100] flex items-center w-full">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-xl shadow-indigo-100/50">
              <Activity size={24} />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Cria Gestão <span className="text-indigo-600">Pro</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onEntrar}
              className="px-6 py-3 text-[12px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 transition-all hidden sm:block"
            >
              Entrar
            </button>
            <div className="flex flex-col items-center">
              <button 
                onClick={onTesteGratis}
                className="px-8 py-3.5 bg-indigo-600 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.05] active:scale-95 transition-all"
              >
                Teste grátis por 7 dias
              </button>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2 hidden sm:block">
                Sem cartão • Cancelamento em 1 clique
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION – PRIMEIRO IMPACTO */}
      <section className="pt-48 pb-24 md:pt-64 md:pb-40 px-6 relative overflow-hidden w-full">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50 rounded-full -mr-[300px] -mt-[300px] blur-[120px] pointer-events-none opacity-50"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <Sparkles size={14} /> Inteligência Artificial Aplicada
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] mb-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Controle financeiro não é planilha.<br/>
            <span className="text-indigo-600">É estratégia em tempo real.</span>
          </h2>
          <p className="text-lg md:text-2xl font-medium text-slate-500 max-w-3xl mx-auto leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            O <span className="text-slate-900 font-bold uppercase">Cria Gestão Pro</span> é o sistema que transforma entradas, saídas e decisões em clareza, previsibilidade e controle absoluto com inteligência artificial.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <button 
              onClick={onTesteGratis}
              className="w-full sm:w-auto px-12 py-6 bg-slate-900 text-white rounded-full text-[13px] font-black uppercase tracking-[0.2em] shadow-4xl hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
            >
              Começar teste grátis de 7 dias <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-12 py-6 bg-white border border-slate-200 text-slate-600 rounded-full text-[13px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
              Ver como funciona
            </button>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] mt-8">Leva menos de 2 minutos para começar</p>
        </div>
      </section>

      {/* 3. PROBLEMA CLARO + QUEBRA DE PADRÃO */}
      <section className="py-24 md:py-40 bg-[#020617] text-white overflow-hidden relative w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h3 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-10">
                Você sabe quanto entra e sai.<br/>
                <span className="text-rose-500">Mas não sabe o que isso significa.</span>
              </h3>
              <div className="space-y-6">
                {[
                  "Saldo positivo que não vira lucro",
                  "Caixa que some sem explicação",
                  "Decisões baseadas no 'feeling'",
                  "Falta de visão por dia, mês e cenário",
                  "Mistura de dinheiro pessoal com empresa"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-rose-500/50 transition-all">
                    <div className="w-6 h-6 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500">
                      <X size={14} strokeWidth={3} />
                    </div>
                    <span className="text-[12px] md:text-[14px] font-black uppercase tracking-widest text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-12 pt-8 border-t border-white/10">
                 <p className="text-2xl font-black text-white uppercase tracking-tighter italic">"Ter números não é o mesmo que ter controle."</p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-900 p-12 rounded-[56px] shadow-4xl relative z-10 border border-white/10">
                <blockquote className="text-2xl md:text-4xl font-black italic tracking-tight leading-snug">
                  "O Cria Gestão Pro substitui o 'acho' pelo 'eu tenho certeza'. O controle financeiro que pensa como você."
                </blockquote>
              </div>
              <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full -z-10 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. APRESENTAÇÃO DO PRODUTO */}
      <section className="py-24 md:py-40 px-6 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 uppercase">
              O Cria Gestão Pro organiza,<br/>analisa e pensa junto com você.
            </h3>
            <p className="text-lg md:text-xl font-medium text-slate-500 max-w-2xl mx-auto">
              Um painel único para visão estratégica, fluxo real, parceiros, agenda financeira e auditoria inteligente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Visão estratégica mensal", sub: "Painel executivo com metas de faturamento e ROI.", icon: LayoutDashboard, color: "text-indigo-600" },
              { title: "Fluxo real em tempo real", sub: "Entradas e saídas categorizadas com precisão total.", icon: List, color: "text-slate-900" },
              { title: "Saúde líquida e projeções", sub: "Saiba quanto sobra de verdade após todas as obrigações.", icon: ShieldCheck, color: "text-emerald-600" },
              { title: "Agenda financeira por dia", sub: "Calendário interativo para controle de vencimentos.", icon: Calendar, color: "text-amber-600" },
              { title: "Parceiros e Fornecedores", sub: "CRM financeiro integrado para gestão de contratos.", icon: Users, color: "text-blue-600" },
              { title: "Auditoria automática com IA", sub: "Diagnóstico inteligente de gargalos e oportunidades.", icon: Brain, color: "text-purple-600" }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl hover:shadow-2xl hover:border-indigo-100 transition-all group">
                <div className={`p-4 bg-slate-50 rounded-[24px] mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all w-fit ${feature.color}`}>
                  <feature.icon size={28} />
                </div>
                <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 mb-2">{feature.title}</h4>
                <p className="text-sm font-medium text-slate-400 leading-relaxed">{feature.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <button 
              onClick={onTesteGratis}
              className="px-12 py-6 bg-indigo-50 text-indigo-600 rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-indigo-100"
            >
              Quero ver isso funcionando
            </button>
          </div>
        </div>
      </section>

      {/* 5. INTELIGÊNCIA ARTIFICIAL COMO DIFERENCIAL */}
      <section className="py-24 md:py-40 bg-slate-950 text-white overflow-hidden relative w-full">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h3 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 uppercase">
            Não é só controle. É inteligência<br/>aplicada ao seu dinheiro.
          </h3>
          <p className="text-lg text-slate-400 font-medium leading-relaxed mb-16 max-w-3xl mx-auto">
            A Master Intelligence PRO analisa seus dados e entrega diagnósticos claros sobre:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            {["Margem real", "Ponto de equilíbrio", "Burn rate", "Cash runway", "Riscos ocultos", "O que ajustar agora"].map((item, i) => (
              <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/10 group hover:bg-indigo-600 transition-all">
                 <CheckCircle2 className="mx-auto mb-4 text-indigo-400 group-hover:text-white" size={24} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/70 group-hover:text-white">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-2xl font-black text-indigo-400 uppercase tracking-tighter italic mb-12">"Você não precisa interpretar planilhas. O sistema faz isso por você."</p>
          <button 
            onClick={onTesteGratis}
            className="px-12 py-6 bg-indigo-600 text-white rounded-full text-[13px] font-black uppercase tracking-widest shadow-3xl shadow-indigo-500/20 hover:bg-white hover:text-slate-950 transition-all flex items-center justify-center gap-3 mx-auto"
          >
            <Brain size={20} /> Ativar inteligência no meu financeiro
          </button>
        </div>
      </section>

      {/* 6. PARA QUEM É O CRIA GESTÃO PRO */}
      <section className="py-24 md:py-40 px-6 bg-white w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 uppercase">
              Esse sistema é para você?
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Empresários e sócios", "Autônomos de alta renda", 
              "Profissionais liberais", "Gestores financeiros", 
              "Quem quer separar pessoal do negócio", "Quem quer previsibilidade"
            ].map((p, i) => (
              <div key={i} className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 flex items-center gap-6 group hover:bg-white hover:shadow-2xl transition-all">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Target size={24} />
                </div>
                <span className="text-[12px] font-black uppercase tracking-widest text-slate-700">{p}</span>
              </div>
            ))}
          </div>
          <p className="text-center mt-20 text-xl font-black text-slate-400 uppercase tracking-[0.4em]">Se você toma decisões financeiras, esse sistema é para você.</p>
        </div>
      </section>

      {/* 7. PLANOS E PREÇOS COM TRIANGULAÇÃO */}
      <section className="py-24 md:py-40 px-6 bg-slate-50 relative overflow-hidden w-full">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 uppercase">
              Controle que cabe na sua ambição
            </h3>
            <p className="text-lg font-bold text-slate-400 uppercase tracking-widest">Escolha o nível de controle que você quer ter</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* PLANO 1 – ESSENCIAL */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-200 flex flex-col shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">PLANO 1 – ESSENCIAL</span>
              <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">Para quem quer sair do caos e enxergar o básico com clareza.</p>
              <div className="mb-10">
                <span className="text-4xl font-black tracking-tighter text-slate-900">R$ 39,90</span>
                <span className="text-xs font-bold text-slate-400 uppercase ml-2">/mês</span>
              </div>
              <ul className="space-y-4 mb-12 flex-1">
                {["Controle de entradas e saídas", "Categorias personalizadas", "Visão mensal", "Agenda financeira", "Relatórios básicos", "Acesso web"].map((li, i) => (
                  <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-600 uppercase tracking-widest"><CheckCircle2 size={14} className="text-emerald-500" /> {li}</li>
                ))}
              </ul>
              <button 
                onClick={onTesteGratis}
                className="w-full py-5 bg-slate-100 text-slate-600 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
              >
                Começar teste grátis
              </button>
            </div>

            {/* PLANO 2 – PRO (DESTAQUE) */}
            <div className="bg-slate-950 p-12 rounded-[56px] flex flex-col shadow-4xl relative transform scale-105 border-4 border-indigo-600 z-20">
              <div className="absolute top-0 right-12 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-500/50">
                <Star size={12} fill="currentColor" /> MAIS ESCOLHIDO
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6">PLANO 2 – PRO</span>
              <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed">O plano que a maioria escolhe para controle estratégico.</p>
              <div className="mb-10">
                <span className="text-5xl font-black tracking-tighter text-white">R$ 69,90</span>
                <span className="text-xs font-bold text-slate-500 uppercase ml-2">/mês</span>
              </div>
              <ul className="space-y-4 mb-12 flex-1">
                {["Tudo do Essencial +", "Visão estratégica completa", "Saúde líquida e Projeções", "Parceiros e cartões", "Separação pessoal x empresa", "Master Intelligence PRO 2.0", "Auditoria inteligente"].map((li, i) => (
                  <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-white uppercase tracking-widest"><CheckCircle2 size={14} className="text-indigo-400" /> {li}</li>
                ))}
              </ul>
              <button 
                onClick={onTesteGratis}
                className="w-full py-6 bg-indigo-600 text-white rounded-[32px] text-[12px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/40 hover:bg-white hover:text-slate-950 transition-all"
              >
                Começar teste grátis
              </button>
            </div>

            {/* PLANO 3 – MASTER */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-200 flex flex-col shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">PLANO 3 – MASTER</span>
              <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">Para quem quer controle absoluto e decisões avançadas.</p>
              <div className="mb-10">
                <span className="text-4xl font-black tracking-tighter text-slate-900">R$ 129,90</span>
                <span className="text-xs font-bold text-slate-400 uppercase ml-2">/mês</span>
              </div>
              <ul className="space-y-4 mb-12 flex-1">
                {["Tudo do PRO +", "Múltiplas contas e empresas", "Auditoria avançada cenário", "Análise de crise e crescimento", "Prioridade em novas features", "Suporte prioritário"].map((li, i) => (
                  <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-600 uppercase tracking-widest"><CheckCircle2 size={14} className="text-indigo-600" /> {li}</li>
                ))}
              </ul>
              <button 
                onClick={onTesteGratis}
                className="w-full py-5 bg-slate-100 text-slate-600 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
              >
                Começar teste grátis
              </button>
            </div>
          </div>
          <p className="text-center mt-12 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Todos os planos começam com 7 dias grátis. Sem cartão de crédito.</p>
        </div>
      </section>

      {/* 8. PROVA DE VALOR E CONFIANÇA */}
      <section className="py-24 md:py-40 px-6 bg-white w-full">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-16 uppercase">
            Você não precisa acreditar.<br/>Precisa testar.
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              { label: "Soberania", text: "Dados ficam sob seu controle absoluto" },
              { label: "Simplicidade", text: "Cancelamento simples em 1 clique" },
              { label: "Futuro", text: "Evolução constante do sistema" },
              { label: "Decisivo", text: "Pensado para quem decide" }
            ].map((p, i) => (
              <div key={i} className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 text-left group hover:bg-indigo-50 transition-all">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-4 block group-hover:text-indigo-600">{p.label}</span>
                <p className="text-xl font-black text-slate-800 tracking-tight">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CTA FINAL FORTE */}
      <section className="py-24 md:py-40 px-6 bg-[#020617] relative overflow-hidden w-full">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-indigo-600/20 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 text-white">
          <h3 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-12 uppercase">
            Pare de reagir ao dinheiro.<br/>
            <span className="text-indigo-400">Comece a comandar.</span>
          </h3>
          <button 
            onClick={onTesteGratis}
            className="px-16 py-8 bg-indigo-600 text-white rounded-full text-[14px] font-black uppercase tracking-[0.3em] shadow-[0_32px_120px_-20px_rgba(79,70,229,0.8)] hover:bg-white hover:text-slate-900 transition-all transform hover:scale-105"
          >
            Ativar teste grátis por 7 dias
          </button>
          <p className="text-sm font-medium text-slate-500 mt-10 tracking-widest uppercase">O controle financeiro que pensa como você pensa.</p>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-20 px-6 border-t border-slate-200 bg-white w-full">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
             <Activity size={24} className="text-slate-900" />
             <span className="text-lg font-black tracking-tighter uppercase">CRIA GESTÃO PRO</span>
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
             <a href="#" className="hover:text-indigo-600 transition-colors">Termos</a>
             <a href="#" className="hover:text-indigo-600 transition-colors">Privacidade</a>
             <a href="#" className="hover:text-indigo-600 transition-colors">Suporte</a>
             <a href="#" className="hover:text-indigo-600 transition-colors">Contato</a>
          </div>
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            CRIA GESTÃO PRO © {new Date().getFullYear()} Thor4Tech
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
