
import React, { useState } from 'react';
import { Partner } from '../types';
import { User, Phone, Plus, Trash2, Search, Briefcase, UserCheck, Edit2, ShieldCheck, Users, X, Save } from 'lucide-react';

interface Props {
  partners: Partner[];
  onAdd: (partner: Partner) => void;
  onDelete: (id: string) => void;
  onUpdate: (partner: Partner) => void;
}

const PartnerManager: React.FC<Props> = ({ partners, onAdd, onDelete, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'Cliente' | 'Fornecedor'>('Cliente');
  const [phone, setPhone] = useState('');

  const filtered = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingPartner(null);
    setName('');
    setType('Cliente');
    setPhone('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Partner) => {
    setEditingPartner(p);
    setName(p.name);
    setType(p.type);
    setPhone(p.phone || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPartner) {
      onUpdate({
        ...editingPartner,
        name,
        type,
        phone
      });
    } else {
      onAdd({
        id: Math.random().toString(36).substr(2, 9),
        name,
        type,
        phone
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search and Add Bar */}
      <div className="flex flex-wrap gap-6 justify-between items-center bg-white p-8 rounded-[48px] border border-slate-200 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
        <div className="flex items-center gap-6 bg-slate-50 px-8 py-5 rounded-[28px] border border-slate-100 flex-1 max-w-2xl shadow-inner focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
          <Search size={24} className="text-slate-300" />
          <input 
            type="text" 
            placeholder="Pesquisar contatos..." 
            className="bg-transparent border-none outline-none w-full text-base font-black placeholder:text-slate-300 tracking-tight"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-4 px-10 py-5 bg-indigo-600 text-white rounded-[28px] text-[12px] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={20} /> ADICIONAR PARCEIRO
        </button>
      </div>

      {/* Grid of Partner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filtered.map(partner => (
          <div key={partner.id} className="bg-white p-8 rounded-[48px] border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[320px]">
            <div className={`absolute -top-10 -right-10 p-10 opacity-[0.03] scale-150 rotate-12 transition-transform duration-1000 group-hover:rotate-45`}>
              {partner.type === 'Cliente' ? <UserCheck size={140} /> : <Briefcase size={140} />}
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-[24px] ${partner.type === 'Cliente' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'} shadow-inner`}>
                  {partner.type === 'Cliente' ? <User size={28} /> : <Briefcase size={28} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${partner.type === 'Cliente' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {partner.type}
                </span>
              </div>
              
              <div className="mb-8">
                <h4 className="text-lg font-black text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{partner.name}</h4>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                   <ShieldCheck size={12} className="text-indigo-300" /> ID: {partner.id.toUpperCase()}
                </div>
              </div>

              {partner.phone && (
                <div className="flex items-center gap-3 text-xs font-black text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 group-hover:bg-white transition-all">
                  <Phone size={14} className="text-indigo-400" /> {partner.phone}
                </div>
              )}
            </div>

            <div className="flex gap-3 relative z-10 mt-auto">
              <button 
                onClick={() => openEditModal(partner)}
                className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-[22px] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
              >
                Editar
              </button>
              <button 
                onClick={() => onDelete(partner.id)}
                className="p-4 bg-rose-50 text-rose-300 hover:text-rose-600 rounded-[22px] transition-all border border-rose-50 hover:border-rose-100"
                title="Excluir Registro"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[48px] border-4 border-dashed border-slate-100 flex flex-col items-center gap-6">
             <div className="p-6 bg-slate-50 rounded-full text-slate-200">
                <Users size={64} strokeWidth={1}/>
             </div>
             <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.4em]">Nenhum registro encontrado</p>
          </div>
        )}
      </div>

      {/* Partner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-lg shadow-[0_32px_120px_-20px_rgba(0,0,0,0.4)] border border-white/20 overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                  {editingPartner ? <Edit2 size={24} /> : <Plus size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter">
                    {editingPartner ? 'Editar Parceiro' : 'Novo Parceiro'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cadastro de Contatos</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-900 shadow-none hover:shadow-lg"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">Nome Completo / Razão Social</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-200 outline-none font-bold text-slate-800 transition-all shadow-inner"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: João da Silva ME"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">Tipo de Vínculo</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setType('Cliente')}
                    className={`flex items-center justify-center gap-3 py-4 rounded-3xl text-[11px] font-black uppercase tracking-widest border-2 transition-all ${type === 'Cliente' ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white'}`}
                  >
                    <User size={18} /> Cliente
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType('Fornecedor')}
                    className={`flex items-center justify-center gap-3 py-4 rounded-3xl text-[11px] font-black uppercase tracking-widest border-2 transition-all ${type === 'Fornecedor' ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white'}`}
                  >
                    <Briefcase size={18} /> Fornecedor
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">Telefone de Contato</label>
                <div className="relative">
                  <Phone size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="tel" 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl pl-16 pr-6 py-4 focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-200 outline-none font-bold text-slate-800 transition-all shadow-inner"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3"
                >
                  <Save size={20} /> Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerManager;
