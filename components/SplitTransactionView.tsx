
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
}

const SplitTransactionView: React.FC<Props> = ({ transactions, categories, partners, onToggleStatus, onDelete, onEdit, onAddNew, onQuickUpdate, totals, onReorder }) => {
  const [activeView, setActiveView] = useState<'both' | 'income' | 'expense'>('both');
  
  const incomes = transactions.filter(t => t.type === 'Receita');
  const expenses = transactions.filter(t => t.type === 'Despesa');

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-center sticky top-24 md:top-28 z-[90]">
        <div className="flex p-1 bg-white border border-slate-200 rounded-full shadow-2xl backdrop-blur-xl w-full max-w-sm">
           <button 
             onClick={() => setActiveView('income')} 
             className={`flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeView === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
           >
             Entradas
           </button>
           <button 
             onClick={() => setActiveView('both')} 
             className={`hidden sm:flex flex-1 items-center justify-center px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeView === 'both' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
           >
             Ambos
           </button>
           <button 
             onClick={() => setActiveView('expense')} 
             className={`flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeView === 'expense' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
           >
             Saídas
           </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${activeView === 'both' ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-8 lg:gap-12`}>
        <div className={`space-y-6 ${activeView === 'expense' ? 'hidden' : 'block'}`}>
          <TransactionTable 
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
            onReorder={(data) => onReorder?.([...expenses, ...data])}
          />
        </div>
        <div className={`space-y-6 ${activeView === 'income' ? 'hidden' : 'block'}`}>
          <TransactionTable 
            title="FLUXO DE SAÍDAS" 
            color="bg-slate-900"
            data={expenses}
            categories={categories}
            partners={partners}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onEdit={onEdit}
            onAddNew={() => onAddNew('Despesa')}
            onQuickUpdate={onQuickUpdate}
            totals={totals}
            onReorder={(data) => onReorder?.([...incomes, ...data])}
          />
        </div>
      </div>
    </div>
  );
};

export default SplitTransactionView;
