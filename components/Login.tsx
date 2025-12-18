
import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Activity, Lock, Mail, ArrowRight, Sparkles, ChevronLeft, Star, Users, CheckCircle2, Trophy, Gift, Rocket } from 'lucide-react';

interface Props {
  onLogin: () => void;
  onBackToLanding: () => void;
}

const Login: React.FC<Props> = ({ onLogin, onBackToLanding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err: any) {
      setError('Credenciais inválidas ou erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row relative overflow-x-hidden font-inter transition-opacity duration-500">
      
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 bg-white relative z-20 md:h-screen overflow-y-auto no-scrollbar">
        
        <div className="absolute top-6 left-6 md:top-10 md:left-10">
          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-2 py-3 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-lg transition-all active:scale-95 group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            <span>Voltar</span>
          </button>
        </div>

        <div className="w-full max-w-[420px] py-12 md:py-0 animate-in fade-in slide-in-from-left duration-700">
          <div className="mb-12 text-center md:text-left flex flex-col items-center md:items-start">
             <div className="p-3.5 bg-black rounded-[18px] text-white shadow-xl mb-6">
                <Activity size={32} />
             </div>
             <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none mb-2">
               <span className="text-slate-900">Cria Gestão</span> <span className="text-[#3b82f6]">Pro</span>
             </h1>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Master Intelligence 2.0</p>
          </div>

          <div className="space-y-8">
             <div className="text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-2.5">
                  {isRegistering ? 'Ativar Novo Comando' : 'Entrar no Sistema'} <Sparkles size={20} className="text-indigo-500" />
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">
                  Controle absoluto e lucratividade máxima.
                </p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-3.5">
                   <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#3b82f6] transition-colors" size={18} />
                      <input 
                        type="email" 
                        required
                        placeholder="Seu e-mail corporativo"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-16 pr-8 py-4.5 md:py-5 focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm md:text-base shadow-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                   </div>

                   <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#3b82f6] transition-colors" size={18} />
                      <input 
                        type="password" 
                        required
                        placeholder="Sua senha de comando"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-16 pr-8 py-4.5 md:py-5 focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm md:text-base shadow-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                   </div>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest text-center border border-rose-100">
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-5 md:py-6 bg-[#020617] hover:bg-[#3b82f6] text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group active:scale-95 shadow-xl"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isRegistering ? 'Solicitar Acesso' : 'Acessar Comando'}
                      <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </button>
             </form>

             <div className="pt-8 border-t border-slate-100 text-center">
                <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="px-6 py-2.5 rounded-full text-[9px] md:text-[10px] font-black text-slate-400 hover:text-[#3b82f6] hover:bg-slate-50 transition-all uppercase tracking-[0.2em]"
                >
                  {isRegistering ? 'Já possui comando? Entrar' : 'Não tem conta? Testar Grátis'}
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: ADS/INDICAÇÃO */}
      <div className="w-full md:w-1/2 bg-[#020617] relative flex flex-col justify-center items-center p-12 lg:p-20 text-white overflow-hidden md:h-screen">
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-lg space-y-10 animate-in fade-in slide-in-from-right duration-1000">
           <div className="space-y-6">
              <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[9px] font-black uppercase tracking-[0.3em]">
                 <Trophy size={14} /> Clube de Embaixadores Cria
              </div>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tighter leading-[1.1]">
                 Ajude outros a <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">comandar melhor.</span>
              </h2>
              <p className="text-base text-slate-400 font-medium leading-relaxed border-l-2 border-blue-500 pl-6">
                 "O Cria Gestão Pro transforma entradas e saídas em lucro real. Indique para amigos e ganhe bônus exclusivos."
              </p>
           </div>

           <div className="grid grid-cols-1 gap-5">
              <div className="p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl transition-all hover:bg-white/[0.08] group">
                 <div className="flex items-center gap-5">
                    <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl group-hover:scale-110 transition-transform shadow-xl">
                       <Users size={24} />
                    </div>
                    <div>
                       <h4 className="text-lg font-black tracking-tight mb-1 uppercase text-white">Indique & Lucre</h4>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-loose">Receba mensalidades grátis por indicações ativas.</p>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl transition-all hover:bg-white/[0.08] group">
                 <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform shadow-xl">
                       <Star size={24} />
                    </div>
                    <div>
                       <h4 className="text-lg font-black tracking-tight mb-1 uppercase text-white">Upgrade Bônus</h4>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-loose">Desbloqueie funções MASTER via convites.</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-4 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-9 h-9 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center text-[8px] font-black uppercase text-white/40">U{i}</div>
                    ))}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">+ 1.200 Estrategistas ativos</span>
              </div>
              <div className="flex items-center gap-2.5 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-400/5 px-5 py-2.5 rounded-full border border-emerald-400/10 self-start">
                 <CheckCircle2 size={14} /> Auditoria Realtime Ativada
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
