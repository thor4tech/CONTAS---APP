
import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { Activity, Lock, Mail, ArrowRight, Sparkles, ChevronLeft, Star, Users, CheckCircle2, Trophy, KeyRound, CheckCircle } from 'lucide-react';

interface Props {
  onLogin: () => void;
  onBackToLanding: () => void;
}

const Login: React.FC<Props> = ({ onLogin, onBackToLanding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados de controle de fluxo
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  
  // Estados de feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Credenciais incorretas.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Erro ao conectar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Digite seu e-mail para recuperar a senha.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg('Link de recuperação enviado! Verifique seu e-mail (e a caixa de spam).');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('E-mail não cadastrado no sistema.');
      } else if (err.code === 'auth/invalid-email') {
        setError('E-mail inválido.');
      } else {
        setError('Erro ao enviar e-mail. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (mode: 'login' | 'register' | 'recovery') => {
    setError(null);
    setSuccessMsg(null);
    if (mode === 'recovery') {
      setIsRecovering(true);
      setIsRegistering(false);
    } else if (mode === 'register') {
      setIsRegistering(true);
      setIsRecovering(false);
    } else {
      setIsRegistering(false);
      setIsRecovering(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row relative overflow-x-hidden font-inter transition-opacity duration-500">
      
      {/* LADO ESQUERDO: FORMULÁRIO */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 bg-white relative z-20 md:h-screen overflow-y-auto no-scrollbar">
        
        <div className="absolute top-6 left-6 md:top-10 md:left-10">
          <button 
            onClick={onBackToLanding}
            className="flex items-center gap-2 py-4 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-lg transition-all active:scale-95 group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            <span>Voltar</span>
          </button>
        </div>

        <div className="w-full max-w-[450px] py-12 md:py-0 animate-in fade-in slide-in-from-left duration-700">
          <div className="mb-14 text-center flex flex-col items-center">
             <div className="p-4 bg-black rounded-[24px] text-white shadow-2xl mb-8">
                <Activity size={40} />
             </div>
             <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-3">
               <span className="text-slate-900">Cria Gestão</span> <span className="text-[#3b82f6]">Pro</span>
             </h1>
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Master Intelligence 2.0</p>
          </div>

          <div className="space-y-10">
             <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-3">
                  {isRecovering ? 'Resgatar Acesso' : isRegistering ? 'Criar Nova Patente' : 'Entrar no Comando'} 
                  {!isRecovering && <Sparkles size={24} className="text-blue-500" />}
                  {isRecovering && <KeyRound size={24} className="text-amber-500" />}
                </h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3 leading-relaxed">
                  {isRecovering 
                    ? 'Informe seu e-mail para redefinir sua credencial.' 
                    : 'Controle absoluto e lucratividade máxima.'}
                </p>
             </div>

             {/* Formulário de Login / Registro / Recuperação */}
             {isRecovering ? (
               // === TELA DE RECUPERAÇÃO ===
               <form onSubmit={handleRecovery} className="space-y-6">
                  <div className="space-y-4">
                     <div className="relative group">
                        <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
                        <input 
                          type="email" 
                          required
                          placeholder="Seu e-mail cadastrado"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] pl-16 pr-8 py-5 md:py-6 focus:ring-4 focus:ring-amber-50 focus:bg-white focus:border-amber-200 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 text-base md:text-lg shadow-sm"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                     </div>
                  </div>

                  {error && (
                    <div className="p-5 bg-rose-50 text-rose-600 rounded-[22px] text-[10px] font-black uppercase tracking-widest text-center border border-rose-100 flex items-center justify-center gap-2">
                      <span className="block w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span> {error}
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[22px] text-[10px] font-black uppercase tracking-widest text-center border border-emerald-100 flex items-center justify-center gap-2">
                      <CheckCircle size={16} /> {successMsg}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading || !!successMsg}
                    className="w-full py-6 md:py-7 bg-[#020617] hover:bg-amber-600 text-white rounded-[28px] text-[13px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 group active:scale-95 shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Enviar Link de Resgate
                        <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="pt-4 text-center">
                    <button 
                      type="button"
                      onClick={() => toggleMode('login')}
                      className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-[0.2em] transition-colors"
                    >
                      Voltar para Login
                    </button>
                  </div>
               </form>
             ) : (
               // === TELA DE LOGIN / REGISTRO ===
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                     <div className="relative group">
                        <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#3b82f6] transition-colors" size={20} />
                        <input 
                          type="email" 
                          required
                          placeholder="Seu e-mail corporativo"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] pl-16 pr-8 py-5 md:py-6 focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 text-base md:text-lg shadow-sm"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                     </div>

                     <div className="space-y-2">
                       <div className="relative group">
                          <Lock className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#3b82f6] transition-colors" size={20} />
                          <input 
                            type="password" 
                            required
                            placeholder="Sua senha de comando"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] pl-16 pr-8 py-5 md:py-6 focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 text-base md:text-lg shadow-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                       </div>
                       {!isRegistering && (
                         <div className="text-right px-4">
                           <button 
                             type="button"
                             onClick={() => toggleMode('recovery')}
                             className="text-[10px] font-black text-slate-400 hover:text-[#3b82f6] uppercase tracking-widest transition-colors"
                           >
                             Esqueceu a senha?
                           </button>
                         </div>
                       )}
                     </div>
                  </div>

                  {error && (
                    <div className="p-5 bg-rose-50 text-rose-600 rounded-[22px] text-[10px] font-black uppercase tracking-widest text-center border border-rose-100 flex items-center justify-center gap-2">
                      <span className="block w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span> {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-6 md:py-7 bg-[#020617] hover:bg-[#3b82f6] text-white rounded-[28px] text-[13px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 group active:scale-95 shadow-2xl"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        {isRegistering ? 'Solicitar Patente' : 'Acessar Comando'}
                        <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
               </form>
             )}

             {!isRecovering && (
               <div className="pt-10 border-t border-slate-100 text-center">
                  <button 
                    onClick={() => toggleMode(isRegistering ? 'login' : 'register')}
                    className="px-8 py-3 rounded-full text-[10px] md:text-[11px] font-black text-slate-400 hover:text-[#3b82f6] hover:bg-slate-50 transition-all uppercase tracking-[0.2em]"
                  >
                    {isRegistering ? 'Já possui comando? Entrar' : 'Não tem conta? Testar Grátis'}
                  </button>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* LADO DIREITO: ADS/INDICAÇÃO */}
      <div className="w-full md:w-1/2 bg-[#020617] relative flex flex-col justify-center items-center p-12 lg:p-24 text-white overflow-hidden md:h-screen">
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-[-15%] right-[-15%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[180px] animate-pulse"></div>
           <div className="absolute bottom-[-15%] left-[-15%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 max-w-xl space-y-12 animate-in fade-in slide-in-from-right duration-1000">
           <div className="space-y-8">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.4em]">
                 <Trophy size={16} /> Clube de Embaixadores Cria
              </div>
              <h2 className="text-4xl lg:text-6xl font-black tracking-tighter leading-[1.1]">
                 Ajude outros a <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">comandar melhor.</span>
              </h2>
              <p className="text-lg text-slate-400 font-medium leading-relaxed border-l-4 border-blue-600 pl-8 italic">
                 "O Cria Gestão Pro transforma o caos financeiro em clareza absoluta. Indique para seu círculo e ganhe upgrades Master."
              </p>
           </div>

           <div className="grid grid-cols-1 gap-6">
              <div className="p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] transition-all hover:bg-white/[0.08] group shadow-2xl">
                 <div className="flex items-center gap-6">
                    <div className="p-5 bg-blue-500/20 text-blue-400 rounded-3xl group-hover:scale-110 transition-transform shadow-3xl">
                       <Users size={32} />
                    </div>
                    <div>
                       <h4 className="text-xl font-black tracking-tight mb-2 uppercase text-white">Indique & Lucre</h4>
                       <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-loose">Receba 1 mês grátis para cada ativação PRO indicada.</p>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] transition-all hover:bg-white/[0.08] group shadow-2xl">
                 <div className="flex items-center gap-6">
                    <div className="p-5 bg-indigo-500/20 text-indigo-400 rounded-3xl group-hover:scale-110 transition-transform shadow-3xl">
                       <Star size={32} />
                    </div>
                    <div>
                       <h4 className="text-xl font-black tracking-tight mb-2 uppercase text-white">Upgrade VIP</h4>
                       <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-loose">Desbloqueie a IA Master Vitalícia com 10 convites ativos.</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-8 flex flex-col gap-8">
              <div className="flex items-center gap-5">
                 <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-11 h-11 rounded-full border-4 border-[#020617] bg-slate-800 flex items-center justify-center text-[10px] font-black uppercase text-white/40">U{i}</div>
                    ))}
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50">+ 1.200 Estrategistas ativos no Brasil</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-400 text-[11px] font-black uppercase tracking-[0.3em] bg-emerald-400/5 px-6 py-3 rounded-full border border-emerald-400/10 self-start shadow-xl shadow-emerald-500/5">
                 <CheckCircle2 size={16} /> Auditoria Master Ativada
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
