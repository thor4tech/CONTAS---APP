
import React, { useState, useEffect } from 'react';
import { BaseTransaction, Category, Situation, Partner, SplitItem, TransactionFrequency } from '../types';
import { X, Save, Zap, Users, Layers, Plus, Trash2, AlertCircle, CalendarRange, Repeat, CheckCircle2, ArrowRight } from 'lucide-react';
import { addMonths, format } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactions: BaseTransaction[]) => void;
  categories: Category[];
  partners?: Partner[];
  initialData?: BaseTransaction;
  defaultMonthRef: string;
  defaultType?: 'Receita' | 'Despesa';
}

const TransactionModal: React.FC<Props> = ({ isOpen, onClose, onSave, categories, partners = [], initialData, defaultMonthRef, defaultType }) => {
  const getInitialState = () => ({
    id: Math.random().toString(36).substr(2, 9),
    description: '',
    value: 0,
    categoryId: categories[0]?.id || '',
    partnerId: '',
    dueDate: new Date().toISOString().split('T')[0],
    competencyDate: new Date().toISOString().split('T')[0],
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
        setFormData({
          ...getInitialState(),
          type: defaultType || 'Despesa',
          monthRef: defaultMonthRef
        });
      }
    }
  }, [isOpen, initialData, defaultMonthRef, defaultType]);

  // Validação em tempo real do Split
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
      alert("O valor total da transação não bate com a soma dos itens detalhados. Ajuste os valores.");
      return;
    }

    const transactionsToSave: BaseTransaction[] = [];
    const groupId = initialData?.groupId || Math.random().toString(36).substr(2, 9);

    if (formData.frequency === 'INSTALLMENT' && !initialData) {
      // GERAÇÃO DE PARCELAS (Somente se for criação nova, edição trata apenas a parcela atual por enquanto)
      const count = formData.installmentTotal || 2;
      const baseValue = formData.value; // Valor de CADA parcela (comumente o usuário lança o valor da parcela, ou total? Assumindo valor da parcela aqui para simplificar UX de 'R$ 1000 em 5x')
      
      // UX Decision: O valor no input é o valor DA PARCELA.
      // Se quiser que seja o valor total dividido, teríamos que dividir aqui. 
      // Vamos manter: O valor digitado é o valor que impacta o mês (valor da parcela).
      
      const startDate = new Date(formData.dueDate + 'T00:00:00');

      for (let i = 0; i < count; i++) {
        const installmentDate = addMonths(startDate, i);
        const monthRefStr = `${installmentDate.getFullYear()}-${(installmentDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        transactionsToSave.push({
          ...formData,
          id: i === 0 ? formData.id : Math.random().toString(36).substr(2, 9), // Mantém ID na primeira
          description: `${formData.description} (${i + 1}/${count})`,
          dueDate: installmentDate.toISOString().split('T')[0],
          monthRef: monthRefStr,
          situation: i === 0 ? formData.situation : 'AGENDADO', // Futuras nascem agendadas
          installmentNumber: i + 1,
          installmentTotal: count,
          groupId: groupId,
          isRecurring: false
        });
      }
    } else {
      // Única ou Recorrente (Recorrente salva como única com flag, o sistema backend/job futuro cuidaria de clonar, ou clonamos mês a mês. 
      // Por simplicidade do MVP Frontend-only, Recorrente salva 1 item com a flag isRecurring true).
      transactionsToSave.push({
        ...formData,
        isRecurring: formData.frequency === 'RECURRING',
        groupId: groupId
      });
    }

    onSave(transactionsToSave);
    onClose();
  };

  // Funções do Motor de Split
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

  const filteredPartners = partners.filter(p => 
    formData.type === 'Receita' ? p.type === 'Cliente' : p.type === 'Fornecedor'
  );
  const displayPartners = filteredPartners.length > 0 ? filteredPartners : partners;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] md:rounded-[48px] w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-4xl border border-slate-100 flex flex-col transform animate-in zoom-in-95 duration-300">
        
        {/* Header */}
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
            
            {/* Campos Principais */}
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

            {/* SEÇÃO DE SPLIT (Motor da Etapa 2) */}
            <div className="bg-slate-50 rounded-[32px] border border-slate-200 overflow-hidden transition-all duration-500">
               <div className="p-6 md:p-8 flex items-center justify-between bg-white border-b border-slate-100">
                  <div className="flex items-center gap-4">
                     <div className={`p-2.5 rounded-xl ${formData.isSplit ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Layers size={20} />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Detalhamento (Split)</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Desmembrar valor em múltiplos itens</p>
                     </div>
                  </div>
                  <button 
                     type="button"
                     onClick={() => setFormData(prev => ({ ...prev, isSplit: !prev.isSplit, splitItems: !prev.isSplit && (!prev.splitItems || prev.splitItems.length === 0) ? [{ id: Math.random().toString(), description: 'Item 1', value: prev.value }] : prev.splitItems }))}
                     className={`relative w-14 h-8 rounded-full transition-all duration-300 ${formData.isSplit ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                     <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${formData.isSplit ? 'right-1' : 'left-1'}`}></div>
                  </button>
               </div>

               {formData.isSplit && (
                 <div className="p-6 md:p-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-slate-100 rounded-2xl p-4 flex flex-col gap-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-500">Total Validado:</span>
                          <span className={isSplitValid ? 'text-emerald-600' : 'text-rose-500'}>
                             {totalSplitValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} / {formData.value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                          </span>
                       </div>
                       <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${isSplitValid ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                            style={{ width: `${Math.min((totalSplitValue / (formData.value || 1)) * 100, 100)}%` }}
                          ></div>
                       </div>
                       {!isSplitValid && (
                         <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
                            <AlertCircle size={12} /> {splitError || "Os valores não batem."}
                         </div>
                       )}
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                       {(formData.splitItems || []).map((item, idx) => (
                         <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4 items-start md:items-center relative group">
                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex-1 w-full">
                               <input 
                                 type="text" 
                                 placeholder={`Item ${idx + 1}`}
                                 value={item.description}
                                 onChange={e => updateSplitItem(item.id, 'description', e.target.value)}
                                 className="w-full text-sm font-bold text-slate-700 placeholder:text-slate-300 outline-none bg-transparent border-b border-transparent focus:border-indigo-200 transition-all"
                               />
                            </div>
                            <div className="w-full md:w-32">
                               <select 
                                  value={item.partnerId || ''}
                                  onChange={e => updateSplitItem(item.id, 'partnerId', e.target.value)}
                                  className="w-full text-[10px] font-bold text-slate-500 bg-slate-50 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-100"
                               >
                                  <option value="">Principal</option>
                                  {displayPartners.map(p => (
                                    <option key={p.id} value={p.id}>{p.name.split(' ')[0]}</option>
                                  ))}
                               </select>
                            </div>
                            <div className="w-full md:w-32 relative">
                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">R$</span>
                               <input 
                                 type="number"
                                 step="0.01" 
                                 value={item.value}
                                 onChange={e => updateSplitItem(item.id, 'value', parseFloat(e.target.value) || 0)}
                                 className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl text-sm font-mono font-black text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 text-right"
                               />
                            </div>
                            <button 
                              type="button"
                              onClick={() => removeSplitItem(item.id)}
                              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            >
                               <Trash2 size={16} />
                            </button>
                         </div>
                       ))}
                    </div>
                    <button 
                      type="button"
                      onClick={addSplitItem}
                      className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                    >
                       <Plus size={14} /> Adicionar Detalhe
                    </button>
                 </div>
               )}
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
                <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Status Inicial</label>
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

            {/* SEÇÃO DE FREQUÊNCIA / PARCELAMENTO (Etapa 3) */}
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
               
               {/* Detalhes do Parcelamento */}
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
                               className="w-full bg-white border-2 border-indigo-100 rounded-xl px-4 py-3 text-indigo-900 font-black outline-none focus:border-indigo-400 text-lg"
                             />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300 font-bold text-xs">x</span>
                          </div>
                       </div>
                       <div className="flex-[2] pb-3 text-[10px] font-bold text-indigo-500 leading-relaxed">
                          O sistema irá gerar <strong>{formData.installmentTotal} lançamentos</strong> futuros automaticamente, com vencimento a cada 30 dias.
                       </div>
                    </div>
                 </div>
               )}
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
              disabled={formData.isSplit && !isSplitValid}
              className="flex-1 py-5 px-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-3xl text-[12px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-95"
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
