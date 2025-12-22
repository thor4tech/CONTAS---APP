
import React, { useState } from 'react';
import { Activity, Zap, Brain, Target, ArrowRight, Sparkles, LogIn, Check, Shield, Star, Crown, Rocket, Globe, Lock, Smartphone, Heart } from 'lucide-react';

interface LandingPageProps {
  onEntrar: () => void;
  onTesteGratis: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEntrar, onTesteGratis }) => {
  const handleStart = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onTesteGratis();
  };

  return (
    <div className="bg-[#020617] text-white font-inter w-full overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[180px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 h-24 bg-[#020617]/70 backdrop-blur-2xl border-b border-white/5 z-[100] flex items-center px-6 md:px-12 justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2.5 rounded-2xl text-[#020617] shadow-2xl"><Activity size={26} /></div>
          <h1 className="text-2xl font-black tracking-tighter uppercase hidden sm:block">Cria Gestão <span className="text-blue-500">Pro</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onEntrar} className="text-white/60 hover:text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><LogIn size={18} className="text-blue-500"/> Login</button>
          <button onClick={handleStart} className="px-10 py-4 bg-white text-[#020617] rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">Testar Grátis</button>
        </div>
      </header>

      <section className="relative pt-60 pb-32 px-6 text-center z-10">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-12"><Sparkles size={14} /> Master Strategic Intelligence</div>
          <h1 className="text-5xl md:text-9xl font-black tracking-tighter leading-[0.9] mb-14 uppercase">Domine seu <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 italic">Lucro Real.</span></h1>
          <p className="text-lg md:text-2xl text-slate-400 max-w-4xl mx-auto leading-relaxed mb-20 font-medium">Transforme a gestão da sua empresa em uma sala de comando estratégica. Auditoria preditiva e clareza total em tempo real.</p>
          <button onClick={handleStart} className="px-16 py-8 bg-blue-600 text-white rounded-[32px] text-base font-black uppercase tracking-widest shadow-4xl hover:bg-blue-500 transition-all flex items-center gap-4 mx-auto group">Iniciar Operação <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" /></button>
        </div>
      </section>

      <section className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
           <FeatureCard icon={Zap} title="Faturamento vs Real" desc="Saiba exatamente quanto faturou e quanto realmente já caiu na conta, separando as expectativas da realidade." />
           <FeatureCard icon={Brain} title="Auditoria IA" desc="Nossa IA Master analisa sua saúde operativa e alerta sobre furos de caixa antes que eles aconteçam." />
           <FeatureCard icon={Shield} title="Blindagem de Faturas" desc="Gestão cirúrgica de cartões e bancos, garantindo que o dia 10 nunca mais seja uma surpresa negativa." />
        </div>
      </section>

      <section className="py-40 px-6 bg-[#020617]/50 border-y border-white/5 relative z-10">
         <div className="max-w-7xl mx-auto text-center mb-32">
            <h2 className="text-4xl md:text-7xl font-black uppercase mb-6 tracking-tighter">Níveis de <span className="text-blue-500">Comando.</span></h2>
            <p className="text-slate-400 uppercase tracking-[0.4em] text-xs">Escolha sua patente estratégica</p>
         </div>
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
            <PricingCard plan="Essencial" price="39,90" icon={Rocket} color="slate" features={['Fluxo de Caixa Real', 'Gestão de Bancos', 'Faturas de Cartão', 'Suporte Padrão']} onStart={handleStart} />
            <PricingCard plan="Pro Strategic" price="69,90" icon={Zap} color="blue" popular features={['IA Master (3x/dia)', 'Saúde Líquida Real', 'CRM Parceiros', 'Suporte Prioritário']} onStart={handleStart} />
            <PricingCard plan="IA Master" price="129,90" icon={Crown} color="indigo" features={['IA Ilimitada', 'Multi-empresas', 'Acesso Antecipado', 'Suporte VIP Direto']} onStart={handleStart} />
         </div>
      </section>

      <footer className="py-32 px-6 bg-[#020617] border-t border-white/5 relative z-10">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="md:col-span-2 space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black font-black">T</div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Cria Gestão PRO</h3>
               </div>
               <p className="text-slate-400 max-w-sm font-medium">"Onde a clareza encontra o lucro. Transformando dados em liberdade para pequenos e médios empresários do Brasil."</p>
               <div className="flex gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/40"><Globe size={20}/></div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/40"><Lock size={20}/></div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/40"><Smartphone size={20}/></div>
               </div>
            </div>
            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Recursos</h4>
               <ul className="space-y-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                  <li className="hover:text-white cursor-pointer transition-all">Auditoria IA</li>
                  <li className="hover:text-white cursor-pointer transition-all">Fluxo Dinâmico</li>
                  <li className="hover:text-white cursor-pointer transition-all">Gestão Bancária</li>
               </ul>
            </div>
            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Legal</h4>
               <ul className="space-y-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                  <li className="hover:text-white cursor-pointer transition-all">Privacidade</li>
                  <li className="hover:text-white cursor-pointer transition-all">Termos de Uso</li>
                  <li className="hover:text-white cursor-pointer transition-all">Criptografia</li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">© 2025 Thor4Tech | Master Intelligence</p>
            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-6 py-2 rounded-full border border-emerald-500/20"><Heart size={14} fill="currentColor"/> Made in Brazil</div>
         </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }: any) => (
  <div className="bg-white/5 p-10 rounded-[48px] border border-white/5 hover:border-white/20 transition-all hover:translate-y-[-10px] group">
     <div className="p-4 bg-blue-600/20 text-blue-400 rounded-3xl w-fit mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl"><Icon size={32} /></div>
     <h4 className="text-2xl font-black uppercase tracking-tight mb-4">{title}</h4>
     <p className="text-slate-400 leading-relaxed font-medium">{desc}</p>
  </div>
);

const PricingCard = ({ plan, price, features, icon: Icon, popular, onStart }: any) => (
  <div className={`p-10 md:p-14 rounded-[56px] border flex flex-col justify-between h-[650px] transition-all duration-700 relative ${popular ? 'bg-blue-600 border-blue-400 scale-105 shadow-4xl z-10' : 'bg-white/5 border-white/10 hover:bg-white/[0.08]'}`}>
     {popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-blue-600 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2"><Star size={12} fill="currentColor"/> Recomendado</div>}
     <div>
        <div className={`p-4 rounded-2xl border mb-10 w-fit ${popular ? 'bg-white/20 border-white/20 text-white' : 'bg-white/5 border-white/10 text-indigo-400'}`}><Icon size={32}/></div>
        <h3 className="text-3xl font-black uppercase mb-8 tracking-tighter">{plan}</h3>
        <div className="mb-10"><span className="text-5xl font-black font-mono">R$ {price}</span><span className="text-[10px] font-black uppercase opacity-40 ml-2">/mês</span></div>
        <div className="space-y-4">
           {features.map((f: string, i: number) => <div key={i} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest"><Check size={16} className={popular ? 'text-white' : 'text-emerald-400'}/> {f}</div>)}
        </div>
     </div>
     <button onClick={onStart} className={`w-full py-6 rounded-[28px] font-black uppercase text-xs tracking-widest transition-all shadow-xl ${popular ? 'bg-white text-blue-600 hover:scale-105' : 'bg-white/10 text-white hover:bg-white hover:text-black'}`}>Ativar Agora</button>
  </div>
);

export default LandingPage;
