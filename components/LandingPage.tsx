
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Activity, Zap, Brain, Shield, ArrowRight, 
  Sparkles, LogIn, Check, Star, Crown, 
  Globe, Lock, Smartphone, Heart, 
  ShieldCheck, Trophy, Rocket, ChevronDown
} from 'lucide-react';

interface LandingPageProps {
  onEntrar: () => void;
  onTesteGratis: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEntrar, onTesteGratis }) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#fcfcfc] text-[#1F2937] font-inter w-full overflow-x-hidden">
      {/* Background Subtle Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-50 rounded-full blur-[150px] opacity-60"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-50 rounded-full blur-[150px] opacity-40"></div>
      </div>

      {/* 1. HEADER/NAVEGAÇÃO - Efeito Glass-morphism */}
      <header className="fixed top-0 left-0 right-0 h-20 md:h-24 bg-white/70 backdrop-blur-md border-b border-slate-200/50 z-[100] flex items-center px-6 md:px-12 justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#0D2B4F] p-2 rounded-xl text-white shadow-lg">
            <Activity size={24} />
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-[#0D2B4F]">
            Cria Gestão <span className="text-[#D4AF37]">Pro</span>
          </h1>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8">
          {['Recursos', 'Legal', 'Privacidade', 'Contato'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-[#0D2B4F] transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={onEntrar} 
            className="text-[#0D2B4F] hover:text-[#D4AF37] text-[10px] md:text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
          >
            <LogIn size={16} /> Login
          </button>
          <button 
            onClick={onTesteGratis} 
            className="px-6 md:px-10 py-3 md:py-4 bg-[#0D2B4F] text-white rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:bg-[#1e40af] hover:shadow-[0_10px_20px_rgba(13,43,79,0.3)] transition-all active:scale-95"
          >
            Testar Grátis
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION - Strategic Luxury */}
      <section className="relative pt-48 pb-32 md:pt-64 md:pb-48 px-6 text-center z-10">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-6 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] mb-10">
            <Sparkles size={12} /> Master Strategic Intelligence
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] mb-12 uppercase text-[#0D2B4F]">
            Domine seu <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D2B4F] via-[#1e40af] to-[#D4AF37] italic">Lucro Real.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-2xl text-slate-500 max-w-4xl mx-auto leading-relaxed mb-16 font-medium">
            Transforme a gestão da sua empresa em uma sala de comando estratégica. Auditoria preditiva e clareza total em tempo real.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button 
              onClick={onTesteGratis} 
              className="px-12 md:px-16 py-6 md:py-8 bg-[#0D2B4F] text-white rounded-[24px] md:rounded-[32px] text-base md:text-lg font-black uppercase tracking-widest shadow-2xl hover:bg-[#1e40af] hover:translate-y-[-4px] transition-all flex items-center gap-4 group"
            >
              Iniciar Operação <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>

          <motion.button 
            variants={itemVariants}
            onClick={scrollToFeatures}
            className="mt-20 md:mt-32 p-4 text-[#0D2B4F]/20 hover:text-[#D4AF37] transition-all animate-bounce"
          >
            <ChevronDown size={32} />
          </motion.button>
        </motion.div>
      </section>

      {/* 3. PROPOSTA DE VALOR - Três Pilares da Transformação */}
      <section id="features" className="py-32 md:py-48 px-6 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37] mb-4">Três Pilares da Transformação</h2>
            <p className="text-3xl md:text-5xl font-black text-[#0D2B4F] uppercase tracking-tighter">Engenharia Financeira de Elite.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
             <FeatureCard 
               icon={Zap} 
               title="Faturamento vs Real" 
               desc="Saiba exatamente quanto faturou e quanto realmente já caiu na conta, separando as expectativas da realidade." 
             />
             <FeatureCard 
               icon={Brain} 
               title="Auditoria IA" 
               desc="Nossa IA Master analisa sua saúde operativa e alerta sobre furos de caixa antes que eles aconteçam." 
             />
             <FeatureCard 
               icon={Shield} 
               title="Blindagem de Faturas" 
               desc="Gestão cirúrgica de cartões e bancos, garantindo que o dia 10 nunca mais seja uma surpresa negativa." 
             />
          </div>
        </div>
      </section>

      {/* 4. PLANOS DE PREÇO (Pricing Table) */}
      <section id="recursos" className="py-32 md:py-48 px-6 bg-slate-50 relative z-10 overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
            <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] bg-[#D4AF37] rounded-full blur-[100px]"></div>
         </div>

         <div className="max-w-7xl mx-auto text-center mb-24 md:mb-32 relative z-10">
            <h2 className="text-4xl md:text-7xl font-black text-[#0D2B4F] uppercase mb-6 tracking-tighter">
              Níveis de <span className="text-[#D4AF37]">Comando.</span>
            </h2>
            <p className="text-slate-400 uppercase tracking-[0.4em] text-[10px] md:text-xs">Escolha sua patente estratégica</p>
         </div>

         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-stretch relative z-10 px-4">
            <PricingCard 
              plan="Essencial" 
              price="39,90" 
              icon={Rocket} 
              features={['Fluxo de Caixa Real', 'Gestão de Bancos', 'Faturas de Cartão', 'Suporte Padrão']} 
              onStart={onTesteGratis} 
            />
            <PricingCard 
              plan="Pro Strategic" 
              price="69,90" 
              icon={Zap} 
              popular 
              features={['IA Master (3x/dia)', 'Saúde Líquida Real', 'CRM Parceiros', 'Suporte Prioritário']} 
              onStart={onTesteGratis} 
            />
            <PricingCard 
              plan="IA Master" 
              price="129,90" 
              icon={Crown} 
              features={['IA Ilimitada', 'Multi-empresas', 'Acesso Antecipado', 'Suporte VIP Direto']} 
              onStart={onTesteGratis} 
            />
         </div>
      </section>

      {/* 5. CTA SECUNDÁRIO / SOCIAL PROOF */}
      <section className="py-32 md:py-48 px-6 relative z-10 bg-[#0D2B4F] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37] rounded-full blur-[150px]"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400 rounded-full blur-[150px]"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
           <Trophy size={64} className="mx-auto text-[#D4AF37] mb-10 opacity-80" />
           <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase mb-12 leading-tight">
             Mais de <span className="text-[#D4AF37]">150 empresas</span> operando com clareza absoluta no Brasil.
           </h2>
           <p className="text-xl md:text-2xl text-blue-100/70 font-medium mb-16 max-w-3xl mx-auto italic">
             "Onde a clareza encontra o lucro. Transformando dados em liberdade para pequenos e médios empresários do Brasil."
           </p>
           <button 
             onClick={onTesteGratis} 
             className="px-12 py-6 bg-[#D4AF37] text-[#0D2B4F] rounded-full text-base font-black uppercase tracking-widest hover:scale-105 hover:bg-white transition-all shadow-4xl"
           >
             Assumir Comando Agora
           </button>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-24 px-6 md:px-12 bg-white border-t border-slate-100 relative z-10">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="md:col-span-2 space-y-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0D2B4F] rounded-xl flex items-center justify-center text-white font-black shadow-lg">T</div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-[#0D2B4F]">Cria Gestão <span className="text-[#D4AF37]">PRO</span></h3>
               </div>
               <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                 Onde a clareza encontra o lucro. Transformando dados em liberdade para pequenos e médios empresários do Brasil.
               </p>
               <div className="flex gap-4">
                  <FooterIcon icon={Globe} />
                  <FooterIcon icon={Lock} />
                  <FooterIcon icon={Smartphone} />
               </div>
            </div>
            
            <div className="space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Recursos</h4>
               <ul className="space-y-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  <li className="hover:text-[#0D2B4F] cursor-pointer transition-all">Auditoria IA</li>
                  <li className="hover:text-[#0D2B4F] cursor-pointer transition-all">Fluxo Dinâmico</li>
                  <li className="hover:text-[#0D2B4F] cursor-pointer transition-all">Gestão Bancária</li>
                  <li id="legal" className="hover:text-[#0D2B4F] cursor-pointer transition-all">Legal</li>
               </ul>
            </div>
            
            <div className="space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Corporativo</h4>
               <ul className="space-y-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  <li id="privacidade" className="hover:text-[#0D2B4F] cursor-pointer transition-all">Privacidade</li>
                  <li id="termos de uso" className="hover:text-[#0D2B4F] cursor-pointer transition-all">Termos de Uso</li>
                  <li id="criptografia" className="hover:text-[#0D2B4F] cursor-pointer transition-all">Criptografia</li>
                  <li id="contato" className="hover:text-[#0D2B4F] cursor-pointer transition-all">Contato</li>
               </ul>
            </div>
         </div>
         
         <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">© 2025 Thor4Tech | Master Intelligence</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                <ShieldCheck size={14} className="text-emerald-500" /> Criptografia 256-bit
              </div>
              <div className="flex items-center gap-2 text-[#D4AF37] text-[10px] font-black uppercase tracking-widest bg-[#D4AF37]/5 px-4 py-2 rounded-full border border-[#D4AF37]/20">
                <Heart size={14} fill="currentColor"/> Made in Brazil
              </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }: any) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="bg-white p-10 md:p-12 rounded-[40px] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all group border-t-4 border-t-transparent hover:border-t-[#D4AF37]"
  >
     <div className="p-5 bg-indigo-50 text-[#0D2B4F] rounded-3xl w-fit mb-8 group-hover:bg-[#0D2B4F] group-hover:text-white transition-all shadow-lg">
       <Icon size={32} />
     </div>
     <h4 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4 text-[#0D2B4F]">{title}</h4>
     <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
  </motion.div>
);

const PricingCard = ({ plan, price, features, icon: Icon, popular, onStart }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ scale: popular ? 1.05 : 1.02 }}
    className={`p-10 md:p-14 rounded-[56px] border flex flex-col justify-between h-auto lg:h-[700px] transition-all duration-500 relative ${popular ? 'bg-[#0D2B4F] border-[#D4AF37] shadow-[0_20px_50px_rgba(13,43,79,0.3)] z-10 text-white' : 'bg-white border-slate-200 hover:border-[#D4AF37] text-[#0D2B4F]'}`}
  >
     {popular && (
       <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#D4AF37] text-[#0D2B4F] px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 whitespace-nowrap">
         <Star size={14} fill="currentColor"/> RECOMENDADO
       </div>
     )}
     <div>
        <div className={`p-4 rounded-2xl border mb-10 w-fit ${popular ? 'bg-white/10 border-white/20 text-[#D4AF37]' : 'bg-indigo-50 border-slate-100 text-[#0D2B4F]'}`}>
          <Icon size={32}/>
        </div>
        <h3 className="text-2xl md:text-3xl font-black uppercase mb-8 tracking-tighter">{plan}</h3>
        <div className="mb-12">
          <span className="text-5xl md:text-6xl font-black font-mono tracking-tighter">R$ {price}</span>
          <span className={`text-[10px] font-black uppercase opacity-40 ml-3 ${popular ? 'text-blue-200' : 'text-slate-400'}`}>/mês</span>
        </div>
        <div className="space-y-5">
           {features.map((f: string, i: number) => (
             <div key={i} className="flex items-start gap-4 text-[11px] md:text-xs font-bold uppercase tracking-widest">
               <Check size={18} className={popular ? 'text-[#D4AF37]' : 'text-emerald-500'}/> 
               <span className={popular ? 'text-blue-100' : 'text-slate-500'}>{f}</span>
             </div>
           ))}
        </div>
     </div>
     <button 
       onClick={onStart} 
       className={`w-full py-6 mt-16 rounded-[28px] font-black uppercase text-xs tracking-widest transition-all shadow-xl ${popular ? 'bg-[#D4AF37] text-[#0D2B4F] hover:bg-white' : 'bg-[#0D2B4F] text-white hover:bg-[#1e40af]'}`}
     >
       Ativar Plano
     </button>
  </motion.div>
);

const FooterIcon = ({ icon: Icon }: any) => (
  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 hover:text-[#0D2B4F] hover:bg-white hover:shadow-md transition-all cursor-pointer">
    <Icon size={18}/>
  </div>
);

export default LandingPage;
