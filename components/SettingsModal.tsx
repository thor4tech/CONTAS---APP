
import React, { useState, useEffect } from 'react';
import { AssetMetadata, UserProfile } from '../types';
import { X, Plus, Trash2, Save, Landmark, CreditCard, Settings, User as UserIcon, Building2, Target, Crown, ShieldCheck, Zap, ExternalLink, Star, TestTube2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { testWebhookIntegration, KIWIFY_LINKS } from '../lib/subscription';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  userEmail: string;
  onSaveProfile: (profile: any) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, userProfile, userEmail, onSaveProfile }) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'ativos' | 'planos'>('perfil');
  const [localName, setLocalName] = useState(userProfile.name);
  const [localCompany, setLocalCompany] = useState(userProfile.company);
  const [localMeta, setLocalMeta] = useState(userProfile.defaultMeta || 0);
  const [localAssets, setLocalAssets] = useState<AssetMetadata[]>(userProfile.globalAssets || []);
  
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookResult, setWebhookResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalAssets(userProfile.globalAssets || []);
      setLocalMeta(userProfile.defaultMeta || 0);
      setLocalName(userProfile.name);
      setLocalCompany(userProfile.company);
      setWebhookResult(null);
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleTestWebhook = async () => {
    setWebhookTesting(true);
    setWebhookResult(null);
    const success = await testWebhookIntegration(userEmail);
    setWebhookResult(success ? 'success' : 'error');
    setWebhookTesting(false);
    
    // Se o sinal foi enviado, agora cabe ao n8n atualizar o banco.
    // O onSnapshot no App.tsx cuidará de atualizar a UI assim que o dado mudar no Firestore.
    if (success) {
      setTimeout(() => setWebhookResult(null), 5000);
    }
  };

  const handleAddAsset = (type: 'bank' | 'card') => {
    const newAsset: AssetMetadata = {
      id: Math.random().toString(36).substr(2, 9),
      name: type === 'bank' ? 'Novo Banco' : 'Novo Cartão',
      type,
      icon: type === 'bank' ? '🏦' : '💳'
    };
    setLocalAssets([...localAssets, newAsset]);
  };

  const handleSaveAll = () => {
    onSaveProfile({
      ...userProfile,
      name: localName,
      company: localCompany,
      defaultMeta: localMeta,
      globalAssets: localAssets
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-slate-900/70 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] md:rounded-[56px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-4xl border border-white/20">
        <div className="p-8 md:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="p-3 md:p-4 bg-indigo-600 text-white rounded-[20px] md:rounded-[24px] shadow-2xl">
              <Settings size={28} />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">Painel de Controle</h3>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Identidade e Gestão</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-all text-slate-400"><X size={28} /></button>
        </div>

        <div className="flex border-b border-slate-100 bg-white">
           <button onClick={() => setActiveTab('perfil')} className={`flex-1 py-4 md:py-6 text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] border-b-4 transition-all ${activeTab === 'perfil' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Perfil</button>
           <button onClick={() => setActiveTab('ativos')} className={`flex-1 py-4 md:py-6 text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] border-b-4 transition-all ${activeTab === 'ativos' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Ativos</button>
           <button onClick={() => setActiveTab('planos')} className={`flex-1 py-4 md:py-6 text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] border-b-4 transition-all ${activeTab === 'planos' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'}`}>Assinatura</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 bg-white">
          {activeTab === 'perfil' && (
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-2">Dados da Liderança</label>
                  <div className="relative">
                    <UserIcon size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input value={localName} onChange={e => setLocalName(e.target.value)} type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] pl-16 pr-8 py-4 focus:border-indigo-300 outline-none font-bold text-slate-800" placeholder="Nome Completo" />
                  </div>
                  <div className="relative">
                    <Building2 size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input value={localCompany} onChange={e => setLocalCompany(e.target.value)} type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] pl-16 pr-8 py-4 focus:border-indigo-300 outline-none font-bold text-slate-800" placeholder="Empresa" />
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block px-2 flex items-center gap-2"><Target size={14}/> Meta Faturamento (R$)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-300 font-mono font-black">R$</span>
                    <input value={localMeta || ''} onChange={e => setLocalMeta(parseFloat(e.target.value) || 0)} type="number" className="w-full bg-indigo-50 border-2 border-indigo-100 rounded-[24px] pl-16 pr-8 py-5 focus:border-indigo-500 outline-none font-black text-indigo-700 text-xl font-mono tracking-tighter" placeholder="Ex: 30000" />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'ativos' && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2"><Landmark size={18} className="text-indigo-500" /> Bancos</h4>
                  <button onClick={() => handleAddAsset('bank')} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Plus size={20} /></button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {localAssets.filter(a => a.type === 'bank').map(asset => (
                    <div key={asset.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-[20px] border border-slate-100">
                       <input type="text" value={asset.name} onChange={e => setLocalAssets(localAssets.map(a => a.id === asset.id ? { ...a, name: e.target.value } : a))} className="flex-1 bg-transparent font-black text-slate-800 outline-none text-sm" />
                       <button onClick={() => setLocalAssets(localAssets.filter(a => a.id !== asset.id))} className="p-2 text-rose-300 hover:text-rose-600"><Trash2 size={18}/></button>
                    </div>
                  ))}
                </div>
              </section>
              <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2"><CreditCard size={18} className="text-rose-500" /> Cartões</h4>
                  <button onClick={() => handleAddAsset('card')} className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Plus size={20} /></button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {localAssets.filter(a => a.type === 'card').map(asset => (
                    <div key={asset.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-[20px] border border-slate-100">
                       <input type="text" value={asset.name} onChange={e => setLocalAssets(localAssets.map(a => a.id === asset.id ? { ...a, name: e.target.value } : a))} className="flex-1 bg-transparent font-black text-slate-800 outline-none text-sm" />
                       <button onClick={() => setLocalAssets(localAssets.filter(a => a.id !== asset.id))} className="p-2 text-rose-300 hover:text-rose-600"><Trash2 size={18}/></button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'planos' && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
               <div className="p-8 bg-slate-900 rounded-[32px] text-white flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                  <div className="relative z-10 w-full md:w-auto">
                     <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-2">Plano Atual</span>
                     <div className="flex items-center gap-3">
                        {userProfile.subscriptionStatus === 'ACTIVE' ? <ShieldCheck className="text-emerald-400" /> : <Crown className="text-indigo-400" />}
                        <h4 className="text-2xl font-black tracking-tighter uppercase">{userProfile.planId}</h4>
                     </div>
                     <span className={`text-[10px] font-black uppercase tracking-widest mt-2 block ${userProfile.subscriptionStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>Status: {userProfile.subscriptionStatus === 'TRIAL' ? 'Período de Teste' : userProfile.subscriptionStatus}</span>
                  </div>
                  
                  <div className="relative z-10 w-full md:w-auto">
                    <button 
                      onClick={handleTestWebhook}
                      disabled={webhookTesting}
                      className={`w-full md:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${webhookResult === 'success' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : webhookResult === 'error' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                    >
                      {webhookTesting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : webhookResult === 'success' ? (
                        <CheckCircle2 size={18} />
                      ) : webhookResult === 'error' ? (
                        <AlertCircle size={18} />
                      ) : (
                        <TestTube2 size={18} />
                      )}
                      {webhookResult === 'success' ? 'Sinal Real Enviado!' : webhookResult === 'error' ? 'Erro no Sinal' : 'Simular Compra Kiwify'}
                    </button>
                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-2 text-center md:text-right">Aguardando ativação pelo n8n...</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Opções de Upgrade</h4>
                  
                  <a href={KIWIFY_LINKS.ESSENTIAL} target="_blank" className="flex items-center justify-between p-6 bg-slate-50 rounded-[28px] border-2 border-transparent hover:border-indigo-600 transition-all group">
                     <div>
                        <span className="text-lg font-black text-slate-900 uppercase">Essencial</span>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Sair do caos financeiro</p>
                     </div>
                     <div className="text-right">
                        <span className="text-indigo-600 font-black font-mono block">R$ 39,90</span>
                        <ExternalLink size={14} className="ml-auto text-slate-300 mt-1" />
                     </div>
                  </a>

                  <a href={KIWIFY_LINKS.PRO} target="_blank" className="flex items-center justify-between p-6 bg-slate-50 rounded-[28px] border-2 border-indigo-600 transition-all group relative">
                     <div className="absolute top-0 right-10 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase flex items-center gap-1 shadow-xl"><Star size={10} fill="white"/> Destaque</div>
                     <div>
                        <span className="text-lg font-black text-slate-900 uppercase">Pro Estratégico</span>
                        <p className="text-[9px] font-bold text-indigo-400 uppercase mt-1">IA + Auditoria + Agenda</p>
                     </div>
                     <div className="text-right">
                        <span className="text-indigo-600 font-black font-mono block">R$ 69,90</span>
                        <ExternalLink size={14} className="ml-auto text-slate-300 mt-1" />
                     </div>
                  </a>

                  <a href={KIWIFY_LINKS.MASTER} target="_blank" className="flex items-center justify-between p-6 bg-slate-50 rounded-[28px] border-2 border-transparent hover:border-slate-900 transition-all group">
                     <div>
                        <span className="text-lg font-black text-slate-900 uppercase">Master Intelligence</span>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">IA Ilimitada + Multi-empresa</p>
                     </div>
                     <div className="text-right">
                        <span className="text-slate-900 font-black font-mono block">R$ 129,90</span>
                        <ExternalLink size={14} className="ml-auto text-slate-300 mt-1" />
                     </div>
                  </a>
               </div>
            </div>
          )}
        </div>

        <div className="p-8 md:p-12 bg-slate-50 border-t border-slate-100 flex gap-4 md:gap-6">
          <button onClick={onClose} className="flex-1 py-4 md:py-6 font-black text-slate-400 uppercase text-[10px] tracking-[0.3em]">Cancelar</button>
          <button onClick={handleSaveAll} className="flex-2 py-4 md:py-6 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-[24px] shadow-2xl flex items-center justify-center gap-3"><Save size={20}/> Salvar Configurações</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
