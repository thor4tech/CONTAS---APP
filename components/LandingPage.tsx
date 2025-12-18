
import React, { useState, useEffect } from 'react';
import { 
  Activity, CheckCircle2, Zap, Brain, ShieldCheck, 
  Target, LayoutDashboard, List, BarChart3, Users, 
  Calendar, ArrowRight, Sparkles, X, Scale, Clock, 
  AlertTriangle, PieChart, Star, TrendingUp, DollarSign, Shield, 
  Rocket, Quote, Heart, LogIn, LayoutTemplate, Bot, Check,
  ChevronLeft, ChevronRight, TrendingDown, Smartphone, Globe, Lock,
  Wallet
} from 'lucide-react';

interface LandingPageProps {
  onEntrar: () => void;
  onTesteGratis: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEntrar, onTesteGratis }) => {
  const [activeModule, setActiveModule] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const testimonials = [
    { name: "Marcos S.", role: "Empresário", text: "Saí das planilhas que travavam para um comando de voz e IA. O lucro subiu 22% no primeiro mês.", avatar: "MS" },
    { name: "Carla R.", role: "Profissional Liberal", text: "Finalmente entendi para onde ia meu dinheiro. A Auditoria Master é como ter um sócio CFO.", avatar: "CR" },
    { name: "Ricardo T.", role: "Startup Founder", text: "O efeito visual e a rapidez do fluxo real são imbatíveis. Não troco por nada.", avatar: "RT" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIdx(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#020617] text-white font-inter w-full overflow-x-hidden selection:bg-blue-500/30">
      
      {/* 1. EFEITOS DE LUZ DE FUNDO (AMBIENT LIGHTS) */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[180px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]"></div>
         <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[1000px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] rotate-12"></div>
      </div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 h-24 bg-[#020617]/70 backdrop-blur-3xl border-b border-white/5 z-[100] flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-2xl text-[#020617] shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              <Activity size={26} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none hidden sm:block">
              Cria Gestão <span className="text-blue-500">Pro</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={onEntrar} className="flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all">
              <LogIn size={18} className="text-blue-500" /> Login
            </button>
            <button onClick={onTesteGratis} className="px-10 py-4 bg-white text-[#020617] rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(255,255,255,0.1)] hover:scale-105 transition-all">
              Testar Grátis
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-60 pb-32 md:pt-80 md:pb-60 px-6 overflow-hidden text-center z-10">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-12 animate-bounce-slow">
             <Sparkles size={14} /> Master Intelligence Strategic Edition
          </div>
          
          <h1 className="text-5xl md:text-9xl font-black tracking-tighter leading-[0.9] mb-14 uppercase">
            Não gerencie.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 italic">Domine seu Lucro.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-400 max-w-4xl mx-auto leading-relaxed mb-20 font-medium px-4">
            A ferramenta definitiva para quem cansou de planilhas complexas. <br className="hidden md:block" /> 
            Controle de caixa, auditoria por <span className="text-white font-black underline decoration-blue-500 decoration-4 underline-offset-8">IA Master</span> e visão estratégica em tempo real.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 px-4">
            <button onClick={onTesteGratis} className="w-full sm:w-auto px-16 py-8 bg-blue-600 text-white rounded-[32px] text-base font-black uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:scale-[1.05] transition-all flex items-center justify-center gap-4 group">
              Começar Agora <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button onClick={() => window.scrollTo({ top: 1200, behavior: 'smooth' })} className="w-full sm:w-auto px-14 py-8 bg-white/5 border border-white/10 text-white rounded-[32px] text-base font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all backdrop-blur-xl">
              Ver Ecossistema
            </button>
          </div>

          {/* DASHBOARD PREVIEW MOCKUP */}
          <div className="mt-32 md:mt-48 relative mx-auto max-w-5xl px-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
             <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-[48px] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
             <div className="relative bg-[#020617] border border-white/10 rounded-[48px] shadow-4xl overflow-hidden group">
                <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-6 gap-2">
                   <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                   <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                   <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                </div>
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" alt="Dashboard Preview" className="w-full h-auto opacity-40 mix-blend-luminosity grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-black uppercase tracking-[1em]">Master Control Interface</div>
             </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID COM LUZES */}
      <section className="py-40 px-6 relative z-10 bg-[#020617]/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             {[
               { title: "Liquidez Real", desc: "Sabe exatamente quanto sobra após todas as faturas de cartão e contas fixas.", icon: Wallet, color: "blue" },
               { title: "Auditoria IA", desc: "Seu consultor 24h analisando margens e furos de caixa automaticamente.", icon: Brain, color: "emerald" },
               { title: "Fluxo Dinâmico", desc: "Clonagem de meses anteriores e lançamentos em segundos.", icon: Zap, color: "indigo" },
               { title: "Segurança Total", desc: "Dados protegidos com criptografia de ponta e auditoria independente.", icon: Lock, color: "rose" },
               { title: "Multi-Dispositivo", desc: "Acesse do computador, tablet ou celular com interface responsiva.", icon: Smartphone, color: "amber" },
               { title: "Estratégia Pura", desc: "Ponto de equilíbrio, Burn Rate e Projeções de faturamento reais.", icon: TrendingUp, color: "sky" }
             ].map((f, i) => (
               <div key={i} className="bg-white/5 p-10 rounded-[48px] border border-white/5 hover:border-white/20 transition-all hover:translate-y-[-10px] group relative overflow-hidden">
                  <div className={`absolute -top-20 -right-20 w-40 h-40 bg-${f.color}-500/10 rounded-full blur-[60px]`}></div>
                  <div className={`p-5 bg-white/5 rounded-3xl w-fit mb-8 group-hover:bg-white text-white group-hover:text-[#020617] transition-all shadow-xl`}>
                    <f.icon size={32} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-2xl font-black uppercase tracking-tight mb-4">{f.title}</h4>
                  <p className="text-slate-400 text-base leading-relaxed">{f.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* CARROSSEL DE DEPOIMENTOS (SLICK STYLE) */}
      <section className="py-40 px-6 bg-[#020617]">
         <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-20">Aprovado por <span className="text-emerald-400">Estrategistas</span></h2>
            
            <div className="relative h-[350px] flex items-center justify-center">
               {testimonials.map((t, i) => (
                 <div key={i} className={`absolute inset-0 transition-all duration-1000 flex flex-col items-center justify-center ${i === testimonialIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                    <Quote size={60} className="text-blue-500/20 mb-8" />
                    <p className="text-xl md:text-3xl font-medium text-slate-200 italic leading-relaxed mb-10 max-w-3xl">"{t.text}"</p>
                    <div className="flex items-center gap-5">
                       <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-2xl">{t.avatar}</div>
                       <div className="text-left">
                          <h4 className="font-black text-white uppercase tracking-widest">{t.name}</h4>
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em]">{t.role}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            <div className="flex gap-2 justify-center mt-12">
               {testimonials.map((_, i) => (
                 <button key={i} onClick={() => setTestimonialIdx(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === testimonialIdx ? 'w-12 bg-blue-500' : 'w-2 bg-white/10'}`}></button>
               ))}
            </div>
         </div>
      </section>

      {/* PLANOS PREMIUM */}
      <section className="py-60 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-32">
             <h2 className="text-4xl md:text-7xl font-black uppercase mb-6">Níveis de <span className="text-blue-500">Controle</span></h2>
             <p className="text-slate-400 text-lg uppercase tracking-[0.4em]">Escolha sua patente estratégica</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch max-w-6xl mx-auto">
             {/* ESSENCIAL */}
             <div className="bg-white/5 backdrop-blur-xl p-12 rounded-[56px] border border-white/5 flex flex-col hover:bg-white/10 transition-all">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Startup Mode</span>
                <h4 className="text-3xl font-black uppercase mb-2">Essencial</h4>
                <div className="mb-12"><span className="text-5xl font-black font-mono">R$ 39,90</span><span className="text-slate-500 font-bold ml-2">/mês</span></div>
                <div className="space-y-6 flex-1 mb-16">
                   {['Fluxo de Caixa Real', 'Gestão de Bancos', 'Categorias Custom', 'Agenda Financeira'].map((f, i) => (
                     <div key={i} className="flex items-center gap-4 text-[12px] font-bold text-slate-300 uppercase tracking-widest"><Check size={18} className="text-emerald-500" /> {f}</div>
                   ))}
                </div>
                <button onClick={onTesteGratis} className="w-full py-6 bg-white/5 border border-white/10 text-white rounded-3xl text-[12px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Começar Teste</button>
             </div>

             {/* PRO */}
             <div className="bg-blue-600 p-12 rounded-[56px] flex flex-col relative scale-105 shadow-[0_40px_100px_rgba(37,99,235,0.3)] border-4 border-blue-400/50">
                <div className="absolute top-0 right-12 -translate-y-1/2 bg-white text-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl">Mais Ativado</div>
                <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-4">Estrategista</span>
                <h4 className="text-4xl font-black uppercase mb-2">Pro Edition</h4>
                <div className="mb-12"><span className="text-6xl font-black font-mono">R$ 69,90</span><span className="text-blue-200 font-bold ml-2">/mês</span></div>
                <div className="space-y-6 flex-1 mb-16">
                   {['Auditoria por IA', 'Saúde Líquida Real', 'Projeções de Caixa', 'Gestão de Parceiros'].map((f, i) => (
                     <div key={i} className="flex items-center gap-4 text-[13px] font-black text-white uppercase tracking-widest"><CheckCircle2 size={20} className="text-white" /> {f}</div>
                   ))}
                </div>
                <button onClick={onTesteGratis} className="w-full py-7 bg-white text-blue-600 rounded-3xl text-[13px] font-black uppercase tracking-[0.3em] shadow-4xl hover:scale-105 transition-all">Ativar Comando Agora</button>
             </div>

             {/* MASTER */}
             <div className="bg-white/5 backdrop-blur-xl p-12 rounded-[56px] border border-white/5 flex flex-col hover:bg-white/10 transition-all">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Industrial Mode</span>
                <h4 className="text-3xl font-black uppercase mb-2">Master</h4>
                <div className="mb-12"><span className="text-5xl font-black font-mono">R$ 129,90</span><span className="text-slate-500 font-bold ml-2">/mês</span></div>
                <div className="space-y-6 flex-1 mb-16">
                   {['IA Ilimitada', 'Multi-Empresas', 'Dashboard Master', 'Suporte VIP'].map((f, i) => (
                     <div key={i} className="flex items-center gap-4 text-[12px] font-bold text-slate-300 uppercase tracking-widest"><Check size={18} className="text-blue-400" /> {f}</div>
                   ))}
                </div>
                <button onClick={onTesteGratis} className="w-full py-6 bg-white/5 border border-white/10 text-white rounded-3xl text-[12px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Ativar Master</button>
             </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-40 px-6 border-t border-white/5 bg-[#020617] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-20">
           <div className="flex flex-col items-center gap-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white border border-white/10 rounded-[28px] flex items-center justify-center text-[#020617] font-black text-3xl shadow-2xl">T</div>
                <div className="text-left">
                  <span className="text-sm font-black text-white/40 uppercase tracking-[0.6em] block">Thor4Tech</span>
                  <span className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Cria Gestão PRO</span>
                </div>
              </div>
              <p className="text-lg font-medium text-slate-500 max-w-md text-center leading-relaxed italic">"Onde a clareza encontra o lucro. Transformando dados em liberdade."</p>
           </div>
           
           <div className="flex items-center gap-4 px-10 py-5 bg-white/5 border border-white/10 rounded-full text-[12px] font-black uppercase tracking-[0.2em] text-white group hover:bg-blue-600/10 hover:border-blue-500/20 transition-all">
              <Sparkles size={18} className="text-blue-400 animate-pulse" /> Tecnologia impulsionada por <span className="text-blue-500 ml-2">Google Gemini AI</span>
           </div>

           <div className="flex flex-wrap justify-center gap-14 text-[11px] font-black text-slate-600 uppercase tracking-[0.5em]">
              <span>© {new Date().getFullYear()} Thor4Tech</span>
              <a href="#" className="hover:text-blue-500 transition-colors">Termos</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Privacidade</a>
              <a href="#" className="hover:text-blue-500 transition-colors">app.gestaocria.pro</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
