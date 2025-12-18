
import React, { useState, useRef, useEffect } from 'react';
import { BaseTransaction, Category, Partner } from '../types';
import { Trash2, Tag, Plus, Edit3, Wallet, ArrowUpRight, ArrowDownCircle, ChevronDown, CalendarDays, GripVertical, ShieldCheck, PiggyBank, Activity, Shield, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const formatDateLabel = (dateStr: string) => { try { if (!dateStr) return '--/--'; const date = parseISO(dateStr); return format(date, 'dd/MM', { locale: ptBR }); } catch { return '--/--'; } };

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => e.preventDefault();
  const handleDrop = (idx: number) => {
    if (draggedIdx === null || draggedIdx === idx || !onReorder) return;
    const newData = [...data];
    const [removed] = newData.splice(draggedIdx, 1);
    newData.splice(idx, 0, removed);
    onReorder(newData);
    setDraggedIdx(null);
  };

  const isIncome = title.includes("ENTRADAS");
  const tableTotal = data.reduce((a, t) => a + (t.value || 0), 0);
  const tablePaid = data.filter(t => t.situation === 'PAGO').reduce((a, t) => a + (t.value || 0), 0);
  const tableRemaining = data.filter(t => t.situation !== 'PAGO').reduce((a, t) => a + (t.value || 0), 0);

  const formatValue = (v: number) => {
    if (!showValues) return 'R$ ••••••';
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="bg-white rounded-[40px] md:rounded-[56px] shadow-3xl border border-slate-100 overflow-hidden flex flex-col h-full transition-all hover:shadow-4xl">
      <div className={`px-6 py-8 md:px-8 md:py-10 flex justify-between items-center ${color} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10 text-white rotate-12"><Activity size={100}/></div>
        <div className="flex items-center gap-4 md:gap-5 relative z-10 text-white">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-[18px] md:rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl">
            {isIncome ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          </div>
          <div>
            <h3 className="font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[11px] md:text-[14px] leading-tight">{title}</h3>
            <p className="text-white/60 text-[9px] md:text-[10px] font-bold uppercase mt-2 tracking-widest">{data.length} Transações</p>
          </div>
        </div>
        <button onClick={onAddNew} className="w-12 h-12 md:w-14 md:h-14 bg-white text-[#020617] rounded-[18px] md:rounded-3xl shadow-4xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center relative z-10 group">
          <Plus size={28} md:size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      <div className="overflow-x-auto flex-1 no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[550px]">
          <thead className="bg-slate-50 text-slate-400 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] border-b border-slate-100">
            <tr>
              <th className="px-4 py-5 md:px-6 md:py-6 w-10"></th>
              <th className="px-4 py-5 md:px-6 md:py-6">Vencimento</th>
              <th className="px-4 py-5 md:px-6 md:py-6">Lançamento</th>
              <th className="px-4 py-5 md:px-6 md:py-6">Valor Real</th>
              <th className="px-4 py-5 md:px-6 md:py-6 text-center">Status</th>
              <th className="px-4 py-5 md:px-6 md:py-6 text-right">Controle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((item, idx) => {
              const cat = getCategory(item.categoryId);
              return (
                <tr 
                  key={item.id} 
                  draggable={!!onReorder}
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  className={`group hover:bg-slate-50/80 transition-all cursor-move ${draggedIdx === idx ? 'opacity-30' : ''}`}
                >
                  <td className="px-4 py-5 md:px-6 md:py-6 text-slate-200 group-hover:text-indigo-400 transition-colors">
                    <GripVertical size={14} />
                  </td>
                  <td className="px-4 py-5 md:px-6 md:py-6 text-[10px] md:text-[11px] font-black text-slate-500 font-mono tracking-tighter">
                    {formatDateLabel(item.dueDate)}
                  </td>
                  <td className="px-4 py-5 md:px-6 md:py-6">
                    <div className="text-[11px] md:text-[12px] font-black text-slate-900 truncate max-w-[150px] md:max-w-[200px] uppercase tracking-tight">{item.description}</div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[7px] md:text-[8px] font-black uppercase tracking-widest mt-2 border ${cat.color.replace('text-', 'border-').replace('700', '200')} ${cat.color.replace('text-', 'bg-').replace('700', '50')} ${cat.color}`}>
                      {cat.icon} {cat.name}
                    </div>
                  </td>
                  <td className="px-4 py-5 md:px-6 md:py-6">
                    {editingValueId === item.id ? (
                      <input autoFocus type="number" step="0.01" className="w-24 bg-white border-2 border-blue-200 rounded-xl px-3 py-1 font-mono font-black text-[12px] outline-none shadow-inner" value={localVal} onChange={e => setLocalVal(e.target.value)} onBlur={() => { onQuickUpdate(item.id, 'value', parseFloat(localVal) || 0); setEditingValueId(null); }} />
                    ) : (
                      <span onClick={() => { setEditingValueId(item.id); setLocalVal(item.value.toString()); }} className={`text-[12px] md:text-[13px] font-black font-mono tracking-tighter cursor-pointer px-2 py-1 rounded-lg hover:bg-blue-50 transition-all ${item.type === 'Receita' ? 'text-emerald-600' : 'text-slate-900'}`}>{formatValue(item.value || 0)}</span>
                    )}
                  </td>
                  <td className="px-4 py-5 md:px-6 md:py-6 text-center">
                    <button onClick={() => onToggleStatus(item.id)} className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[7px] md:text-[9px] font-black border transition-all shadow-sm ${item.situation === 'PAGO' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{item.situation}</button>
                  </td>
                  <td className="px-4 py-5 md:px-6 md:py-6 text-right">
                    <div className="flex justify-end gap-1 md:gap-2">
                      <button onClick={() => onEdit(item)} className="p-2 md:p-2.5 bg-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm"><Edit3 size={15} /></button>
                      <button onClick={() => onDelete(item.id)} className="p-2 md:p-2.5 bg-rose-50 text-rose-300 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-all shadow-sm"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* RODAPÉ ESTRATÉGICO OTIMIZADO */}
      <div className="bg-slate-50 border-t border-slate-100 p-5 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white p-4 md:p-5 rounded-[28px] border border-slate-100 shadow-xl flex flex-col justify-between group hover:border-indigo-200 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{isIncome ? 'Faturamento Total' : 'Dívida Total'}</span>
              <div className={`flex items-center justify-center p-1.5 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all bg-slate-100 text-slate-400`}><Activity size={12}/></div>
            </div>
            <div className="text-[12px] md:text-[14px] font-black text-slate-900 font-mono tracking-tighter">{formatValue(tableTotal)}</div>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-[28px] border border-slate-100 shadow-xl flex flex-col justify-between group hover:border-emerald-200 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-widest">{isIncome ? 'Recebido' : 'Pago'}</span>
              <div className="flex items-center justify-center p-1.5 bg-emerald-50 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-all"><CheckCircle2 size={12}/></div>
            </div>
            <div className="text-[12px] md:text-[14px] font-black text-emerald-600 font-mono tracking-tighter">{formatValue(tablePaid)}</div>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-[28px] border border-slate-100 shadow-xl flex flex-col justify-between group hover:border-amber-200 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[8px] md:text-[9px] font-black text-amber-500 uppercase tracking-widest">{isIncome ? 'Pendente' : 'Restante'}</span>
              <div className="flex items-center justify-center p-1.5 bg-amber-50 text-amber-400 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-all"><Clock size={12}/></div>
            </div>
            <div className="text-[12px] md:text-[14px] font-black text-amber-600 font-mono tracking-tighter">{formatValue(tableRemaining)}</div>
          </div>

          <div className={`p-4 md:p-5 rounded-[28px] border-2 flex flex-col justify-between shadow-xl transition-all ${totals.liquidHealthNoReserve >= 0 ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[8px] md:text-[9px] font-black text-white/70 uppercase tracking-widest">{totals.liquidHealthNoReserve >= 0 ? 'Sobra Projetada' : 'Falta Projetada'}</span>
              <div className="flex items-center justify-center p-1.5 bg-white/10 rounded-lg text-white">{totals.liquidHealthNoReserve >= 0 ? <Shield size={12}/> : <AlertCircle size={12}/>}</div>
            </div>
            <div className="text-[14px] md:text-[16px] font-black font-mono tracking-tighter leading-none">{formatValue(totals.liquidHealthNoReserve || 0)}</div>
          </div>
      </div>
    </div>
  );
};

export default TransactionTable;
