
import React, { useState } from 'react';
import { auth } from '../lib/firebase';
// Fix: Use modular authentication functions as named exports from firebase/auth
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
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
        // Fix: Auth modular functions take the auth instance as the first argument
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
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background de autoridade estratégica */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full -mr-[400px] -mt-[400px] blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-emerald-600/5 rounded-full -ml-[300px] -mb-[300px] blur-[150px] pointer-events-none"></div>
      
      {/* Elementos abstratos de grade */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-gradient-to-br from-indigo-600 to-indigo-950 rounded-[32px] text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] mb-6 border border-white/10 group">
            <Activity size={36} className="text-emerald-300 group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Cria Gestão <span className="text-indigo-400">Pro</span></h1>
          <p className="text-[10px] font-black text-indigo-300/40 uppercase tracking-[0.5em]">Master Intelligence Strategic</p>
        </div>

        <div className="bg-white/95 backdrop-blur-2xl rounded-[48px] p-10 md:p-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/20">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 flex items-center justify-center md:justify-start gap-2">
              {isRegistering ? 'Criar Acesso' : 'Painel Estratégico'} <Sparkles size={20} className="text-indigo-500" />
            </h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              {isRegistering ? 'Inicie sua jornada de controle absoluto' : 'Acesse seu centro de comando financeiro'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="Seu email cadastrado"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] pl-16 pr-8 py-5 focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-200 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  placeholder="Sua senha secreta"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] pl-16 pr-8 py-5 focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-200 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-rose-100">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[28px] text-[13px] font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:shadow-[0_25px_50px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-4 group active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isRegistering ? 'Cadastrar Agora' : 'Acessar Centro de Comando'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              {isRegistering ? 'Já possui acesso estratégico? Login' : 'Não tem conta? Solicite ao administrador'}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center opacity-40">
          <p className="text-[9px] font-black text-white uppercase tracking-[0.6em] flex items-center justify-center gap-3">
             <ShieldCheck size={14} className="text-indigo-400" /> Rafael Torquato MASTER INTELLIGENCE
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
