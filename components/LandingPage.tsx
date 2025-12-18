
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
            </div>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-48 pb-24 md:pt-64 md:pb-40 px-6 relative overflow-hidden w-full">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50 rounded-full -mr-[300px] -mt-[300px] blur-[120px] pointer-events-none opacity-50"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <Sparkles size={14} /> Inteligência Artificial Financeira
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] mb-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Controle financeiro não é planilha.<br/>
            <span className="text-indigo-600">É comando estratégico.</span>
          </h2>
          <p className="text-lg md:text-2xl font-medium text-slate-500 max-w-3xl mx-auto leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Acesse <span className="text-slate-900 font-bold uppercase">gestaocria.pro</span> e descubra por que o controle absoluto é the caminho mais rápido para a sua lucratividade.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <button 
              onClick={onTesteGratis}
              className="w-full sm:w-auto px-12 py-6 bg-slate-900 text-white rounded-full text-[13px] font-black uppercase tracking-[0.2em] shadow-4xl hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
            >
              Iniciar Operação Grátis <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] mt-8">Acesse agora: app.gestaocria.pro</p>
        </div>
      </section>

      {/* 3. PROBLEMA CLARO */}
      <section className="py-24 md:py-40 bg-[#020617] text-white overflow-hidden relative w-full">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-10">
            Pare de reagir ao seu dinheiro.<br/>
            <span className="text-indigo-400">Comece a comandar.</span>
          </h3>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-20 font-medium">
             Sua gestão atual te dá números. Nós te damos inteligência.
          </p>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="py-20 px-6 border-t border-slate-200 bg-white w-full">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
             <Activity size={24} className="text-slate-900" />
             <span className="text-lg font-black tracking-tighter uppercase">GESTAOCRIA.PRO</span>
          </div>
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            GESTAO CRIA PRO © {new Date().getFullYear()} Thor4Tech • app.gestaocria.pro
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
