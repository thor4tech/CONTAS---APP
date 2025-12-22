
import React, { useState, useEffect } from 'react';
import { AssetMetadata, UserProfile, PlanId, Category } from '../types';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { X, Plus, Trash2, Save, Landmark, CreditCard, Settings, User as UserIcon, Building2, Target, Crown, ShieldCheck, Zap, ExternalLink, Star, TestTube2, CheckCircle2, AlertCircle, Loader2, LogOut, Palette, Hash, Edit2, LayoutGrid, CreditCard as CardIcon, Rocket, ArrowRight } from 'lucide-react';
import { testWebhookIntegration, KIWIFY_LINKS, TEST_EMAILS } from '../lib/subscription';
import { DEFAULT_CATEGORIES } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  userEmail: string;
  onSaveProfile: (profile: any) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, userProfile, userEmail, onSaveProfile }) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'ativos' | 'classificacao' | 'planos'>('perfil');
  const [localName, setLocalName] = useState(userProfile.name);
  const [localCompany, setLocalCompany] = useState(userProfile.company);
  const [localMeta, setLocalMeta] = useState(userProfile.defaultMeta || 0);
  const [localAssets, setLocalAssets] = useState<AssetMetadata[]>(userProfile.globalAssets || []);
  const [localCategories, setLocalCategories] = useState<Category[]>(userProfile.customCategories || DEFAULT_CATEGORIES);
  
  const [webhookTesting, setWebhookTesting] = useState<PlanId | null>(null);
  const [webhookResult, setWebhookResult] = useState<{[key in PlanId]?: 'success' | 'error'}>({});

  const safeUserEmail = (userEmail || '').toLowerCase();
  const isTester = TEST_EMAILS.includes(safeUserEmail);

  useEffect(() => {
    if (isOpen) {
      setLocalAssets(userProfile.globalAssets || []);
      setLocalCategories(userProfile.customCategories || DEFAULT_CATEGORIES);
      setLocalMeta(userProfile.defaultMeta || 0);
      setLocalName(userProfile.name);
      setLocalCompany(userProfile.company);
      setWebhookResult({});
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleTestWebhook = async (plan: PlanId) => {
    setWebhookTesting(plan);
    const success = await testWebhookIntegration(safeUserEmail, plan);
    if (success) {
      setWebhookResult(prev => ({ ...prev, [plan]: 'success' }));
      onSaveProfile({ ...userProfile, planId: plan, subscriptionStatus: 'ACTIVE' });
      setTimeout(() => setWebhookResult(prev => ({ ...prev, [plan]: undefined })), 5000);
    } else {
      setWebhookResult(prev => ({ ...prev, [plan]: 'error' }));
    }
    setWebhookTesting(null);
  };

  const handleAddCategory = () => {
    const newCat: Category = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nova Categoria',
      color: 'bg-slate-100 text-slate-700',
      icon: '📁'
    };
    setLocalCategories([...localCategories, newCat]);
  };

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    setLocalCategories(localCategories.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleSaveAll = () => {
    onSaveProfile({
      ...userProfile,
      name: localName,
      company: localCompany,
      defaultMeta: localMeta,
      globalAssets: localAssets,
      customCategories: localCategories
    });
    onClose();
  };

  const colors = [
    'bg-blue-100 text-blue-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700', 'bg-sky-100 text-sky-700', 'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700', 'bg-slate-100 text-slate-700', 'bg-purple-100 text-purple-700',
    'bg-orange-100 text-orange-700'
  ];

  const menuItems = [
    { id: 'perfil', label: 'Perfil & Meta', icon: UserIcon },
    { id: 'ativos', label: 'Bancos e Cartões', icon: CreditCard },
    { id: 'classificacao', label: 'Classificação', icon: LayoutGrid },
    { id: 'planos', label: 'Assinatura', icon: Crown },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white md:rounded-[48px] w-full max-w-5xl h-full md:h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.3)] border border-white/10">
        
        {/* Sidebar */}
        <div className="bg-slate-50 md:w-72 flex flex-col border-b md:border-b-0 md:border-r border-slate-200">
          <div className="p-6 md:p-10 flex justify-between items-center md:block">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg">
                <Settings size={20} />
              </div>
              <span className="text-sm font-black text-slate-900 uppercase tracking-widest hidden md:inline-block">Configurações</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full md:hidden text-slate-400"><X size={24}/></button>
          </div>

          <div className="flex md:flex-col overflow-x-auto md:overflow-visible no-scrollbar px-4 md:px-6 pb-4 md:pb-6 gap-2 md:gap-3 md:flex-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-3 px-4 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 md:w-full md:justify-start
                  ${activeTab === item.id 
                    ? 'bg-white text-indigo-600 shadow-lg ring-1 ring-indigo-50' 
                    : 'text-slate-400 hover:bg-white/50 hover:text-slate-600'
                  }`}
              >
                <item.icon size={18} className={activeTab === item.id ? 'text-indigo-500' : 'text-slate-300'} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="p-6 hidden md:block">
             <button onClick={onClose} className="w-full py-4 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-slate-200 rounded-xl">
               <X size={16}/> Fechar
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-white h-full overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 no-scrollbar pb-40 md:pb-32">
            {activeTab === 'perfil' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto md:mx-0">
                 <div className="md:hidden flex items-center gap-2 mb-6 text-indigo-600">
                    <UserIcon size={20}/> <h3 className="text-lg font-black uppercase tracking-tighter">Perfil</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-2">Dados da Liderança</label>
                      <div className="relative group">
                        <UserIcon size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <input value={localName} onChange={e => setLocalName(e.target.value)} type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] pl-16 pr-8 py-4 focus:bg-white focus:border-indigo-300 outline-none font-bold text-slate-800 transition-all" placeholder="Nome Completo" />
                      </div>
                      <div className="relative group">
                        <Building2 size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <input value={localCompany} onChange={e => setLocalCompany(e.target.value)} type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] pl-16 pr-8 py-4 focus:bg-white focus:border-indigo-300 outline-none font-bold text-slate-800 transition-all" placeholder="Empresa" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block px-2 flex items-center gap-2"><Target size={14}/> Meta Faturamento (R$)</label>
                      <div className="relative group">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-300 font-mono font-black group-focus-within:text-indigo-600 transition-colors">R$</span>
                        <input value={localMeta || ''} onChange={e => setLocalMeta(parseFloat(e.target.value) || 0)} type="number" className="w-full bg-indigo-50 border-2 border-indigo-100 rounded-[24px] pl-16 pr-8 py-5 focus:bg-white focus:border-indigo-500 outline-none font-black text-indigo-700 text-xl font-mono tracking-tighter transition-all" placeholder="Ex: 30000" />
                      </div>
                    </div>
                 </div>
                 <div className="pt-8 border-t border-slate-100"><button onClick={() => signOut(auth)} className="w-full py-4 flex items-center justify-center gap-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.3em] border border-rose-100 shadow-sm"><LogOut size={18} /> Encerrar Sessão</button></div>
              </div>
            )}

            {activeTab === 'ativos' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="md:hidden flex items-center gap-2 mb-6 text-indigo-600">
                    <CreditCard size={20}/> <h3 className="text-lg font-black uppercase tracking-tighter">Ativos</h3>
                </div>
                <section className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2"><Landmark size={18} className="text-indigo-500" /> Bancos</h4>
                    <button onClick={() => { setLocalAssets([...localAssets, { id: Math.random().toString(36).substr(2, 9), name: 'Novo Banco', type: 'bank', icon: '🏦' }]) }} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"><Plus size={20} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {localAssets.filter(a => a.type === 'bank').map(asset => (
                      <div key={asset.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-[24px] border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
                         <input type="text" value={asset.name} onChange={e => setLocalAssets(localAssets.map(a => a.id === asset.id ? { ...a, name: e.target.value } : a))} className="flex-1 bg-transparent font-black text-slate-800 outline-none text-sm" />
                         <button onClick={() => setLocalAssets(localAssets.filter(a => a.id !== asset.id))} className="p-2 text-rose-300 hover:text-rose-600 transition-colors"><Trash2 size={18}/></button>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2"><CardIcon size={18} className="text-rose-500" /> Cartões</h4>
                    <button onClick={() => { setLocalAssets([...localAssets, { id: Math.random().toString(36).substr(2, 9), name: 'Novo Cartão', type: 'card', icon: '💳' }]) }} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"><Plus size={20} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {localAssets.filter(a => a.type === 'card').map(asset => (
                      <div key={asset.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-[24px] border border-slate-100 focus-within:ring-2 focus-within:ring-rose-100 focus-within:bg-white transition-all">
                         <input type="text" value={asset.name} onChange={e => setLocalAssets(localAssets.map(a => a.id === asset.id ? { ...a, name: e.target.value } : a))} className="flex-1 bg-transparent font-black text-slate-800 outline-none text-sm" />
                         <button onClick={() => setLocalAssets(localAssets.filter(a => a.id !== asset.id))} className="p-2 text-rose-300 hover:text-rose-600 transition-colors"><Trash2 size={18}/></button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'classificacao' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex items-center justify-between px-2 sticky top-0 bg-white/95 backdrop-blur-sm py-3 z-10 border-b border-slate-100 md:border-none">
                    <div className="flex items-center gap-2 text-indigo-600 md:text-slate-900">
                       <LayoutGrid size={20} className="md:hidden"/>
                       <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Categorias</h4>
                    </div>
                    <button onClick={handleAddCategory} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest"><Plus size={16}/> <span className="hidden md:inline">Nova Categoria</span></button>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    {localCategories.map(cat => (
                      <div key={cat.id} className="bg-slate-50 p-5 md:p-6 rounded-[32px] border border-slate-100 space-y-6 group hover:bg-white hover:shadow-xl hover:ring-2 hover:ring-indigo-100 transition-all">
                         <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="flex items-center gap-4 flex-1 w-full">
                               <div className="relative group/icon flex-shrink-0">
                                  <input value={cat.icon} onChange={e => handleUpdateCategory(cat.id, {icon: e.target.value})} className="w-14 h-14 bg-white border-2 border-slate-200 rounded-2xl text-center text-2xl shadow-sm outline-none cursor-pointer focus:border-indigo-400 transition-all" />
                                  <Edit2 size={12} className="absolute -bottom-1 -right-1 p-1 bg-white border border-slate-200 rounded-full text-slate-400 opacity-0 group-hover/icon:opacity-100 pointer-events-none" />
                               </div>
                               <div className="flex-1">
                                  <div className="flex items-center gap-1 mb-1 px-1">
                                     <Hash size={10} className="text-slate-300"/>
                                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nome</span>
                                  </div>
                                  <input value={cat.name} onChange={e => handleUpdateCategory(cat.id, {name: e.target.value})} className="w-full bg-transparent font-black text-slate-800 text-lg outline-none border-b-2 border-transparent focus:border-indigo-500 transition-all" />
                               </div>
                            </div>
                            <div className="flex-1 w-full">
                               <div className="px-1 mb-3"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cor</span></div>
                               <div className="flex flex-wrap gap-2">
                                  {colors.map(c => (
                                    <button key={c} onClick={() => handleUpdateCategory(cat.id, {color: c})} className={`w-8 h-8 rounded-xl border-2 transition-all hover:scale-110 ${c.split(' ')[0]} ${cat.color === c ? 'border-indigo-600 scale-110 shadow-md ring-2 ring-offset-2 ring-indigo-100' : 'border-white'}`} />
                                  ))}
                                </div>
                            </div>
                            <button onClick={() => setLocalCategories(localCategories.filter(c => c.id !== cat.id))} className="p-4 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all self-end md:self-center"><Trash2 size={20}/></button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'planos' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="md:hidden flex items-center gap-2 mb-6 text-emerald-600">
                    <Crown size={20}/> <h3 className="text-lg font-black uppercase tracking-tighter">Assinatura</h3>
                 </div>
                 
                 <div className="p-8 bg-slate-900 rounded-[32px] text-white flex flex-col justify-between items-start gap-6 relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 w-full">
                       <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-2">Status da Conta</span>
                       <div className="flex items-center gap-3">
                          {userProfile.subscriptionStatus === 'ACTIVE' ? <ShieldCheck className="text-emerald-400" /> : <Crown className="text-indigo-400" />}
                          <h4 className="text-2xl font-black tracking-tighter uppercase">{userProfile.planId}</h4>
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${userProfile.subscriptionStatus === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-amber-500/10 border-amber-500/50 text-amber-400'}`}>{userProfile.subscriptionStatus === 'TRIAL' ? 'Teste Grátis' : userProfile.subscriptionStatus}</span>
                       </div>
                    </div>
                    {isTester && (
                      <div className="relative z-10 w-full p-6 bg-white/5 rounded-3xl border border-white/10 mt-4">
                        <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2"><TestTube2 size={14}/> Simulador de Ativação Kiwify (Modo Teste)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {(['ESSENTIAL', 'PRO', 'MASTER'] as PlanId[]).map(plan => (
                            <button key={plan} onClick={() => handleTestWebhook(plan)} disabled={webhookTesting !== null} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${webhookResult[plan] === 'success' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : webhookResult[plan] === 'error' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}>
                              {webhookTesting === plan ? <Loader2 className="w-3 h-3 animate-spin" /> : webhookResult[plan] === 'success' ? <CheckCircle2 size={14} /> : webhookResult[plan] === 'error' ? <AlertCircle size={14} /> : <Zap size={14} />}
                              {plan}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                 </div>

                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Planos de Upgrade</h4>
                    <div className="grid grid-cols-1 gap-4">
                      
                      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-lg hover:border-slate-300 transition-all">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Rocket size={20}/></div>
                               <div>
                                  <h3 className="text-base font-black text-slate-900 uppercase">Essencial</h3>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">Gestão de Fluxo Básica</p>
                               </div>
                            </div>
                            <span className="text-xl font-black font-mono text-slate-900">R$ 39,90</span>
                         </div>
                         <a href={KIWIFY_LINKS.ESSENTIAL} target="_blank" className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                            Escolher Plano <ArrowRight size={14}/>
                         </a>
                      </div>

                      <div className="relative bg-white p-6 rounded-[32px] border-2 border-indigo-600 shadow-xl shadow-indigo-100">
                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Star size={10} fill="white"/> Recomendado
                         </div>
                         <div className="flex justify-between items-start mb-4 mt-2">
                            <div className="flex items-center gap-3">
                               <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Zap size={20}/></div>
                               <div>
                                  <h3 className="text-base font-black text-slate-900 uppercase">Pro Estratégico</h3>
                                  <p className="text-[9px] font-bold text-indigo-400 uppercase">IA (3x/mês) + Saúde Líquida</p>
                               </div>
                            </div>
                            <span className="text-xl font-black font-mono text-indigo-600">R$ 69,90</span>
                         </div>
                         <a href={KIWIFY_LINKS.PRO} target="_blank" className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg">
                            Fazer Upgrade <ArrowRight size={14}/>
                         </a>
                      </div>

                      <div className="bg-slate-900 p-6 rounded-[32px] border border-slate-700 shadow-2xl text-white">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <div className="p-3 bg-white/10 rounded-2xl text-amber-400"><Crown size={20}/></div>
                               <div>
                                  <h3 className="text-base font-black text-white uppercase">Master Intelligence</h3>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">IA Ilimitada + Multi-Empresa</p>
                               </div>
                            </div>
                            <span className="text-xl font-black font-mono text-white">R$ 129,90</span>
                         </div>
                         <a href={KIWIFY_LINKS.MASTER} target="_blank" className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                            Desbloquear Tudo <ArrowRight size={14}/>
                         </a>
                      </div>

                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-6 md:p-10 bg-white border-t border-slate-100 flex gap-4 md:gap-6 absolute bottom-0 left-0 right-0 z-20">
            <button onClick={handleSaveAll} className="w-full py-5 bg-indigo-600 text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-[24px] shadow-2xl flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-95 transition-all"><Save size={20}/> Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
