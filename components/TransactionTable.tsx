
import React, { useState, useRef, useEffect } from 'react';
import { BaseTransaction, Category, Partner } from '../types';
import { Trash2, Tag, Plus, Edit3, Wallet, ArrowUpRight, ArrowDownCircle, ChevronDown, CalendarDays, GripVertical, ShieldCheck, PiggyBank } from 'lucide-react';
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
}

const TransactionTable: React.FC<Props> = ({ title, color, data, categories, partners, onToggleStatus, onDelete, onEdit, onAddNew, onQuickUpdate, totals, onReorder }) => {
  const [openCatMenu, setOpenCatMenu] = useState<string | null>(null);
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [localVal, setLocalVal] = useState("");
  const catMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catMenuRef.current && !catMenuRef.current.contains(event.target as Node)) setOpenCatMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategory = (id: string) => categories.find(c => c.id === id) || categories[0] || { name: 'S/ Cat', color: 'bg-slate-100 text-slate-400', icon: '❓' };
  const formatDateLabel = (dateStr: string) => { try { if (!dateStr) return '--/--'; const date = parseISO(dateStr); return format(date, 'dd/MM', { locale: ptBR }); } catch { return '--/--'; } };

  return (
    <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-full transition-all hover:shadow-3xl">
      <div className={`px-6 py-8 md:py-10 flex justify-between items-center ${color} relative overflow-hidden`}>
        <div className="flex items-center gap-4 relative z-10 text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
            <Tag size={20} />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-widest text-[11px] md:text-[13px] leading-tight">{title}</h3>
            <p className="text-white/60 text-[9px] font-bold uppercase mt-1">{data.length} Itens</p>
          </div>
        </div>
        <button onClick={onAddNew} className="w-12 h-12 bg-white text-indigo-950 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center">
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="overflow-x-auto flex-1 no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead className="bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-4 py-4 w-8"></th>
              <th className="px-4 py-4">Data</th>
              <th className="px-4 py-4">Lançamento</th>
              <th className="px-4 py-4">Valor</th>
              <th className="px-4 py-4 text-center">Status</th>
              <th className="px-4 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((item) => {
              const cat = getCategory(item.categoryId);
              return (
                <tr key={item.id} className="group hover:bg-slate-50/80 transition-all">
                  <td className="px-4 py-4 text-slate-200"><GripVertical size={12} /></td>
                  <td className="px-4 py-4 text-[9px] font-black text-slate-400 font-mono">{formatDateLabel(item.dueDate)}</td>
                  <td className="px-4 py-4">
                    <div className="text-[10px] font-black text-slate-700 truncate max-w-[120px]">{item.description}</div>
                    <div className="text-[7px] font-bold text-slate-400 uppercase mt-0.5">{cat.name}</div>
                  </td>
                  <td className="px-4 py-4">
                    {editingValueId === item.id ? (
                      <input autoFocus type="number" step="0.01" className="w-20 bg-white border-2 border-blue-200 rounded-lg px-2 py-1 font-mono font-black text-[10px] outline-none" value={localVal} onChange={e => setLocalVal(e.target.value)} onBlur={() => { onQuickUpdate(item.id, 'value', parseFloat(localVal) || 0); setEditingValueId(null); }} />
                    ) : (
                      <span onClick={() => { setEditingValueId(item.id); setLocalVal(item.value.toString()); }} className={`text-[11px] font-black font-mono tracking-tighter cursor-pointer ${item.type === 'Receita' ? 'text-emerald-600' : 'text-slate-800'}`}>{(item.value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => onToggleStatus(item.id)} className={`px-2 py-1 rounded-lg text-[7px] font-black border transition-all ${item.situation === 'PAGO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{item.situation}</button>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => onEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit3 size={14} /></button>
                      <button onClick={() => onDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-100/50 border-t border-slate-200 p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-[7px] font-black text-slate-400 uppercase block mb-1">Caixa Atual</span>
            <div className="text-[10px] font-black text-slate-900 font-mono">{(totals.availableCash || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-[7px] font-black text-emerald-500 uppercase block mb-1">A Receber</span>
            <div className="text-[10px] font-black text-emerald-600 font-mono">{(totals.pendingIncomes || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          </div>
          <div className={`p-3 rounded-2xl border-2 flex flex-col justify-center ${totals.liquidHealthNoReserva >= 0 ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white'}`}>
            <span className="text-[7px] font-black text-white/70 uppercase mb-0.5">Saúde Líquida</span>
            <div className="text-[11px] font-black font-mono leading-none">{(totals.liquidHealthNoReserva || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-[7px] font-black text-rose-500 uppercase block mb-1">Dívida Total</span>
            <div className="text-[10px] font-black text-rose-600 font-mono">{(totals.totalPendingOutflows || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          </div>
      </div>
    </div>
  );
};

export default TransactionTable;
