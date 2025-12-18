
import React, { useState, useEffect } from 'react';
import { AssetMetadata, UserProfile } from '../types';
import { X, Plus, Trash2, Save, Landmark, CreditCard, Settings, User as UserIcon, Building2, Mail, Lock, Target } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  userEmail: string;
  onSaveProfile: (profile: any) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, userProfile, userEmail, onSaveProfile }) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'ativos'>('perfil');
  const [localName, setLocalName] = useState(userProfile.name);
  const [localCompany, setLocalCompany] = useState(userProfile.company);
  // Adicionando meta de faturamento ao perfil
  const [localMeta, setLocalMeta] = useState((userProfile as any).defaultMeta || 0);
  const [localAssets, setLocalAssets] = useState<AssetMetadata[]>(userProfile.globalAssets || []);

  useEffect(() => {
    if (isOpen) {
      setLocalAssets(userProfile.globalAssets || []);
      setLocalMeta((userProfile as any).defaultMeta || 0);
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

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
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Identidade e Estratégia</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-all text-slate-400"><X size={28} /></button>
        </div>

        <div className="flex border-b border-slate-100 bg-white">
           <button onClick={() => setActiveTab('perfil')} className={`flex-1 py-4 md:py-6 text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] border-b-4 transition-all ${activeTab === 'perfil' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Perfil & Metas</button>
           <button onClick={() => setActiveTab('ativos')} className={`flex-1 py-4 md:py-6 text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] border-b-4 transition-all ${activeTab === 'ativos' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Ativos Fiscais</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 bg-white">
          {activeTab === 'perfil' ? (
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
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block px-2 flex items-center gap-2"><Target size={14}/> Meta de Faturamento do Mês (R$)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-300 font-mono font-black">R$</span>
                    <input 
                      value={localMeta || ''} 
                      onChange={e => setLocalMeta(parseFloat(e.target.value) || 0)} 
                      type="number" 
                      className="w-full bg-indigo-50 border-2 border-indigo-100 rounded-[24px] pl-16 pr-8 py-5 focus:border-indigo-500 outline-none font-black text-indigo-700 text-xl font-mono tracking-tighter" 
                      placeholder="Ex: 30000" 
                    />
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-2">Essa meta será usada pela IA para calcular o ROI e Projeções.</p>
               </div>
            </div>
          ) : (
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
