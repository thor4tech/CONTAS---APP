
import React, { useState, useEffect } from 'react';
import { BaseTransaction, Category, Situation, Partner, SplitItem, TransactionFrequency } from '../types';
import { X, Save, Zap, Users, Layers, Plus, Trash2, AlertCircle, CalendarRange, Repeat, CheckCircle2, ArrowRight, CalendarX, Clock } from 'lucide-react';
import { addMonths, format } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactions: BaseTransaction[], originalTransaction?: BaseTransaction) => void;
  onDelete?: (id: string) => void;
  categories: Category[];
  partners?: Partner[];
  initialData?: BaseTransaction;
  defaultMonthRef: string;
  defaultType?: 'Receita' | 'Despesa';
}

const TransactionModal: React.FC<Props> = ({ isOpen, onClose, onSave, onDelete, categories, partners = [], initialData, defaultMonthRef, defaultType }) => {
  const getInitialState = () => ({
    id: Math.random().toString(36).substr(2, 9),
    description: '',
    value: 0,
    categoryId: categories[0]?.id || '',
    partnerId: '',
    // Fix: Usa format local para evitar UTC offset bugs na inicialização
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    competencyDate: format(new Date(), 'yyyy-MM-dd'),
    monthRef: defaultMonthRef,
    situation: 'PENDENTE' as Situation,
    type: defaultType || 'Despesa',
    paymentMethod: 'Pix',
    isRecurring: false,
    frequency: 'SINGLE' as TransactionFrequency,
    installmentTotal: 2,
    installmentNumber: 1,
    isSplit: false,
    splitItems: [] as SplitItem[]
  });

  const [formData, setFormData] = useState<BaseTransaction>(getInitialState());
  const [splitError, setSplitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ 
          ...initialData,
          competencyDate: initialData.competencyDate || initialData.dueDate,
          isSplit: initialData.isSplit || false,
          splitItems: initialData.splitItems || [],
          frequency: initialData.frequency || (initialData.isRecurring ? 'RECURRING' : 'SINGLE')
        });
      } else {
        // Lógica Inteligente de Data Padrão
        const today = new Date();
        let targetDateStr = format(today, 'yyyy-MM-dd');

        if (defaultMonthRef) {
           const [viewYearStr, viewMonthStr] = defaultMonthRef.split('-');
           const viewYear = parseInt(viewYearStr);
           const viewMonth = parseInt(viewMonthStr); // 1-12

           const currentYear = today.getFullYear();
           const currentMonth = today.getMonth() + 1; // 1-12

           if (viewYear !== currentYear || viewMonth !== currentMonth) {
              const safeDay = Math.min(today.getDate(), 28);
              targetDateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
           }
        }

        setFormData({
          ...getInitialState(),
          dueDate: targetDateStr,
          type: defaultType || 'Despesa',
          monthRef: defaultMonthRef
        });
      }
    }
  }, [isOpen, initialData, defaultMonthRef, defaultType]);

  const totalSplitValue = formData.splitItems?.reduce((acc, item) => acc + (item.value || 0), 0) || 0;
  const remainingValue = (formData.value || 0) - totalSplitValue;
  const isSplitValid = Math.abs(remainingValue) < 0.01;

  useEffect(() => {
    if (formData.isSplit && !isSplitValid) {
      setSplitError(`Faltam R$ ${remainingValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})} para fechar a conta.`);
    } else {
      setSplitError(null);
    }
  }, [formData.value, totalSplitValue, formData.isSplit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.isSplit && !isSplitValid) {
      alert("O valor total da transação não bate com a soma dos itens detalhados.");
      return;
    }

    const transactionsToSave: BaseTransaction[] = [];
    const groupId = initialData?.groupId || Math.random().toString(36).substr(2, 9);

    if (formData.frequency === 'INSTALLMENT' && !initialData) {
      const count = formData.installmentTotal || 2;
      const startDate = new Date(formData.dueDate + 'T12:00:00');

      for (let i = 0; i < count; i++) {
        const installmentDate = addMonths(startDate, i);
        const monthRefStr = format(installmentDate, 'yyyy-MM');
        
        transactionsToSave.push({
          ...formData,
          id: i === 0 ? formData.id : Math.random().toString(36).substr(2, 9),
          description: `${formData.description} (${i + 1}/${count})`,
          dueDate: format(installmentDate, 'yyyy-MM-dd'),
          monthRef: monthRefStr,
          situation: i === 0 ? formData.situation : 'AGENDADO',
          installmentNumber: i + 1,
          installmentTotal: count,
          groupId: groupId,
          isRecurring: false
        });
      }
    } else {
      const [y, m] = formData.dueDate.split('-');
      const correctMonthRef = `${y}-${m}`;

      transactionsToSave.push({
        ...formData,
        monthRef: correctMonthRef,
        isRecurring: formData.frequency === 'RECURRING',
        groupId: groupId
      });
    }

    // IMPORTANTE: Passamos initialData para o Dashboard saber se deve remover do mês antigo
    onSave(transactionsToSave, initialData);
    onClose();
  };

  const addSplitItem = () => {
    const newItem: SplitItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      value: remainingValue > 0 ? remainingValue : 0,
      partnerId: formData.partnerId
    };
    setFormData({
      ...formData,
      splitItems: [...(formData.splitItems || []), newItem]
    });
  };

  const removeSplitItem = (itemId: string) => {
    setFormData({
      ...formData,
      splitItems: formData.splitItems?.filter(i => i.id !== itemId) || []
    });
  };

  const updateSplitItem = (itemId: string, field: keyof SplitItem, value: any) => {
    setFormData({
      ...formData,
      splitItems: formData.splitItems?.map(i => i.id === itemId ? { ...i, [field]: value } : i) || []
    });
  };

  const handleDeleteSelf = () => {
    if (initialData && onDelete) {
       onDelete(initialData.id);
       onClose();
    }
  };

  const filteredPartners = partners.filter(p => 
    formData.type === 'Receita' ? p.type === 'Cliente' : p.type === 'Fornecedor'
  );
  const displayPartners = filteredPartners.length > 0 ? filteredPartners : partners;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] md:rounded-[48px] w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-4xl border border-slate-100 flex flex-col transform animate-in zoom-in-95 duration-300 no-scrollbar">
        
        <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-20">
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
                <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">
                   {formData.frequency === 'INSTALLMENT' ? 'Valor da Parcela (R$)' : 'Valor Total (R$)'}
                </label>
                <div className="relative group flex items-center bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 md:px-8 py-4 md:py-5 focus:within:ring-4 focus:within:ring-indigo-100 focus:within:bg-white transition-all">
                  <span className="text-slate-300 font-bold text-xl mr-4 font-mono select-none">R$</span>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.value || ''}
                    onChange={e => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-transparent outline-none font-black text-2xl md:text-3xl text-indigo-700 font-mono tracking-tighter"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Classificação Macro</label>
                <select 
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 md:px-8 py-4 md:py-5 focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all outline-none font-bold text-slate-700 appearance-none shadow-inner"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                 <Users size={12} /> {formData.type === 'Receita' ? 'Pagador Principal' : 'Beneficiário Principal'}
              </label>
              <select 
                value={formData.partnerId || ''}
                onChange={e => setFormData({...formData, partnerId: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 md:px-8 py-4 md:py-5 focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all outline-none font-bold text-slate-700 appearance-none shadow-inner"
              >
                <option value="">Sem vínculo específico</option>
                {displayPartners.map(p => (
                  <option key={p.id} value={p.id}>{p.type === 'Cliente' ? '👤' : '💼'} {p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Data de Caixa (Banco)</label>
                <input 
                  type="date" 
                  value={formData.dueDate}
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 md:px-8 py-4 md:py-5 focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all outline-none font-bold text-slate-700"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Situação Atual</label>
                <div className="grid grid-cols-3 gap-2">
                   {[
                     { id: 'PENDENTE', label: '⏳ Pendente', color: 'bg-amber-50 text-amber-600 border-amber-200' },
                     { id: 'PAGO', label: '✅ Pago', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
                     { id: 'ATRASADO', label: '❌ Atrasado', color: 'bg-rose-50 text-rose-600 border-rose-200' }
                   ].map(st => (
                     <button
                       key={st.id}
                       type="button"
                       onClick={() => setFormData({...formData, situation: st.id as Situation})}
                       className={`py-3 rounded-2xl text-[9px] font-black uppercase transition-all border-2 ${formData.situation === st.id ? st.color + ' shadow-md scale-105' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                     >
                       {st.label}
                     </button>
                   ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Frequência do Lançamento</label>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, frequency: 'SINGLE', isRecurring: false})}
                    className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 ${formData.frequency === 'SINGLE' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                  >
                     <CheckCircle2 size={18} /> Único
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, frequency: 'INSTALLMENT', isRecurring: false})}
                    className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 ${formData.frequency === 'INSTALLMENT' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                  >
                     <CalendarRange size={18} /> Parcelado
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, frequency: 'RECURRING', isRecurring: true})}
                    className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 ${formData.frequency === 'RECURRING' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                  >
                     <Repeat size={18} /> Fixo Mensal
                  </button>
               </div>
               
               {formData.frequency === 'INSTALLMENT' && (
                 <div className="bg-indigo-50 p-6 rounded-[28px] border border-indigo-100 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="p-2 bg-indigo-200 text-indigo-700 rounded-lg"><CalendarRange size={16}/></div>
                       <h4 className="text-xs font-black text-indigo-800 uppercase tracking-wide">Configurar Parcelas</h4>
                    </div>
                    <div className="flex items-end gap-4">
                       <div className="flex-1 space-y-2">
                          <label className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Quantidade de vezes</label>
                          <div className="relative">
                             <input 
                               type="number" 
                               min="2"
                               max="120"
                               value={formData.installmentTotal || 2}
                               onChange={e => setFormData({...formData, installmentTotal: parseInt(e.target.value) || 2})}
                               onFocus={(e) => e.target.select()}
                               className="w-full bg-white border-2 border-indigo-100 rounded-xl px-4 py-3 text-indigo-900 font-black outline-none focus:border-indigo-400 text-lg"
                             />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300 font-bold text-xs">x</span>
                          </div>
                       </div>
                       <div className="flex-[2] pb-3 text-[10px] font-bold text-indigo-500 leading-relaxed">
                          Serão gerados {formData.installmentTotal} lançamentos.
                       </div>
                    </div>
                 </div>
               )}
            </div>
          </div>

          {/* Rodapé de Ações */}
          <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-slate-100 mt-4">
            {initialData && (
              <button 
                type="button"
                onClick={handleDeleteSelf}
                className="flex-1 py-5 px-10 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-3xl text-[12px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-2 border-rose-100 shadow-sm"
              >
                <Trash2 size={20} /> Apagar Conta
              </button>
            )}
            <button 
              type="button"
              onClick={onClose}
              className={`flex-1 py-5 px-10 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-3xl text-[12px] font-black uppercase tracking-widest transition-all ${initialData ? 'hidden md:block' : ''}`}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={formData.isSplit && !isSplitValid}
              className="flex-[2] py-5 px-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-3xl text-[12px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-95"
            >
              <Save size={22} /> {initialData ? 'Salvar Alterações' : 'Confirmar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
