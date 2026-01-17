
import React, { useState } from 'react';
import { BaseTransaction, Category, Partner } from '../types';
import TransactionTable from './TransactionTable';
import { Copy, Eraser, CheckSquare } from 'lucide-react';

interface Props {
  transactions: BaseTransaction[];
  categories: Category[];
  partners: Partner[];
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (tx: BaseTransaction) => void;
  onAddNew: (type: 'Receita' | 'Despesa') => void;
  onQuickUpdate: (id: string, field: keyof BaseTransaction, value: any) => void;
  totals: any;
  onReorder?: (newData: BaseTransaction[]) => void;
  showValues?: boolean;
  onDuplicatePrevious?: () => void;
  onClearMonth?: () => void;
  onSmartDuplicate?: (selectedIds: string[]) => void;
}

const SplitTransactionView: React.FC<Props> = ({ 
  transactions, categories, partners, 
  onToggleStatus, onDelete, onEdit, onAddNew, onQuickUpdate, 
  totals, onReorder, showValues = true, 
  onDuplicatePrevious, onClearMonth, onSmartDuplicate 
}) => {
  const [activeView, setActiveView] = useState<'both' | 'income' | 'expense'>('both');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const incomes = transactions.filter(t => t.type === 'Receita');
  const expenses = transactions.filter(t => t.type === 'Despesa');

  const handleReorder = (type: 'Receita' | 'Despesa', reorderedPart: BaseTransaction[]) => {
    if (!onReorder) return;
    if (type === 'Receita') {
      onReorder([...reorderedPart, ...expenses]);
    } else {
      onReorder([...incomes, ...reorderedPart]);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (ids: string[]) => {
    setSelectedIds(ids);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-full pb-10">
      {/* Sticky Header Control */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center sticky top-0 z-20 bg-slate-50/90 backdrop-blur-md py-4 border-b border-slate-200/50 -mx-4 px-4 md:mx-0 md:px-0 md:border-none md:bg-transparent md:backdrop-blur-none">
        
        {/* View Toggle */}
        <div className="flex p-1 bg-white border border-slate-200 rounded-full shadow-lg w-full max-w-[340px] md:max-w-md">
           <button 
             onClick={() => setActiveView('income')} 
             className={`flex-1 px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeView === 'income' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
           >
             Entradas
           </button>
           <button 
             onClick={() => setActiveView('both')} 
             className={`flex flex-1 items-center justify-center px-4 py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeView === 'both' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
           >
             Ambos
           </button>
           <button 
             onClick={() => setActiveView('expense')} 
             className={`flex-1 px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeView === 'expense' ? 'bg-[#020617] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
           >
             Saídas
           </button>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3">
           {selectedIds.length > 0 && onSmartDuplicate ? (
             <button 
               onClick={() => { onSmartDuplicate(selectedIds); setSelectedIds([]); }}
               className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all animate-in slide-in-from-right duration-300"
             >
               <Copy size={14} /> <span className="hidden md:inline">Duplicar ({selectedIds.length})</span>
             </button>
           ) : (
             onDuplicatePrevious && (
               <button 
                 onClick={onDuplicatePrevious}
                 className="flex items-center gap-3 px-6 py-3 bg-white border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all"
               >
                 <Copy size={14} /> <span className="hidden md:inline">Duplicar Mês</span>
               </button>
             )
           )}
           
           {onClearMonth && selectedIds.length === 0 && (
             <button 
               onClick={onClearMonth}
               className="flex items-center gap-3 px-6 py-3 bg-white border border-rose-100 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all"
             >
               <Eraser size={14} /> <span className="hidden md:inline">Limpar Mês</span>
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 w-full">
        <div className={`w-full transition-all duration-500 ${activeView === 'expense' ? 'hidden' : 'block'}`}>
          <TransactionTable 
            showValues={showValues}
            title="FLUXO DE ENTRADAS" 
            color="bg-emerald-600"
            data={incomes}
            categories={categories}
            partners={partners}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onEdit={onEdit}
            onAddNew={() => onAddNew('Receita')}
            onQuickUpdate={onQuickUpdate}
            totals={totals}
            onReorder={(data) => handleReorder('Receita', data)}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
          />
        </div>
        <div className={`w-full transition-all duration-500 ${activeView === 'income' ? 'hidden' : 'block'}`}>
          <TransactionTable 
            showValues={showValues}
            title="FLUXO DE SAÍDAS" 
            color="bg-[#020617]"
            data={expenses}
            categories={categories}
            partners={partners}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onEdit={onEdit}
            onAddNew={() => onAddNew('Despesa')}
            onQuickUpdate={onQuickUpdate}
            totals={totals}
            onReorder={(data) => handleReorder('Despesa', data)}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
          />
        </div>
      </div>
    </div>
  );
};

export default SplitTransactionView;
