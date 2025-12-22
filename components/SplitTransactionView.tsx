
import React, { useState } from 'react';
import { BaseTransaction, Category, Partner } from '../types';
import TransactionTable from './TransactionTable';

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
}

const SplitTransactionView: React.FC<Props> = ({ transactions, categories, partners, onToggleStatus, onDelete, onEdit, onAddNew, onQuickUpdate, totals, onReorder, showValues = true }) => {
  const [activeView, setActiveView] = useState<'both' | 'income' | 'expense'>('both');
  
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

  return (
    <div className="space-y-12 animate-in fade-in duration-500 w-full max-w-full">
      <div className="flex justify-center sticky top-[150px] md:top-[160px] z-[85]">
        <div className="flex p-1 bg-white/90 border border-slate-200 rounded-full shadow-2xl backdrop-blur-xl w-full max-w-[340px] md:max-w-md">
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
          />
        </div>
      </div>
    </div>
  );
};

export default SplitTransactionView;
