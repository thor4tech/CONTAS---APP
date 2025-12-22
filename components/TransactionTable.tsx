
import React, { useState, useMemo } from 'react';
import { BaseTransaction, Category, Partner } from '../types';
import { Trash2, Plus, Edit3, Activity, TrendingUp, TrendingDown, GripVertical, Info } from 'lucide-react';
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

const TransactionTable: React.FC<Props> = ({ title, color, data, categories, partners, onToggleStatus, onDelete, onEdit, onAddNew, onQuickUpdate, totals, onReorder, showValues = true }) => {
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [localVal, setLocalVal] = useState("");
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const getCategory = (id: string) => categories.find(c => c.id === id) || categories[0] || { name: 'S/ Cat', color: 'bg-slate-100 text-slate-400', icon: '❓' };
  const formatDateLabel = (dateStr: string) => { 
    try { 
      if (!dateStr) return '--/--'; 
      const date = new Date(dateStr + 'T00:00:00');
      return format(date, 'dd/MM', { locale: ptBR }); 
    } catch { return '--/--'; } 
  };

  const isIncome = title.includes("ENTRADAS");

  const metrics = useMemo(() => {
    const total = data.reduce((acc, e) => acc + (e.value || 0), 0);
    const realizado = data.filter(e => e.situation === 'PAGO').reduce((acc, e) => acc + (e.value || 0), 0);
    const pendente = data.filter(e => e.situation !== 'PAGO').reduce((acc, e) => acc + (e.value || 0), 0);
    
    // Cálculo Déficit/Superávit:
    // Para ENTRADAS: Realizado - Planejado (Se negativo = Déficit de faturamento)
    // Para SAÍDAS: Planejado - Pago (Se positivo = Economia/Superávit de caixa)
    const gap = isIncome ? (realizado - total) : (total - realizado);
    const taxa = total > 0 ? (realizado / total) * 100 : 0;
    
    return { total, realizado, pendente, gap, taxa };
  }, [data, isIncome]);

  const formatValue = (v: number) => showValues ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ ••••••';

  return (
    <div className="bg-white rounded-[56px] shadow-4xl border border-slate-200 overflow-hidden flex flex-col h-full transition-all hover:shadow-5xl">
      <div className={`px-10 py-10 flex justify-between items-center ${color} relative overflow-hidden`}>
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
        <button onClick={onAddNew} className="w-14 h-14 bg-white text-[#020617] rounded-3xl shadow-4xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center relative z-10 group">
          <Plus strokeWidth={3} className="w-8 h-8 group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      <div className="overflow-x-auto flex-1 no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 w-10"></th>
              <th className="px-8 py-6">Data</th>
              <th className="px-8 py-6">Descrição</th>
              <th className="px-8 py-6">Valor Real</th>
              <th className="px-8 py-6 text-center">Status</th>
              <th className="px-8 py-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((item, idx) => {
              const cat = getCategory(item.categoryId);
              return (
                <tr key={item.id} className={`group hover:bg-indigo-50/20 transition-all cursor-default`}>
                  <td className="px-8 py-6 text-slate-200 group-hover:text-indigo-400 transition-colors"><GripVertical size={16} /></td>
                  <td className="px-8 py-6 text-[11px] font-black text-slate-500 font-mono tracking-tighter">{formatDateLabel(item.dueDate)}</td>
                  <td className="px-8 py-6">
                    <div className="text-[12px] font-black text-slate-900 truncate max-w-[200px] uppercase tracking-tight">{item.description}</div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest mt-2 border ${cat.color.replace('text-', 'border-').replace('700', '200')} ${cat.color.replace('text-', 'bg-').replace('700', '50')} ${cat.color}`}>{cat.icon} {cat.name}</div>
                  </td>
                  <td className="px-8 py-6">
                    {editingValueId === item.id ? (
                      <input autoFocus type="number" step="0.01" className="w-24 bg-white border-2 border-indigo-200 rounded-xl px-3 py-1 font-mono font-black text-[12px] outline-none shadow-inner" value={localVal} onChange={e => setLocalVal(e.target.value)} onBlur={() => { onQuickUpdate(item.id, 'value', parseFloat(localVal) || 0); setEditingValueId(null); }} />
                    ) : (
                      <span onClick={() => { setEditingValueId(item.id); setLocalVal(item.value.toString()); }} className={`text-[13px] font-black font-mono tracking-tighter cursor-pointer px-3 py-1.5 rounded-xl hover:bg-white hover:shadow-md transition-all ${item.type === 'Receita' ? 'text-emerald-600' : 'text-slate-900'}`}>{formatValue(item.value || 0)}</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button onClick={() => onToggleStatus(item.id)} className={`px-4 py-2 rounded-full text-[9px] font-black border transition-all shadow-sm ${item.situation === 'PAGO' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                      {item.situation}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right"><div className="flex justify-end gap-2"><button onClick={() => onEdit(item)} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-2xl transition-all"><Edit3 size={16} /></button><button onClick={() => onDelete(item.id)} className="p-3 bg-rose-50 text-rose-300 hover:text-rose-600 hover:bg-white hover:shadow-md rounded-2xl transition-all"><Trash2 size={16} /></button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-100/50 border-t border-slate-200 p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <MetricaResumo label={isIncome ? "FATURAMENTO TOTAL" : "DÍVIDA TOTAL"} value={metrics.total} color="text-slate-900" bg="bg-white" sub="Total planejado" formatValue={formatValue} info={isIncome ? "A soma bruta de tudo o que você planejou faturar este mês." : "A soma de todos os seus compromissos financeiros planejados."} />
             <MetricaResumo label={isIncome ? "RECEBIDO ✓" : "PAGO ✓"} value={metrics.realizado} color="text-emerald-600" bg="bg-emerald-50/50" sub={`${metrics.taxa.toFixed(0)}% do total`} formatValue={formatValue} progress={metrics.taxa} info={isIncome ? "Valor que efetivamente entrou no caixa." : "Total das contas que já foram quitadas."} />
             <MetricaResumo label={isIncome ? "PENDENTE ⏳" : "RESTANTE"} value={metrics.pendente} color="text-amber-600" bg="bg-amber-50/50" sub={isIncome ? "A receber" : "A pagar"} formatValue={formatValue} info={isIncome ? "Dinheiro que você ainda está esperando cair na conta." : "O que você ainda precisa pagar para fechar o mês."} />
             <MetricaResumo label="DÉFICIT/SUPERÁVIT" value={metrics.gap} color={metrics.gap >= 0 ? "text-emerald-600" : "text-rose-600"} bg="bg-white" sub={metrics.gap >= 0 ? "Resultado Positivo" : "Gap de Operação"} formatValue={formatValue} pulse={metrics.gap < 0} info="A diferença entre o planejado e o realizado. No faturamento, positivo significa que superou a meta. Nas despesas, positivo significa economia." />
          </div>
      </div>
    </div>
  );
};

const MetricaResumo = ({ label, value, color, bg, sub, formatValue, progress, pulse, info }: any) => {
  return (
    <div className={`${bg} p-6 rounded-[32px] border border-slate-200 shadow-lg flex flex-col justify-between h-[150px] relative transition-all hover:shadow-xl ${pulse ? 'animate-pulse' : ''}`}>
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
