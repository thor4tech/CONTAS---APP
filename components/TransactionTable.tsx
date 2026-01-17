
import React, { useState, useMemo } from 'react';
import { BaseTransaction, Category, Partner, Situation } from '../types';
import { Trash2, Plus, Edit3, Activity, TrendingUp, TrendingDown, GripVertical, Search, ArrowUpDown, Layers, AlertCircle, CalendarClock, CheckCircle2, Clock, Check, CalendarX } from 'lucide-react';
import { FloatingInfo } from './FloatingInfo';
import { format, isBefore, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface Props {
  title: string;
  color: string;
  data: BaseTransaction[];
  categories: Category[];
  partners: Partner[];
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (tx: BaseTransaction) => void;
  onAddNew: () => void;
  onQuickUpdate: (id: string, field: keyof BaseTransaction, value: any) => void;
  totals: any;
  onReorder?: (newData: BaseTransaction[]) => void;
  showValues?: boolean;
}

type SortField = 'date' | 'value' | 'description';
type SortOrder = 'asc' | 'desc';

const TransactionTable: React.FC<Props> = ({ title, color, data, categories, partners, onToggleStatus, onDelete, onEdit, onAddNew, onQuickUpdate, totals, onReorder, showValues = true }) => {
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [localVal, setLocalVal] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const getCategory = (id: string) => categories.find(c => c.id === id) || categories[0] || { name: 'S/ Cat', icon: '❓', color: 'bg-slate-100 text-slate-700' };
  
  const formatDateLabel = (dateStr: string) => { 
    try { 
      if (!dateStr) return '--/--'; 
      const date = new Date(dateStr + 'T00:00:00');
      return format(date, 'dd/MM', { locale: ptBR }); 
    } catch { return '--/--'; } 
  };

  const isIncome = title.includes("ENTRADAS");

  const filteredAndSortedData = useMemo(() => {
    let result = data.filter(item => 
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategory(item.categoryId).name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.dueDate.localeCompare(b.dueDate);
      } else if (sortField === 'value') {
        comparison = a.value - b.value;
      } else if (sortField === 'description') {
        comparison = a.description.localeCompare(b.description);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [data, searchTerm, sortField, sortOrder, categories]);

  const metrics = useMemo(() => {
    const total = data.reduce((acc, e) => acc + (e.value || 0), 0);
    const realizado = data.filter(e => e.situation === 'PAGO').reduce((acc, e) => acc + (e.value || 0), 0);
    const pendente = data.filter(e => e.situation !== 'PAGO').reduce((acc, e) => acc + (e.value || 0), 0);
    const taxa = total > 0 ? (realizado / total) * 100 : 0;
    return { total, realizado, pendente, taxa };
  }, [data]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const formatValue = (v: number) => showValues ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ ••••••';

  const checkStatus = (item: BaseTransaction) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = new Date(item.dueDate + 'T00:00:00');
    
    const isPaid = item.situation === 'PAGO';
    const isOverdueState = item.situation === 'ATRASADO';
    // Logic for auto-detecting overdue if pending
    const isAutoOverdue = !isPaid && isBefore(dueDate, today) && item.situation !== 'ATRASADO';
    const isOverdue = isOverdueState || isAutoOverdue;
    
    const isScheduled = item.situation === 'AGENDADO';

    return { isPaid, isOverdue, isScheduled };
  };

  const handleSaveValue = (id: string, e?: React.FormEvent) => {
    e?.preventDefault();
    onQuickUpdate(id, 'value', parseFloat(localVal) || 0);
    setEditingValueId(null);
  };

  const handleCycleStatus = (id: string, current: Situation) => {
    let next: Situation = 'PENDENTE';
    if (current === 'PENDENTE') next = 'PAGO';
    else if (current === 'PAGO') next = 'ATRASADO';
    else if (current === 'ATRASADO') next = 'PENDENTE';
    else next = 'PENDENTE';
    
    onQuickUpdate(id, 'situation', next);
  };

  return (
    <div className="bg-white rounded-[40px] md:rounded-[56px] shadow-4xl border border-slate-200 overflow-hidden flex flex-col h-full transition-all hover:shadow-5xl">
      {/* Header do Bloco */}
      <div className={`px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row justify-between items-center ${color} gap-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-12 opacity-10 text-white rotate-12"><Activity size={100}/></div>
        
        <div className="flex items-center gap-5 relative z-10 text-white w-full md:w-auto">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl shrink-0">
            {isIncome ? <TrendingUp size={24} className="md:w-7 md:h-7" /> : <TrendingDown size={24} className="md:w-7 md:h-7" />}
          </div>
          <div>
            <h3 className="font-black uppercase tracking-[0.3em] text-[12px] md:text-[14px] leading-tight">{title}</h3>
            <p className="text-white/60 text-[9px] md:text-[10px] font-bold uppercase mt-2 tracking-widest">{data.length} Lançamentos</p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center px-4 py-2 flex-1 md:w-64 transition-all focus-within:bg-white/20">
            <Search size={18} className="text-white/60 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-xs font-bold placeholder:text-white/40 w-full"
            />
          </div>
          <button onClick={onAddNew} className="w-12 h-12 md:w-14 md:h-14 bg-white text-[#020617] rounded-3xl shadow-4xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group flex-shrink-0">
            <Plus strokeWidth={3} className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>

      {/* MOBILE VIEW (CARDS) */}
      <div className="md:hidden flex flex-col gap-4 p-4 bg-slate-50 min-h-[300px]">
        {filteredAndSortedData.map((item) => {
           const cat = getCategory(item.categoryId);
           const { isPaid, isOverdue } = checkStatus(item);
           return (
             <div key={item.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md">
                {/* Indicador Lateral de Status */}
                <div className={`absolute top-0 right-0 w-2 h-full transition-colors ${isPaid ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-amber-400'}`}></div>
                
                {/* Top: Categoria e Ações Rápidas */}
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 ${cat.color.split(' ')[0]} ${cat.color.split(' ')[1]}`}>
                         {cat.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                         <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate pr-2">{item.description}</h4>
                         <span className="text-[10px] font-bold text-slate-400 uppercase">{cat.name}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-1 shrink-0 bg-slate-50 rounded-2xl p-1 border border-slate-100">
                      <button onClick={() => onEdit(item)} className="p-2 text-slate-400 hover:text-indigo-600 active:scale-90 transition-all"><Edit3 size={18}/></button>
                      <button onClick={() => onDelete(item.id)} className="p-2 text-rose-300 hover:text-rose-600 active:scale-90 transition-all"><Trash2 size={18}/></button>
                   </div>
                </div>

                {/* Valor Centralizado e Grande (Evita Overflow) */}
                <div className="px-1">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Valor da Operação</span>
                   {editingValueId === item.id ? (
                      <form onSubmit={(e) => handleSaveValue(item.id, e)} className="flex items-center gap-2 animate-in fade-in zoom-in">
                         <div className="bg-indigo-50/50 rounded-2xl px-4 py-2 flex items-center border-2 border-indigo-200 flex-1">
                            <span className="text-sm text-indigo-400 font-bold mr-1">R$</span>
                            <input 
                              autoFocus 
                              type="number" 
                              inputMode="decimal"
                              step="0.01" 
                              className="w-full bg-transparent outline-none font-black text-2xl text-indigo-600 font-mono" 
                              value={localVal} 
                              onChange={e => setLocalVal(e.target.value)} 
                              onFocus={(e) => e.target.select()}
                              onBlur={() => setTimeout(() => handleSaveValue(item.id), 200)}
                            />
                         </div>
                      </form>
                   ) : (
                      <div 
                        onClick={() => { setEditingValueId(item.id); setLocalVal(item.value.toString()); }}
                        className={`text-3xl font-black font-mono tracking-tighter cursor-pointer active:scale-95 transition-transform truncate pr-4 ${isPaid ? 'text-slate-400 line-through decoration-2' : isIncome ? 'text-emerald-600' : 'text-slate-900'}`}
                      >
                         {formatValue(item.value)}
                      </div>
                   )}
                </div>
                
                {/* Footer do Card: Data e Botão de Status (3 Estados) */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-1">
                   <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${isOverdue ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                         <CalendarClock size={14} />
                      </div>
                      <span className={`text-[12px] font-black font-mono ${isOverdue ? 'text-rose-500' : 'text-slate-500'}`}>{formatDateLabel(item.dueDate)}</span>
                   </div>
                   
                   <button 
                     onClick={() => handleCycleStatus(item.id, item.situation)} 
                     className={`px-4 py-2.5 rounded-full flex items-center gap-2 transition-all border-2 shadow-sm active:scale-95 ${
                       isPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 
                       item.situation === 'ATRASADO' ? 'bg-rose-50 border-rose-200 text-rose-600' : 
                       'bg-amber-50 border-amber-200 text-amber-600'
                     }`}
                   >
                      <span className="text-[10px] font-black uppercase tracking-widest">{isPaid ? 'PAGO' : item.situation === 'ATRASADO' ? 'ATRASADO' : 'PENDENTE'}</span>
                      {isPaid ? <CheckCircle2 size={16} /> : item.situation === 'ATRASADO' ? <CalendarX size={16} /> : <Clock size={16} />}
                   </button>
                </div>
             </div>
           );
        })}
        {filteredAndSortedData.length === 0 && (
          <div className="py-20 text-center opacity-30">
            <Activity size={32} className="text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-black uppercase">Vazio</p>
          </div>
        )}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block overflow-x-auto flex-1 no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px] table-fixed">
          <thead className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] border-b border-slate-100">
            <tr>
              <th className="px-6 py-6 w-14"></th>
              <th className="px-6 py-6 w-32 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => toggleSort('date')}>
                <div className="flex items-center gap-2">Data <ArrowUpDown size={10}/></div>
              </th>
              <th className="px-6 py-6 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => toggleSort('description')}>
                <div className="flex items-center gap-2">Descrição <ArrowUpDown size={10}/></div>
              </th>
              <th className="px-6 py-6 w-44 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => toggleSort('value')}>
                <div className="flex items-center gap-2">Valor <ArrowUpDown size={10}/></div>
              </th>
              <th className="px-6 py-6 w-40 text-center">Situação</th>
              <th className="px-6 py-6 w-32 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredAndSortedData.map((item) => {
              const cat = getCategory(item.categoryId);
              const { isPaid, isOverdue, isScheduled } = checkStatus(item);
              
              return (
                <tr key={item.id} className={`group transition-all cursor-default ${isOverdue ? 'bg-rose-50/30' : isScheduled ? 'opacity-70' : 'hover:bg-indigo-50/20'}`}>
                  <td className="px-6 py-5 text-slate-200 group-hover:text-indigo-400 transition-colors text-center"><GripVertical size={16} /></td>
                  <td className="px-6 py-5">
                     <div className={`flex items-center gap-2 text-[11px] font-black font-mono tracking-tighter ${isOverdue ? 'text-rose-500' : 'text-slate-500'}`}>
                        {formatDateLabel(item.dueDate)}
                        {isOverdue && <AlertCircle size={12} className="animate-pulse" />}
                     </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 truncate">
                       <div className={`text-[12px] font-black truncate max-w-[250px] uppercase tracking-tight group-hover:text-indigo-600 transition-colors ${isPaid ? 'text-slate-900 line-through decoration-slate-300 decoration-2' : 'text-slate-900'}`} title={item.description} onClick={() => onEdit(item)}>
                         {item.description}
                       </div>
                       {item.isSplit && (
                          <div className="p-1 bg-indigo-50 text-indigo-500 rounded-md shrink-0" title={`${item.splitItems?.length} itens detalhados`}>
                             <Layers size={10} />
                          </div>
                       )}
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest mt-2 border ${cat.color.replace('text-', 'border-').replace('700', '200')} ${cat.color.replace('text-', 'bg-').replace('700', '50')} ${cat.color}`}>
                      {cat.icon} {cat.name}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {editingValueId === item.id ? (
                      <form onSubmit={(e) => handleSaveValue(item.id, e)} className="flex items-center gap-2">
                        <input 
                          autoFocus 
                          type="number" 
                          step="0.01" 
                          className="w-28 bg-white border-2 border-indigo-200 rounded-xl px-3 py-1.5 font-mono font-black text-[12px] outline-none shadow-inner" 
                          value={localVal} 
                          onChange={e => setLocalVal(e.target.value)} 
                          onFocus={(e) => e.target.select()}
                          onBlur={() => setTimeout(() => handleSaveValue(item.id), 200)}
                        />
                        <button type="submit" className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"><Check size={14} strokeWidth={3}/></button>
                      </form>
                    ) : (
                      <div 
                        onClick={() => { setEditingValueId(item.id); setLocalVal(item.value.toString()); }} 
                        className={`text-[14px] font-black font-mono tracking-tighter cursor-pointer px-3 py-1.5 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-sm transition-all flex items-center gap-2 group/value w-fit ${isPaid ? 'text-slate-400' : item.type === 'Receita' ? 'text-emerald-600' : 'text-slate-900'}`}
                      >
                        {formatValue(item.value || 0)}
                        <Edit3 size={10} className="opacity-0 group-hover/value:opacity-40 transition-opacity" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => handleCycleStatus(item.id, item.situation)} 
                      className={`px-3 py-2 rounded-full text-[9px] font-black border transition-all shadow-sm flex items-center justify-center gap-1.5 w-full max-w-[120px] mx-auto active:scale-95
                        ${isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 
                          item.situation === 'ATRASADO' ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' :
                          'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'}
                      `}
                    >
                      {isPaid ? <CheckCircle2 size={12} /> : item.situation === 'ATRASADO' ? <CalendarX size={12} /> : <Clock size={12} />}
                      {isPaid ? 'PAGO' : item.situation === 'ATRASADO' ? 'ATRASADO' : 'PENDENTE'}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(item)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"><Edit3 size={16} /></button>
                      <button onClick={() => onDelete(item.id)} className="p-2.5 bg-rose-50 text-rose-300 hover:text-rose-600 hover:bg-white hover:shadow-md rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-100/50 border-t border-slate-200 p-6 md:p-10 space-y-6 md:space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
             <MetricaResumo label={isIncome ? "FATURAMENTO TOTAL" : "DÍVIDA TOTAL"} value={metrics.total} color="text-slate-900" bg="bg-white" sub="Total planejado" formatValue={formatValue} info={isIncome ? "A soma bruta de tudo o que você planejou faturar este mês." : "A soma de todos os seus compromissos financeiros planejados."} />
             <MetricaResumo label={isIncome ? "RECEBIDO ✓" : "PAGO ✓"} value={metrics.realizado} color="text-emerald-600" bg="bg-emerald-50/50" sub={`${metrics.taxa.toFixed(0)}% do total`} formatValue={formatValue} progress={metrics.taxa} info={isIncome ? "Valor que efetivamente entrou no caixa." : "Total das contas que já foram quitadas."} />
             <MetricaResumo label={isIncome ? "PENDENTE ⏳" : "RESTANTE"} value={metrics.pendente} color="text-amber-600" bg="bg-amber-50/50" sub={isIncome ? "A receber" : "A pagar"} formatValue={formatValue} info={isIncome ? "Dinheiro que você ainda está esperando cair na conta." : "O que você ainda precisa pagar para fechar o mês."} />
          </div>
      </div>
    </div>
  );
};

const MetricaResumo = ({ label, value, color, bg, sub, formatValue, progress, info }: any) => {
  return (
    <div className={`${bg} p-5 md:p-6 rounded-[32px] border border-slate-200 shadow-lg flex flex-col justify-between h-[130px] md:h-[150px] relative transition-all hover:shadow-xl`}>
       <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
             <FloatingInfo title={label} text={info} />
          </div>
          <div className={`text-lg md:text-xl font-black font-mono tracking-tighter ${color}`}>{formatValue(value)}</div>
       </div>
       <div className="mt-4">
          {progress !== undefined ? (
            <div className="space-y-2">
               <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
               </div>
               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{sub}</span>
            </div>
          ) : (
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{sub}</span>
          )}
       </div>
    </div>
  );
};

export default TransactionTable;
