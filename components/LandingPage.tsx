
import React, { useState, useEffect } from 'react';
import { 
  Activity, CheckCircle2, Zap, Brain, ShieldCheck, 
  Target, LayoutDashboard, List, BarChart3, Users, 
  Calendar, ArrowRight, Sparkles, X, Scale, Clock, 
  AlertTriangle, PieChart, Star, TrendingUp, DollarSign, Shield, 
  Rocket, Quote, Heart, LogIn, LayoutTemplate, Bot, Check,
  ChevronLeft, ChevronRight, TrendingDown
} from 'lucide-react';

interface LandingPageProps {
  onEntrar: () => void;
  onTesteGratis: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEntrar, onTesteGratis }) => {
  const [activeModule, setActiveModule] = useState(0);

  const modules = [
    { title: "Dashboard Estratégico", desc: "Visão 360º da sua liquidez real e saúde financeira em uma pílula de comando.", icon: LayoutDashboard },
    { title: "Análise com IA Gemini", desc: "Auditoria automática que encontra furos no caixa e sugere planos de ataque.", icon: Brain },
    { title: "Fluxo de Caixa Real", desc: "Controle absoluto de cada centavo. Separação total entre pessoal e empresa.", icon: List },
    { title: "Agenda Inteligente", desc: "Nunca mais pague juros. Vencimentos e recebimentos organizados por dia.", icon: Calendar },
    { title: "Gestão de Parceiros", desc: "CRM financeiro para gerenciar seus principais clientes e fornecedores.", icon: Users }
  ];

  return (
    <div className="bg-white text-slate-900 font-inter w-full overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* HEADER FIXO */}
      <header className="fixed top-0 left-0 right-0 h-20 md:h-24 bg-white/90 backdrop-blur-xl border-b border-slate-100 z-[100] flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-xl text-white shadow-lg">
              <Activity size={24} />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none hidden sm:block">
              Cria Gestão <span className="text-[#3b82f6]">Pro</span>
            </h1>
          </div>
          
          <div className="flex-1 flex justify-center md:hidden">
             <div className="bg-black p-2 rounded-lg text-white"><Activity size={20} /></div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button onClick={onEntrar} className="flex items-center gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100 rounded-xl">
              <LogIn size={18} />
              <span className="hidden md:inline">Login</span>
            </button>
            <button onClick={onTesteGratis} className="px-6 md:px-8 py-3.5 bg-[#3b82f6] text-white rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
              Testar Grátis
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-48 pb-24 md:pt-64 md:pb-48 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/50 rounded-full -mr-[300px] -mt-[300px] blur-[120px] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10 animate-in fade-in slide-in-from-bottom duration-1000">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-sm">
             <Sparkles size={14} /> Onde a clareza encontra o lucro
          </div>
          
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[1] mb-10">
            Controle financeiro <br className="hidden md:block" /> não é planilha. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-indigo-600 italic">É clareza, decisão e poder.</span>
          </h1>
          
          <p className="text-lg md:text-2xl font-medium text-slate-500 max-w-3xl mx-auto leading-relaxed mb-14 px-4">
            O <span className="text-slate-900 font-bold uppercase">Cria Gestão Pro</span> transforma entradas e saídas em visão estratégica com inteligência artificial e organização automática para empresas e autônomos.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 px-4">
            <button onClick={onTesteGratis} className="w-full sm:w-auto px-12 py-6 bg-slate-900 text-white rounded-full text-[13px] font-black uppercase tracking-[0.2em] shadow-4xl hover:bg-blue-600 hover:scale-[1.03] transition-all flex items-center justify-center gap-4 group">
              Começar Comando Estratégico <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button onClick={() => window.scrollTo({ top: 1200, behavior: 'smooth' })} className="w-full sm:w-auto px-10 py-6 bg-white text-slate-900 border border-slate-200 rounded-full text-[13px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
              Ver como funciona
            </button>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-10">Sem cartão • Cancelamento imediato • Ativação em segundos</p>
          
          {/* Dashboard Mockup */}
          <div className="mt-20 md:mt-32 relative mx-auto max-w-5xl px-4">
             <div className="relative bg-white border border-slate-200 rounded-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=2070" alt="Dashboard" className="w-full h-auto opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
             </div>
          </div>
        </div>
      </section>

      {/* PROVA VISUAL - CLEAN CARDS */}
      <section className="py-24 md:py-40 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase mb-6">O que você enxerga no primeiro acesso</h2>
            <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">Você não precisa montar nada. O sistema organiza, calcula e mostra.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Saúde Financeira", desc: "Liquidez real projetada para o futuro.", icon: Activity, color: "text-blue-500" },
              { title: "Entradas e Saídas", desc: "Fluxo real organizado por inteligência.", icon: List, color: "text-emerald-500" },
              { title: "Agenda Mensal", desc: "Agenda diária de compromissos bancários.", icon: Calendar, color: "text-amber-500" },
              { title: "Projeção de Caixa", desc: "Saiba quanto terá no bolso daqui a 30 dias.", icon: TrendingUp, color: "text-indigo-500" },
              { title: "Alertas Master", desc: "Notificações inteligentes de furos no caixa.", icon: AlertTriangle, color: "text-rose-500" },
              { title: "Auditoria por IA", desc: "Insights preditivos sobre o seu lucro.", icon: Bot, color: "text-purple-500" }
            ].map((card, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl transition-all group">
                <div className={`p-4 bg-slate-50 rounded-2xl w-fit mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all ${card.color}`}>
                  <card.icon size={24} />
                </div>
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-3">{card.title}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARROSSEL DE MÓDULOS */}
      <section className="py-24 md:py-40 px-6">
         <div className="max-w-6xl mx-auto bg-[#020617] rounded-[40px] p-10 md:p-24 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 p-12 opacity-5 text-blue-400"><Quote size={140}/></div>
            <div className="relative z-10 flex flex-col items-center">
               <div className="p-6 bg-blue-500/10 rounded-2xl text-blue-400 mb-10 border border-blue-500/20">
                  {React.createElement(modules[activeModule].icon, { size: 48 })}
               </div>
               <h3 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter mb-8 animate-in fade-in zoom-in duration-500">
                  {modules[activeModule].title}
               </h3>
               <p className="text-lg md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl mb-16 h-20">
                  {modules[activeModule].desc}
               </p>
               <div className="flex gap-4 items-center">
                  <button onClick={() => setActiveModule((activeModule - 1 + modules.length) % modules.length)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 text-white transition-all"><ChevronLeft/></button>
                  <div className="flex gap-2">
                     {modules.map((_, i) => (
                       <button key={i} onClick={() => setActiveModule(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === activeModule ? 'w-10 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'w-1.5 bg-white/20'}`}></button>
                     ))}
                  </div>
                  <button onClick={() => setActiveModule((activeModule + 1) % modules.length)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 text-white transition-all"><ChevronRight/></button>
               </div>
            </div>
         </div>
      </section>

      {/* DOR REAL */}
      <section className="py-24 md:py-40 px-6 bg-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none mb-12">
            Você não perde dinheiro porque ganha pouco.<br/>
            <span className="text-rose-500 italic underline decoration-rose-500/30 underline-offset-8">Você perde porque não vê.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20 text-left">
            {["Caixa positivo, lucro negativo", "Esquecimento de boletos", "Mistura de contas", "Decisões no escuro", "Falta de previsibilidade"].map((pain, i) => (
              <div key={i} className="flex items-center gap-5 p-6 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-rose-50 transition-all">
                <X className="text-rose-500 shrink-0" size={24} />
                <span className="text-base font-bold text-slate-700 uppercase tracking-widest">{pain}</span>
              </div>
            ))}
          </div>
          <p className="text-xl md:text-3xl font-black text-blue-600 mt-24 italic">
            "Controle financeiro não é saber quanto tem hoje. É saber onde você vai estar amanhã."
          </p>
        </div>
      </section>

      {/* IA MASTER SECTION */}
      <section className="py-24 md:py-40 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
               <Bot size={18} /> Master Intelligence PRO
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none uppercase">Aqui o sistema <br/> pensa com você.</h2>
            <p className="text-xl text-slate-500 leading-relaxed font-medium">A IA analisa seus dados e entrega diagnósticos sobre margem real, ponto de equilíbrio e riscos financeiros de forma automática.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Margem Real', 'Ponto de Equilíbrio', 'Burn Rate', 'Risco de Caixa'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <CheckCircle2 className="text-blue-600 shrink-0" size={18} />
                  <span className="font-black text-slate-700 uppercase text-[10px] tracking-widest">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 relative bg-black p-10 md:p-16 rounded-[40px] shadow-4xl border border-white/10 flex flex-col gap-10 overflow-hidden group">
             <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-all"></div>
             <div className="flex justify-between items-center border-b border-white/10 pb-8 relative z-10">
                <span className="text-[12px] font-black uppercase tracking-[0.4em] text-white">Auditoria Gemini 3.0</span>
                <Zap className="text-blue-400 animate-pulse" size={24} />
             </div>
             <div className="bg-white/5 p-6 rounded-2xl border border-white/5 relative z-10">
                <p className="text-blue-300 font-mono text-sm leading-relaxed italic">"Identifiquei que sua margem caiu 12% nos últimos 30 dias. Sugestão: Rever assinaturas de ferramentas no Módulo Strategist."</p>
             </div>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section className="py-24 md:py-40 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-3xl md:text-5xl font-black uppercase mb-6 tracking-tight">O nível de controle que você deseja</h2>
          <p className="text-slate-500 font-medium italic">Todos começam com 7 dias grátis. Sem pedir cartão.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto px-4">
          <div className="bg-slate-50 p-10 md:p-14 rounded-3xl flex flex-col border border-slate-100 transition-all hover:bg-white hover:shadow-xl">
             <h4 className="text-2xl font-black uppercase mb-2">Essencial</h4>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Ideal para começar</span>
             <div className="mb-12"><span className="text-4xl font-black font-mono">R$ 39,90</span><span className="text-slate-400 font-bold uppercase text-[10px] ml-2">/mês</span></div>
             <div className="space-y-5 flex-1 mb-12">
                {['Entradas e Saídas', 'Categorias Custom', 'Agenda Financeira', 'Relatórios Básicos'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-600 uppercase tracking-widest"><Check size={16} className="text-emerald-500" /> {f}</div>
                ))}
             </div>
             <button onClick={onTesteGratis} className="w-full py-5 border-2 border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">Testar Grátis</button>
          </div>

          <div className="bg-blue-600 p-10 md:p-14 rounded-3xl flex flex-col relative scale-105 shadow-2xl shadow-blue-200 border-4 border-blue-400/30 z-10">
             <div className="absolute top-0 right-10 -translate-y-1/2 bg-white text-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">MAIS ESCOLHIDO</div>
             <h4 className="text-3xl font-black uppercase mb-2 text-white">Pro Estratégico</h4>
             <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-10">Controle Absoluto</span>
             <div className="mb-12"><span className="text-5xl font-black font-mono text-white">R$ 69,90</span><span className="text-blue-100 font-bold uppercase text-[11px] ml-2">/mês</span></div>
             <div className="space-y-5 flex-1 mb-12 text-white/90">
                {['Auditoria por IA', 'Saúde Financeira', 'Projeções Reais', 'Parceiros CRM', 'Pessoal x Empresa'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-[12px] font-black uppercase tracking-widest"><CheckCircle2 size={18} className="text-white" /> {f}</div>
                ))}
             </div>
             <button onClick={onTesteGratis} className="w-full py-6 bg-white text-blue-600 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:scale-[1.03] transition-all shadow-xl">Ativar Comando Agora</button>
          </div>

          <div className="bg-slate-50 p-10 md:p-14 rounded-3xl flex flex-col border border-slate-100 transition-all hover:bg-white hover:shadow-xl">
             <h4 className="text-2xl font-black uppercase mb-2">Master</h4>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Para grandes operações</span>
             <div className="mb-12"><span className="text-4xl font-black font-mono">R$ 129,90</span><span className="text-slate-400 font-bold uppercase text-[10px] ml-2">/mês</span></div>
             <div className="space-y-5 flex-1 mb-12">
                {['Múltiplas Empresas', 'IA Ilimitada', 'Auditoria Premium', 'Suporte VIP Direto'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-600 uppercase tracking-widest"><Check size={16} className="text-blue-500" /> {f}</div>
                ))}
             </div>
             <button onClick={onTesteGratis} className="w-full py-5 border-2 border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">Testar Grátis</button>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 md:py-60 px-6 text-center bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-blue-50/40 pointer-events-none"></div>
        <h2 className="text-5xl md:text-9xl font-black text-slate-900 tracking-tight leading-none mb-14 uppercase relative z-10">Pare de reagir. <br/> Comece a <span className="text-blue-600">comandar.</span></h2>
        <button onClick={onTesteGratis} className="px-16 py-8 md:py-10 bg-slate-900 text-white rounded-3xl text-base md:text-xl font-black uppercase tracking-[0.3em] shadow-4xl hover:bg-blue-600 transition-all flex items-center justify-center gap-6 mx-auto group relative z-10">
           Começar Comando Estratégico <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-6 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
           <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white border border-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-2xl shadow-xl shadow-blue-100/50">T</div>
                <div className="text-left">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.5em] block">Thor4Tech</span>
                  <span className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none">Cria Gestão PRO</span>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] text-center">Onde a clareza encontra o lucro.</p>
           </div>
           
           <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm group">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Tecnologia impulsionada por <span className="text-blue-600 font-black">Google Gemini IA</span>
           </div>

           <div className="flex gap-10 text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">
              © {new Date().getFullYear()} Thor4Tech • app.gestaocria.pro
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
