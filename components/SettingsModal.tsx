
import React, { useState, useEffect } from 'react';
import { AssetMetadata, UserProfile } from '../types';
import { X, Plus, Trash2, Save, Landmark, CreditCard, Settings, User as UserIcon, Building2, Mail, Lock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  userEmail: string;
  onSaveProfile: (profile: UserProfile) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, userProfile, userEmail, onSaveProfile }) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'ativos'>('perfil');
  const [localName, setLocalName] = useState(userProfile.name);
  const [localCompany, setLocalCompany] = useState(userProfile.company);
  const [localAssets, setLocalAssets] = useState<AssetMetadata[]>(userProfile.globalAssets || []);

  // Sync state if userProfile updates while open
  useEffect(() => {
    if (isOpen) {
      setLocalAssets(userProfile.globalAssets || []);
    }
  }, [isOpen, userProfile.globalAssets]);

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

  const handleDelete = (id: string) => {
    setLocalAssets(localAssets.filter(a => a.id !== id));
  };

  const handleUpdateAsset = (id: string, name: string) => {
    setLocalAssets(localAssets.map(a => a.id === id ? { ...a, name } : a));
  };

  const handleSaveAll = () => {
    onSaveProfile({
      ...userProfile,
      name: localName,
      company: localCompany,
      globalAssets: localAssets
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[56px] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 text-white rounded-[24px] shadow-2xl shadow-indigo-200">
              <Settings size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Painel de Controle</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Configurações de Identidade e Ativos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-900 shadow-sm"><X size={28} /></button>
        </div>

        <div className="flex border-b border-slate-100 bg-white shadow-sm">
           <button onClick={() => setActiveTab('perfil')} className={`flex-1 py-6 text-[11px] font-black uppercase tracking-[0.3em] border-b-4 transition-all ${activeTab === 'perfil' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>Perfil & Login</button>
           <button onClick={() => setActiveTab('ativos')} className={`flex-1 py-6 text-[11px] font-black uppercase tracking-[0.3em] border-b-4 transition-all ${activeTab === 'ativos' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>Ativos Estratégicos</button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-white">
          {activeTab === 'perfil' ? (
            <div className="space-y-10 animate-in slide-in-from-left-4 duration-500">
               <div className="space-y-6">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block px-2">Identificação do Líder</label>
                  <div className="relative group">
                    <UserIcon size={22} className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input value={localName} onChange={e => setLocalName(e.target.value)} type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-[32px] pl-16 pr-10 py-5 focus:border-indigo-300 focus:bg-white outline-none font-bold text-slate-800 shadow-inner transition-all" placeholder="Nome do Administrador" />
                  </div>
                  <div className="relative group">
                    <Building2 size={22} className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input value={localCompany} onChange={e => setLocalCompany(e.target.value)} type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-[32px] pl-16 pr-10 py-5 focus:border-indigo-300 focus:bg-white outline-none font-bold text-slate-800 shadow-inner transition-all" placeholder="Empresa" />
                  </div>
               </div>

               <div className="space-y-5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block px-2">Credenciais de Acesso</label>
                  <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 space-y-5 shadow-inner">
                    <div className="flex items-center gap-5 text-slate-400">
                      <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100"><Mail size={18}/></div>
                      <span className="text-sm font-bold font-mono">{userEmail}</span>
                    </div>
                    <div className="flex items-center justify-between gap-5 text-slate-400">
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100"><Lock size={18} /></div>
                        <span className="text-sm font-bold tracking-tighter">••••••••••••</span>
                      </div>
                      <button type="button" className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Alterar Senha</button>
                    </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
              <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3"><Landmark size={20} className="text-indigo-500" /> Bancos & Carteiras</h4>
                  <button onClick={() => handleAddAsset('bank')} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Plus size={22} /></button>
                </div>
                <div className="grid grid-cols-1 gap-5">
                  {localAssets.filter(a => a.type === 'bank').map(asset => (
                    <div key={asset.id} className="flex items-center gap-5 bg-slate-50 p-6 rounded-[32px] border border-slate-100 hover:bg-white hover:border-indigo-200 transition-all group shadow-sm">
                       <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-100 text-2xl">{asset.icon}</div>
                       <input 
                        type="text" 
                        value={asset.name} 
                        onChange={e => handleUpdateAsset(asset.id, e.target.value)}
                        className="flex-1 bg-transparent font-black text-slate-800 outline-none text-base tracking-tight"
                       />
                       <button onClick={() => handleDelete(asset.id)} className="p-3 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={22}/></button>
                    </div>
                  ))}
                  {localAssets.filter(a => a.type === 'bank').length === 0 && (
                    <div className="py-12 border-2 border-dashed border-slate-100 rounded-[32px] flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum Banco Vinculado</span>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3"><CreditCard size={20} className="text-rose-500" /> Cartões de Crédito</h4>
                  <button onClick={() => handleAddAsset('card')} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Plus size={22} /></button>
                </div>
                <div className="grid grid-cols-1 gap-5">
                  {localAssets.filter(a => a.type === 'card').map(asset => (
                    <div key={asset.id} className="flex items-center gap-5 bg-slate-50 p-6 rounded-[32px] border border-slate-100 hover:bg-white hover:border-rose-200 transition-all group shadow-sm">
                       <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-100 text-2xl">{asset.icon}</div>
                       <input 
                        type="text" 
                        value={asset.name} 
                        onChange={e => handleUpdateAsset(asset.id, e.target.value)}
                        className="flex-1 bg-transparent font-black text-slate-800 outline-none text-base tracking-tight"
                       />
                       <button onClick={() => handleDelete(asset.id)} className="p-3 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={22}/></button>
                    </div>
                  ))}
                  {localAssets.filter(a => a.type === 'card').length === 0 && (
                    <div className="py-12 border-2 border-dashed border-slate-100 rounded-[32px] flex items-center justify-center">
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum Cartão Vinculado</span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="p-12 bg-slate-50 border-t border-slate-100 flex gap-6">
          <button onClick={onClose} className="flex-1 py-6 font-black text-slate-400 uppercase text-[11px] tracking-[0.3em] hover:bg-white hover:text-slate-600 rounded-[28px] transition-all">Descartar</button>
          <button onClick={handleSaveAll} className="flex-2 py-6 bg-indigo-600 text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-[28px] shadow-[0_25px_50px_-12px_rgba(79,70,229,0.5)] flex items-center justify-center gap-4 hover:bg-indigo-700 transition-all active:scale-95"><Save size={22}/> Salvar & Consolidar Ativos</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
