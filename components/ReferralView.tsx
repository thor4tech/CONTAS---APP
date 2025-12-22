
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Heart, Gift, Copy, Check, Share2, Star, Trophy, ShieldCheck } from 'lucide-react';

interface Props {
  userProfile: UserProfile;
}

const ReferralView: React.FC<Props> = ({ userProfile }) => {
  const [copied, setCopied] = useState(false);
  const [refCode, setRefCode] = useState(userProfile.referralCode || '');

  useEffect(() => {
    const generateRefCode = async () => {
      if (!auth.currentUser || userProfile.referralCode) return;
      const newCode = auth.currentUser.uid.slice(0, 8).toUpperCase();
      await setDoc(doc(db, `users/${auth.currentUser.uid}/profile`, 'settings'), { referralCode: newCode }, { merge: true });
      setRefCode(newCode);
    };
    generateRefCode();
  }, [userProfile]);

  const referralLink = `https://gestaocria.pro/join?ref=${refCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 animate-in fade-in pb-20 px-4 md:px-0">
      <div className="bg-[#020617] rounded-[48px] p-8 md:p-16 relative overflow-hidden border border-white/5 shadow-4xl text-center md:text-left">
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
         <div className="relative z-10 max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mx-auto md:mx-0">
               <Heart size={16} fill="currentColor" /> Embaixador Oficial
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none text-white uppercase">
               Ajude outros a <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 italic">Domar o Lucro.</span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-400 font-medium leading-relaxed border-l-0 md:border-l-4 border-blue-600 pl-0 md:pl-8 italic">"O Cria Gestão Pro transforma o caos financeiro em clareza absoluta. Indique para seu círculo e ganhe upgrades Master."</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-2xl flex flex-col justify-between">
            <div>
               <div className="flex justify-between items-start mb-10">
                  <div className="p-5 bg-blue-50 text-blue-600 rounded-[28px]"><Gift size={32} /></div>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-4 py-2 bg-blue-50 rounded-full">Recompensa</span>
               </div>
               <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">Indique & Lucre</h3>
               <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed mb-10">Receba <strong>1 mês grátis</strong> creditado automaticamente em sua conta para cada ativação de plano PRO que vier através do seu link.</p>
            </div>
            <div className="space-y-4">
               <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 flex items-center justify-between gap-4 overflow-hidden shadow-inner">
                  <span className="text-[11px] font-black text-slate-400 truncate uppercase tracking-widest">{referralLink}</span>
                  <button onClick={handleCopy} className={`p-4 rounded-2xl transition-all flex items-center gap-2 flex-shrink-0 ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 hover:text-blue-600 shadow-sm'}`}>
                     {copied ? <Check size={20}/> : <Copy size={20}/>}
                  </button>
               </div>
               <button className="w-full py-6 bg-blue-600 text-white rounded-[28px] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-4 hover:bg-blue-700 transition-all">Compartilhar Link <Share2 size={18}/></button>
            </div>
         </div>

         <div className="bg-[#020617] p-8 md:p-12 rounded-[48px] border border-white/5 shadow-2xl flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 text-white rotate-12"><Trophy size={180}/></div>
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-10">
                  <div className="p-5 bg-indigo-500/20 text-indigo-400 rounded-[28px]"><Star size={32} fill="currentColor" /></div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-4 py-2 bg-indigo-500/10 rounded-full">Status VIP</span>
               </div>
               <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase mb-4">Upgrade Master</h3>
               <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed mb-10">Torne-se uma lenda no ecossistema. Desbloqueie a <strong>IA Master Vitalícia</strong> e suporte direto ao atingir 10 convites ativos.</p>
            </div>
            <div className="relative z-10 space-y-6">
               <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Seu Progresso VIP</span>
                  <span className="text-sm font-black font-mono text-indigo-400">0/10</span>
               </div>
               <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5"><div className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 w-[5%]"></div></div>
               <div className="flex items-center gap-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest"><ShieldCheck size={16}/> + 1.200 Estrategistas ativos no Brasil</div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ReferralView;
