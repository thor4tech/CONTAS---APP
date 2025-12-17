
import React, { useState, useEffect } from 'react';
import { BaseTransaction, Category, Situation } from '../types';
import { X, Save, Zap, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: BaseTransaction) => void;
  categories: Category[];
  initialData?: BaseTransaction;
  defaultMonthRef: string;
  defaultType?: 'Receita' | 'Despesa';
}

const TransactionModal: React.FC<Props> = ({ isOpen, onClose, onSave, categories, initialData, defaultMonthRef, defaultType }) => {
  const getInitialState = () => ({
    id: Math.random().toString(36).substr(2, 9),
    description: '',
    value: 0,
    categoryId: categories[0]?.id || '',
    dueDate: new Date().toISOString().split('T')[0],
    monthRef: defaultMonthRef,
    situation: 'PENDENTE' as Situation,
    type: defaultType || 'Despesa',
    paymentMethod: 'Pix',
    isRecurring: false
  });

  const [formData, setFormData] = useState<BaseTransaction>(getInitialState());

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          ...getInitialState(),
          type: defaultType || 'Despesa',
          monthRef: defaultMonthRef
        });
      }
    }
  }, [isOpen, initialData, defaultMonthRef, defaultType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] md:rounded-[48px] w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-4xl border border-slate-100 flex flex-col transform animate-in zoom-in-95 duration-300">
        <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
             <div className={`p-3 rounded-2xl ${formData.type === 'Receita' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <Zap size={24} />
             </div>
             <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter leading-none mb-1">
                  {initialData ? 'Ajustar Lançamento' : `Novo Fluxo ${formData.type}`}
                </h3>
                <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Controle de Fluxo Único</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8 md:space-y-10">
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Descrição da Operação</label>
              <input 
                required
                type="text" 
                placeholder="Ex: Recebimento Serviços Web"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 md:px-8 py-4 md:py-5 focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all outline-none font-bold text-slate-800 text-base md:text-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Valor da Operação (R$)</label>
                <div className="relative group flex items-center bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 md:px-8 py-4 md:py-5 focus-within:ring-4 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
                  <span className="text-slate-300 font-bold text-xl mr-4 font-mono select-none">R$</span>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.value || ''}
                    onChange={e => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                    className="w-full bg-transparent outline-none font-black text-2xl md:text-3xl text-indigo-700 font-mono tracking-tighter"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Classificação</label>
                <select 
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 md:px-8 py-4 md:py-5 focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all outline-none font-bold text-slate-700 appearance-none shadow-inner"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Vencimento / Realização</label>
                <input 
                  type="date" 
                  value={formData.dueDate}
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 md:px-8 py-4 md:py-5 focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all outline-none font-bold text-slate-700"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Status</label>
                <select 
                  value={formData.situation}
                  onChange={e => setFormData({...formData, situation: e.target.value as Situation})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 md:px-8 py-4 md:py-5 focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all outline-none font-bold text-slate-700 appearance-none shadow-inner"
                >
                  <option value="PENDENTE">⏳ Aguardando</option>
                  <option value="PAGO">✅ Finalizado</option>
                  <option value="AGENDADO">📅 Agendado</option>
                </select>
              </div>
            </div>

            {/* Sugestão 2: Toggle de Recorrência */}
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
               <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${formData.isRecurring ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300'}`}>
                     <RefreshCw size={20} className={formData.isRecurring ? 'animate-spin-slow' : ''} />
                  </div>
                  <div>
                     <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Lançamento Fixo</span>
                     <p className="text-[9px] font-bold text-slate-400 uppercase">Repetir automaticamente todos os meses</p>
                  </div>
               </div>
               <button 
                 type="button" 
                 onClick={() => setFormData({...formData, isRecurring: !formData.isRecurring})}
                 className={`w-14 h-8 rounded-full relative transition-all ${formData.isRecurring ? 'bg-indigo-600' : 'bg-slate-200'}`}
               >
                 <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${formData.isRecurring ? 'right-1' : 'left-1'}`}></div>
               </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-5 px-10 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-3xl text-[12px] font-black uppercase tracking-widest transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 py-5 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl text-[12px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-95"
            >
              <Save size={22} /> {initialData ? 'Atualizar Dados' : 'Lançar no Histórico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
