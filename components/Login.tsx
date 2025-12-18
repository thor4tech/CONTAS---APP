
import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, ChevronLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full -mr-[400px] -mt-[400px] blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-emerald-600/5 rounded-full -ml-[300px] -mb-[300px] blur-[150px] pointer-events-none"></div>

      {/* Botão de Voltar - Ajustado para mobile */}
      <div className="absolute top-4 md:top-10 left-4 md:left-10 z-50">
        <button 
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-all group"
        >
          <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-indigo-600 transition-all">
            <ChevronLeft size={16} />
          </div>
          <span className="hidden xs:inline">Voltar ao início</span>
        </button>
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex p-4 md:p-5 bg-gradient-to-br from-indigo-600 to-indigo-950 rounded-[24px] md:rounded-[32px] text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] mb-4 md:mb-6 border border-white/10 group">
            <Activity size={32} className="md:size-[36px] text-emerald-300 group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-1 md:mb-2 uppercase leading-none">Cria Gestão <span className="text-indigo-400">Pro</span></h1>
          <p className="text-[9px] md:text-[10px] font-black text-indigo-300/40 uppercase tracking-[0.5em]">Master Intelligence Strategic</p>
        </div>

        <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] md:rounded-[48px] p-8 md:p-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/20 w-full">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-2 flex items-center justify-center md:justify-start gap-2">
              {isRegistering ? 'Teste Grátis 7 Dias' : 'Painel Estratégico'} <Sparkles size={20} className="text-indigo-500 shrink-0" />
            </h2>
            <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              {isRegistering ? 'Inicie sua jornada de controle absoluto' : 'Acesse seu centro de comando financeiro'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-3 md:space-y-4">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="Seu email"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] md:rounded-[28px] pl-16 pr-8 py-4 md:py-5 focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-200 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm md:text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="Sua senha"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] md:rounded-[28px] pl-16 pr-8 py-4 md:py-5 focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-200 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm md:text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest text-center border border-rose-100">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 md:py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] md:rounded-[28px] text-[11px] md:text-[13px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 md:gap-4 group active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isRegistering ? 'Ativar Teste' : 'Entrar'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-100 text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[9px] md:text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              {isRegistering ? 'Já possui acesso? Entrar' : 'Novo aqui? Testar grátis'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
