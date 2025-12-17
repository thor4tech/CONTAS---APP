
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

const SplitTransactionView: React.FC<Props> = ({ transactions, categories, partners, onToggleStatus, onDelete, onEdit, onAddNew, onQuickUpdate, totals, onReorder }) => {
  const [activeView, setActiveView] = useState<'both' | 'income' | 'expense'>('both');
  
  const incomes = transactions.filter(t => t.type === 'Receita');
  const expenses = transactions.filter(t => t.type === 'Despesa');

  const handleTableReorder = (type: 'Receita' | 'Despesa', newData: BaseTransaction[]) => {
    const otherType = transactions.filter(t => t.type !== type);
    onReorder?.([...otherType, ...newData]);
  };

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex justify-center sticky top-[88px] md:top-[112px] z-[90]">
        <div className="flex p-1.5 bg-white border border-slate-200 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl w-full max-w-sm">
           <button 
             onClick={() => setActiveView('income')} 
             className={`flex-1 px-4 py-3.5 text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-300 ${activeView === 'income' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}
           >
             Receitas
           </button>
           <button 
             onClick={() => setActiveView('both')} 
             className={`hidden sm:flex flex-1 items-center justify-center px-4 py-3.5 text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-300 ${activeView === 'both' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
           >
             Ambos
           </button>
           <button 
             onClick={() => setActiveView('expense')} 
             className={`flex-1 px-4 py-3.5 text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-300 ${activeView === 'expense' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
           >
             Despesas
           </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${activeView === 'both' ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-8 lg:gap-14`}>
        <div className={`space-y-6 ${activeView === 'expense' ? 'hidden' : 'block animate-in fade-in slide-in-from-left duration-700'}`}>
          <TransactionTable 
            title="FLUXO DE ENTRADAS (RECEITAS)" 
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
            onReorder={(data) => handleTableReorder('Receita', data)}
          />
        </div>

        <div className={`space-y-6 ${activeView === 'income' ? 'hidden' : 'block animate-in fade-in slide-in-from-right duration-700'}`}>
          <TransactionTable 
            title="FLUXO DE SAÍDAS (DESPESAS)" 
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
            onReorder={(data) => handleTableReorder('Despesa', data)}
          />
        </div>
      </div>
    </div>
  );
};

export default SplitTransactionView;
