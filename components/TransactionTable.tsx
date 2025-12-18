
import React, { useState, useRef, useEffect } from 'react';
import { BaseTransaction, Category, Situation, Partner } from '../types';
import { Trash2, Tag, Plus, Edit3, Wallet, ArrowUpRight, ArrowDownRight, Clock, Target, Scale, ShieldCheck, ChevronDown, CalendarDays, GripVertical, Activity, PiggyBank, ArrowDownCircle } from 'lucide-react';
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
  totals: {
    availableCash: number;
    pendingIncomes: number;
    totalPendingOutflows: number;
    reservaValue: number;
    liquidHealthNoReserva: number;
    liquidHealthWithReserva: number;
    pendingCardDebt: number;
  };
  onReorder?: (newData: BaseTransaction[]) => void;
}

const TransactionTable: React.FC<Props> = ({ title, color, data, categories, partners, onToggleStatus, onDelete, onEdit, onAddNew, onQuickUpdate, totals, onReorder }) => {
  const [openCatMenu, setOpenCatMenu] = useState<string | null>(null);
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [localVal, setLocalVal] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const catMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catMenuRef.current && !catMenuRef.current.contains(event.target as Node)) {
        setOpenCatMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategory = (id: string) => categories.find(c => c.id === id) || categories[0] || { name: 'S/ Cat', color: 'bg-slate-100 text-slate-400', icon: '❓' };
  const formatDateLabel = (dateStr: string) => { try { if (!dateStr) return '--/--'; const date = parseISO(dateStr); return format(date, 'dd/MM', { locale: ptBR }); } catch { return '--/--'; } };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.4';
    target.style.transform = 'scale(0.98)';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newData = [...data];
    const item = newData.splice(draggedIndex, 1)[0];
    newData.splice(index, 0, item);
    
    setDraggedIndex(index);
    onReorder?.(newData);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    target.style.transform = 'scale(1)';
  };

  return (
    <div className="bg-white rounded-[40px] md:rounded-[48px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-full transition-all duration-500 hover:shadow-3xl">
      <div className={`px-6 md:px-10 py-10 md:py-12 flex justify-between items-center ${color} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 md:w-80 h-64 md:h-80 bg-white/5 rounded-full -mr-24 md:-mr-32 -mt-24 md:-mt-32 blur-3xl"></div>
        <div className="flex items-center gap-4 md:gap-6 relative z-10 text-white">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg">
            <Tag size={24} />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-widest text-[12px] md:text-[14px] leading-tight max-w-[160px] md:max-w-none">{title}</h3>
            <p className="text-white/60 text-[10px] md:text-[10px] font-bold uppercase mt-1 tracking-widest">{data.length} Lançamentos</p>
          </div>
        </div>
        <button 
          onClick={onAddNew} 
          className="w-14 h-14 md:w-16 md:h-16 bg-white text-indigo-950 rounded-full md:rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] relative z-10 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-white/20"
        >
          <Plus size={28} strokeWidth={4} />
        </button>
      </div>

      <div className="overflow-x-auto flex-1 scrollbar-hide">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] border-b border-slate-100">
              <th className="px-3 md:px-4 py-6 w-8"></th>
              <th className="px-6 md:px-8 py-6">Data</th>
              <th className="px-6 md:px-8 py-6">Lançamento</th>
              <th className="px-6 md:px-8 py-6">Valor</th>
              <th className="px-6 md:px-8 py-6">Categoria</th>
              <th className="px-6 md:px-8 py-6 text-center">Status</th>
              <th className="px-6 md:px-8 py-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((item, idx) => {
              const cat = getCategory(item.categoryId);
              return (
                <tr 
                  key={item.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`group hover:bg-slate-50 transition-all duration-200 cursor-move ${draggedIndex === idx ? 'bg-indigo-50 shadow-xl z-20' : ''}`}
                >
                  <td className="px-3 md:px-4 py-5 text-slate-200 group-hover:text-indigo-400"><GripVertical size={14} /></td>
                  <td className="px-6 md:px-8 py-5"><div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-slate-400 font-mono"><CalendarDays size={10} />{formatDateLabel(item.dueDate)}</div></td>
                  <td className="px-6 md:px-8 py-5"><div className="text-[10px] md:text-[12px] font-black text-slate-700 truncate max-w-[120px] md:max-w-[200px]">{item.description}</div></td>
                  <td className="px-6 md:px-8 py-5">
                    {editingValueId === item.id ? (
                      <input autoFocus type="number" step="0.01" className="w-20 bg-white border-2 border-indigo-200 rounded-xl px-2 py-1 font-mono font-black text-[10px] outline-none" value={localVal} onChange={e => setLocalVal(e.target.value)} onBlur={() => { onQuickUpdate(item.id, 'value', parseFloat(localVal) || 0); setEditingValueId(null); }} />
                    ) : (
                      <span onClick={() => { setEditingValueId(item.id); setLocalVal(item.value.toString()); }} className={`text-[12px] md:text-[14px] font-black font-mono tracking-tighter cursor-pointer px-2 py-1 rounded-lg ${item.type === 'Receita' ? 'text-emerald-600' : 'text-slate-800'}`}>{(item.value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    )}
                  </td>
                  <td className="px-6 md:px-8 py-5 relative">
                    <button onClick={() => setOpenCatMenu(openCatMenu === item.id ? null : item.id)} className={`text-[8px] md:text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-2 border-transparent ${cat.color} flex items-center gap-1 shadow-sm`}>{cat.name} <ChevronDown size={8} /></button>
                    {openCatMenu === item.id && (
                      <div ref={catMenuRef} className="absolute top-full left-4 mt-1 w-44 bg-white rounded-2xl shadow-3xl border border-slate-100 p-1 z-50 grid grid-cols-1 gap-1">
                        {categories.map(c => <button key={c.id} onClick={() => { onQuickUpdate(item.id, 'categoryId', c.id); setOpenCatMenu(null); }} className={`text-left px-3 py-2 rounded-xl text-[8px] font-black uppercase ${c.id === item.categoryId ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50 text-slate-500'}`}>{c.icon} {c.name}</button>)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 md:px-8 py-5 text-center"><button onClick={() => onToggleStatus(item.id)} className={`px-3 py-1.5 rounded-xl text-[8px] font-black border-2 transition-all ${item.situation === 'PAGO' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>{item.situation}</button></td>
                  <td className="px-6 md:px-8 py-5 text-right"><div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => onEdit(item)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 size={16} /></button><button onClick={() => onDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-100 border-t border-slate-200 p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          <div className="bg-white p-5 md:p-6 rounded-[28px] md:rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Bancos (Atual)</span>
              <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all"><Wallet size={14} /></div>
            </div>
            <div className="text-[13px] md:text-[15px] font-black text-slate-900 font-mono tracking-tighter">
              {(totals.availableCash || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase mt-2 tracking-widest">Disponibilidade real</span>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-[28px] md:rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">A Receber</span>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500"><ArrowUpRight size={14} /></div>
            </div>
            <div className="text-[13px] md:text-[15px] font-black text-emerald-600 font-mono tracking-tighter">
              {(totals.pendingIncomes || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase mt-2 tracking-widest">Entradas pendentes</span>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-[28px] md:rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[8px] md:text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none">A Pagar Total</span>
              <div className="p-2 bg-rose-50 rounded-xl text-rose-500"><ArrowDownCircle size={14} /></div>
            </div>
            <div className="text-[13px] md:text-[15px] font-black text-rose-600 font-mono tracking-tighter">
              {(totals.totalPendingOutflows || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <span className="text-[7px] md:text-[8px] font-black text-rose-400 uppercase mt-2 font-bold leading-none">Cartão: R$ {(totals.pendingCardDebt || 0).toLocaleString('pt-BR')}</span>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-[28px] md:rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[8px] md:text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none">Reserva / Invest.</span>
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-500"><PiggyBank size={14} /></div>
            </div>
            <div className="text-[13px] md:text-[15px] font-black text-indigo-600 font-mono tracking-tighter">
              {(totals.reservaValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase mt-2 tracking-widest">Bloco de investimento</span>
          </div>

          <div className={`p-5 md:p-6 rounded-[28px] md:rounded-[32px] border-2 flex flex-col justify-between shadow-xl ${totals.liquidHealthNoReserva >= 0 ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[8px] md:text-[9px] font-black text-white/70 uppercase tracking-widest leading-none">Saúde Líquida</span>
              <div className="p-2 bg-white/20 rounded-xl text-white backdrop-blur-md"><ShieldCheck size={14} /></div>
            </div>
            <div className="text-[15px] md:text-[17px] font-black font-mono tracking-tighter leading-none mb-2">
              {(totals.liquidHealthNoReserva || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div className="border-t border-white/20 pt-2 flex justify-between items-center">
               <span className="text-[6px] font-black uppercase text-white/50 tracking-widest">Com Reserva:</span>
               <span className="text-[8px] md:text-[9px] font-black font-mono text-white/80">{(totals.liquidHealthWithReserva || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
