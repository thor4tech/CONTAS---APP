
import React, { useState } from 'react';
import { Category } from '../types';
import { X, Plus, Trash2, Save, Palette, Edit2, Hash } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveCategories: (categories: Category[]) => void;
}

const CategoryModal: React.FC<Props> = ({ isOpen, onClose, categories, onSaveCategories }) => {
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);

  if (!isOpen) return null;

  const handleAddCategory = () => {
    const newCat: Category = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nova Categoria',
      color: 'bg-slate-100 text-slate-700',
      icon: '📁'
    };
    setLocalCategories([...localCategories, newCat]);
  };

  const handleUpdate = (id: string, updates: Partial<Category>) => {
    setLocalCategories(localCategories.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleDelete = (id: string) => {
    if (confirm("Excluir categoria? Transações existentes podem perder a formatação.")) {
      setLocalCategories(localCategories.filter(c => c.id !== id));
    }
  };

  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-rose-100 text-rose-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-sky-100 text-sky-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
    'bg-slate-100 text-slate-700',
    'bg-purple-100 text-purple-700',
    'bg-orange-100 text-orange-700'
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-4xl border border-white/20 transform animate-in zoom-in-95 duration-300">
        <div className="p-8 md:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                <Palette size={24} />
             </div>
             <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">Personalizar Categorias</h3>
                <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Identidade Visual do Fluxo</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-all text-slate-400"><X size={28} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-6 no-scrollbar bg-white">
          {localCategories.map((cat) => (
            <div key={cat.id} className="group relative bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:border-indigo-100">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                   <div className="relative group/icon">
                      <input 
                        type="text" 
                        value={cat.icon} 
                        onChange={e => handleUpdate(cat.id, { icon: e.target.value })}
                        className="w-14 h-14 bg-white border-2 border-slate-200 rounded-2xl text-center text-2xl shadow-sm focus:border-indigo-400 outline-none transition-all cursor-pointer"
                        title="Alterar Ícone (Emoji)"
                      />
                      <Edit2 size={12} className="absolute -bottom-1 -right-1 text-slate-400 bg-white rounded-full p-1 border border-slate-200 opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center gap-2 px-2 mb-1">
                         <Hash size={10} className="text-slate-300" />
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nome do Grupo</span>
                      </div>
                      <input 
                        type="text" 
                        value={cat.name} 
                        onChange={e => handleUpdate(cat.id, { name: e.target.value })}
                        className="w-full bg-transparent font-black text-slate-800 text-lg outline-none border-b-2 border-transparent focus:border-indigo-500 transition-all px-2"
                        placeholder="Nome da categoria"
                      />
                   </div>
                </div>
                
                <div className="flex-1 w-full">
                   <div className="px-2 mb-3">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Paleta de Cor</span>
                   </div>
                   <div className="flex flex-wrap gap-2">
                    {colors.map(color => (
                      <button 
                        key={color}
                        onClick={() => handleUpdate(cat.id, { color })}
                        className={`w-8 h-8 rounded-xl border-2 transition-all hover:scale-110 ${color.split(' ')[0]} ${cat.color === color ? 'border-indigo-600 scale-110 shadow-md' : 'border-white'}`}
                      />
                    ))}
                   </div>
                </div>

                <button 
                  onClick={() => handleDelete(cat.id)}
                  className="p-4 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 self-center"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={handleAddCategory}
            className="w-full py-8 border-4 border-dashed border-slate-100 rounded-[32px] text-slate-300 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-all">
               <Plus size={24} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em]">Adicionar Nova Categoria</span>
          </button>
        </div>

        <div className="p-8 md:p-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row gap-4 md:gap-6">
          <button 
            onClick={onClose}
            className="flex-1 py-5 font-black text-slate-400 uppercase text-[10px] tracking-[0.3em] hover:text-slate-600 transition-all"
          >
            Descartar
          </button>
          <button 
            onClick={() => { onSaveCategories(localCategories); onClose(); }}
            className="flex-[2] py-5 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-[24px] shadow-2xl flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Save size={20} /> Aplicar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
