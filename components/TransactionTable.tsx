
import React, { useState, useMemo } from 'react';
import { BaseTransaction, Category, Partner } from '../types';
import { Trash2, Plus, Edit3, Activity, TrendingUp, TrendingDown, GripVertical, Info } from 'lucide-react';
import { format, endOfMonth } from 'date-fns';
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

const Tooltip = ({ text }: { text: string }) => (
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 bg-slate-900 text-white text-[10px] font-medium rounded-2xl shadow-2xl z-[200] animate-in fade-in zoom-in-95 leading-relaxed border border-white/10">
    <div className="flex items-center gap-2 mb-2 text-indigo-400 font-black uppercase tracking-widest border-b border-white/10 pb-1">
      <Info size={12} /> Guia do Fluxo
    </div>
    {text}
    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
  </div>
);

class MetricasFluxo {
  entradas: BaseTransaction[];
  saidas: BaseTransaction[];
  hoje: Date;
  fimMes: Date;

  constructor(entradas: BaseTransaction[], saidas: BaseTransaction[]) {
    this.entradas = entradas;
    this.saidas = saidas;
    this.hoje = new Date();
    this.fimMes = endOfMonth(this.hoje);
  }

  calcularFaturamentoTotal() { return this.entradas.reduce((acc, e) => acc + (e.value || 0), 0); }
  calcularRecebido() { return this.entradas.filter(e => e.situation === 'PAGO').reduce((acc, e) => acc + (e.value || 0), 0); }
  calcularPendente() { return this.entradas.filter(e => e.situation === 'PENDENTE').reduce((acc, e) => acc + (e.value || 0), 0); }
  calcularFaltaProjetadaEntradas() {
    return this.entradas.filter(e => {
        const venc = e.dueDate ? new Date(e.dueDate + 'T00:00:00') : new Date(2100, 0, 1);
        return e.situation === 'PENDENTE' && venc < this.hoje;
      }).reduce((acc, e) => acc + (e.value || 0), 0);
  }
  calcularDividaTotal() { return this.saidas.reduce((acc, s) => acc + (s.value || 0), 0); }
  calcularPago() { return this.saidas.filter(s => s.situation === 'PAGO').reduce((acc, s) => acc + (s.value || 0), 0); }
  calcularRestante() { return this.saidas.filter(s => s.situation === 'PENDENTE').reduce((acc, s) => acc + (s.value || 0), 0); }
  calcularFaltaProjetadaSaidas() {
    return this.saidas.filter(s => {
        const venc = s.dueDate ? new Date(s.dueDate + 'T00:00:00') : new Date(2100, 0, 1);
        return s.situation === 'PENDENTE' && venc <= this.fimMes;
      }).reduce((acc, s) => acc + (s.value || 0), 0);
  }
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
  const engine = useMemo(() => isIncome ? new MetricasFluxo(data, []) : new MetricasFluxo([], data), [data, isIncome]);

  const metrics = useMemo(() => {
    if (isIncome) {
      const total = engine.calcularFaturamentoTotal();
      const rec = engine.calcularRecebido();
      const pen = engine.calcularPendente();
      const falta = engine.calcularFaltaProjetadaEntradas();
      const taxa = total > 0 ? (rec / total) * 100 : 0;
      return { total, realizado: rec, pendente: pen, falta, taxa };
    } else {
      const total = engine.calcularDividaTotal();
      const pago = engine.calcularPago();
      const rest = engine.calcularRestante();
      const falta = engine.calcularFaltaProjetadaSaidas();
      const taxa = total > 0 ? (pago / total) * 100 : 0;
      return { total, realizado: pago, pendente: rest, falta, taxa };
    }
  }, [engine, isIncome]);

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
                <tr key={item.id} draggable={!!onReorder} onDragStart={() => handleDragStart(idx)} onDragOver={(e) => handleDragOver(e, idx)} onDrop={() => handleDrop(idx)} className={`group hover:bg-indigo-50/20 transition-all cursor-move ${draggedIdx === idx ? 'opacity-30' : ''}`}>
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
                  <td className="px-8 py-6 text-center"><button onClick={() => onToggleStatus(item.id)} className={`px-4 py-2 rounded-full text-[9px] font-black border transition-all shadow-sm ${item.situation === 'PAGO' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{item.situation}</button></td>
                  <td className="px-8 py-6 text-right"><div className="flex justify-end gap-2"><button onClick={() => onEdit(item)} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-2xl transition-all"><Edit3 size={16} /></button><button onClick={() => onDelete(item.id)} className="p-3 bg-rose-50 text-rose-300 hover:text-rose-600 hover:bg-white hover:shadow-md rounded-2xl transition-all"><Trash2 size={16} /></button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-100/50 border-t border-slate-200 p-10 space-y-10 animate-in fade-in duration-1000">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <MetricaResumo label={isIncome ? "FATURAMENTO TOTAL" : "DÍVIDA TOTAL"} value={metrics.total} color="text-slate-900" bg="bg-white" sub="Total planejado" formatValue={formatValue} info={isIncome ? "A soma bruta de tudo o que você planejou faturar este mês." : "A soma de todos os seus compromissos financeiros planejados."} />
             <MetricaResumo label={isIncome ? "RECEBIDO ✓" : "PAGO ✓"} value={metrics.realizado} color="text-emerald-600" bg="bg-emerald-50/50" sub={`${metrics.taxa.toFixed(0)}% do total`} formatValue={formatValue} progress={metrics.taxa} info={isIncome ? "Valor que efetivamente entrou no caixa." : "Total das contas que já foram quitadas."} />
             <MetricaResumo label={isIncome ? "PENDENTE ⏳" : "RESTANTE"} value={metrics.pendente} color="text-amber-600" bg="bg-amber-50/50" sub={isIncome ? "A receber" : "A pagar"} formatValue={formatValue} info={isIncome ? "Dinheiro que você ainda está esperando cair na conta." : "O que você ainda precisa pagar para fechar o mês."} />
             <MetricaResumo label="DÉFICIT/SUPERÁVIT" value={metrics.falta} color="text-rose-600" bg="bg-rose-50/50" sub="Falta/Sobra" formatValue={formatValue} pulse={metrics.falta > 0} info="A diferença entre o que foi planejado e o que foi realizado. Se negativo, você superou a meta!" />
          </div>
      </div>
    </div>
  );
};

const MetricaResumo = ({ label, value, color, bg, sub, formatValue, progress, pulse, info }: any) => {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div className={`${bg} p-6 rounded-[32px] border border-slate-200 shadow-lg flex flex-col justify-between h-[150px] relative transition-all hover:shadow-xl ${pulse ? 'animate-pulse' : ''}`}>
       <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
             <div className="relative">
                <button 
                  onMouseEnter={() => setShowInfo(true)}
                  onMouseLeave={() => setShowInfo(false)}
                  className="p-1"
                >
                  <Info size={12} className="text-slate-300 hover:text-indigo-500" />
                </button>
                {showInfo && <Tooltip text={info} />}
             </div>
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
