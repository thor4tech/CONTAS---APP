
import React, { useState } from 'react';
import { Category } from '../types';
import { X, Plus, Trash2, Save, Palette } from 'lucide-react';

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
    'bg-slate-100 text-slate-700'
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-[40px] w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Gerenciar Categorias</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Personalize seus marcadores</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {localCategories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <input 
                type="text" 
                value={cat.icon} 
                onChange={e => handleUpdate(cat.id, { icon: e.target.value })}
                className="w-10 h-10 bg-white border border-slate-200 rounded-xl text-center text-lg shadow-sm"
              />
              <div className="flex-1">
                <input 
                  type="text" 
                  value={cat.name} 
                  onChange={e => handleUpdate(cat.id, { name: e.target.value })}
                  className="w-full bg-transparent font-bold text-slate-700 outline-none border-b border-transparent focus:border-emerald-500"
                />
                <div className="flex gap-1.5 mt-2">
                  {colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => handleUpdate(cat.id, { color })}
                      className={`w-5 h-5 rounded-full border-2 ${color.split(' ')[0]} ${cat.color === color ? 'border-slate-800' : 'border-white'}`}
                    />
                  ))}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(cat.id)}
                className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button 
            onClick={handleAddCategory}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Adicionar Nova Categoria
          </button>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
          >
            Descartar
          </button>
          <button 
            onClick={() => { onSaveCategories(localCategories); onClose(); }}
            className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
