
import React, { useState, useMemo } from 'react';
import { BaseTransaction, Category, Partner } from '../types';
import { Trash2, Plus, Edit3, Activity, TrendingUp, TrendingDown, GripVertical, Search, ArrowUpDown } from 'lucide-react';
import { FloatingInfo } from './FloatingInfo';
import { format } from 'date-fns';
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

  const getCategory = (id: string) => categories.find(c => c.id === id) || categories[0] || { name: 'S/ Cat', color: 'bg-slate-100 text-slate-400', icon: '❓' };
  
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

  return (
    <div className="bg-white rounded-[56px] shadow-4xl border border-slate-200 overflow-hidden flex flex-col h-full transition-all hover:shadow-5xl">
      <div className={`px-10 py-10 flex flex-col md:flex-row justify-between items-center ${color} gap-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-12 opacity-10 text-white rotate-12"><Activity size={100}/></div>
        
        <div className="flex items-center gap-5 relative z-10 text-white">
          <div className="w-14 h-14 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl">
            {isIncome ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
          </div>
          <div>
            <h3 className="font-black uppercase tracking-[0.3em] text-[14px] leading-tight">{title}</h3>
            <p className="text-white/60 text-[10px] font-bold uppercase mt-2 tracking-widest">{data.length} Lançamentos</p>
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
          <button onClick={onAddNew} className="w-14 h-14 bg-white text-[#020617] rounded-3xl shadow-4xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group flex-shrink-0">
            <Plus strokeWidth={3} className="w-8 h-8 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 w-10"></th>
              <th className="px-8 py-6 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => toggleSort('date')}>
                <div className="flex items-center gap-2">Data <ArrowUpDown size={10}/></div>
              </th>
              <th className="px-8 py-6 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => toggleSort('description')}>
                <div className="flex items-center gap-2">Descrição <ArrowUpDown size={10}/></div>
              </th>
              <th className="px-8 py-6 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => toggleSort('value')}>
                <div className="flex items-center gap-2">Valor Real <ArrowUpDown size={10}/></div>
              </th>
              <th className="px-8 py-6 text-center">Status</th>
              <th className="px-8 py-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredAndSortedData.map((item) => {
              const cat = getCategory(item.categoryId);
              return (
                <tr key={item.id} className="group hover:bg-indigo-50/20 transition-all cursor-default">
                  <td className="px-8 py-6 text-slate-200 group-hover:text-indigo-400 transition-colors"><GripVertical size={16} /></td>
                  <td className="px-8 py-6 text-[11px] font-black text-slate-500 font-mono tracking-tighter">{formatDateLabel(item.dueDate)}</td>
                  <td className="px-8 py-6">
                    <div className="text-[12px] font-black text-slate-900 truncate max-w-[200px] uppercase tracking-tight group-hover:text-indigo-600 transition-colors" title="Clique para editar detalhes" onClick={() => onEdit(item)}>
                      {item.description}
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest mt-2 border ${cat.color.replace('text-', 'border-').replace('700', '200')} ${cat.color.replace('text-', 'bg-').replace('700', '50')} ${cat.color}`}>
                      {cat.icon} {cat.name}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {editingValueId === item.id ? (
                      <input autoFocus type="number" step="0.01" className="w-24 bg-white border-2 border-indigo-200 rounded-xl px-3 py-1 font-mono font-black text-[12px] outline-none shadow-inner" value={localVal} onChange={e => setLocalVal(e.target.value)} onBlur={() => { onQuickUpdate(item.id, 'value', parseFloat(localVal) || 0); setEditingValueId(null); }} />
                    ) : (
                      <div 
                        onClick={() => { setEditingValueId(item.id); setLocalVal(item.value.toString()); }} 
                        className={`text-[13px] font-black font-mono tracking-tighter cursor-pointer px-3 py-1.5 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-sm transition-all flex items-center gap-2 group/value ${item.type === 'Receita' ? 'text-emerald-600' : 'text-slate-900'}`}
                      >
                        {formatValue(item.value || 0)}
                        <Edit3 size={10} className="opacity-0 group-hover/value:opacity-40 transition-opacity" />
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button onClick={() => onToggleStatus(item.id)} className={`px-4 py-2 rounded-full text-[9px] font-black border transition-all shadow-sm ${item.situation === 'PAGO' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'}`}>
                      {item.situation}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(item)} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-2xl transition-all"><Edit3 size={16} /></button>
                      <button onClick={() => onDelete(item.id)} className="p-3 bg-rose-50 text-rose-300 hover:text-rose-600 hover:bg-white hover:shadow-md rounded-2xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredAndSortedData.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
            <Activity size={48} className="text-slate-300" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Nenhum resultado para a busca</p>
          </div>
        )}
      </div>

      <div className="bg-slate-100/50 border-t border-slate-200 p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    <div className={`${bg} p-6 rounded-[32px] border border-slate-200 shadow-lg flex flex-col justify-between h-[150px] relative transition-all hover:shadow-xl`}>
       <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
             <FloatingInfo title={label} text={info} />
          </div>
          <div className={`text-xl font-black font-mono tracking-tighter ${color}`}>{formatValue(value)}</div>
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
