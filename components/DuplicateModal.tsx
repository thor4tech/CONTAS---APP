
import React, { useState, useEffect } from 'react';
import { BaseTransaction } from '../types';
import { X, Copy, Calendar, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedTransactions: BaseTransaction[];
  onConfirm: (targetDate: string, transactionsToSave: BaseTransaction[]) => Promise<void>;
  existingTransactionsInTargetMonth: (date: string) => Promise<BaseTransaction[]>;
}

const DuplicateModal: React.FC<Props> = ({ isOpen, onClose, selectedTransactions, onConfirm, existingTransactionsInTargetMonth }) => {
  const [targetDate, setTargetDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [analysis, setAnalysis] = useState<{ new: number; dupe: number; newItems: BaseTransaction[] } | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setAnalysis(null);
      setTargetDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [isOpen]);

  // Função para analisar duplicatas em tempo real quando a data muda ou abre
  useEffect(() => {
    if (!isOpen || selectedTransactions.length === 0) return;

    const analyze = async () => {
      setLoading(true);
      try {
        // Extrai o mês alvo
        const [y, m] = targetDate.split('-');
        const monthKey = `${y}-${m}`;
        
        // Busca transações existentes no destino (função passada pelo pai para acessar Firestore)
        const existing = await existingTransactionsInTargetMonth(monthKey);
        
        const newItems: BaseTransaction[] = [];
        let dupeCount = 0;

        selectedTransactions.forEach(tx => {
           // Regra de Duplicidade: Mesma Descrição E Mesmo Valor (apróx)
           const isDupe = existing.some(ex => 
              ex.description.toLowerCase().trim() === tx.description.toLowerCase().trim() &&
              Math.abs(ex.value - tx.value) < 0.01
           );

           if (isDupe) {
             dupeCount++;
           } else {
             // Prepara o novo item com a nova data
             // Mantém o dia original, mas muda mês e ano
             const originalDay = tx.dueDate.split('-')[2] || '01';
             const newDueDate = `${y}-${m}-${originalDay}`;
             
             newItems.push({
               ...tx,
               id: Math.random().toString(36).substr(2, 9), // Novo ID
               dueDate: newDueDate,
               monthRef: monthKey,
               situation: 'PENDENTE', // Reseta status
               isRecurring: false, // Ao duplicar manualmente, remove flag de recorrência automática antiga
               groupId: undefined,
               installmentNumber: undefined,
               installmentTotal: undefined
             });
           }
        });

        setAnalysis({ new: newItems.length, dupe: dupeCount, newItems });
      } catch (error) {
        console.error("Erro ao analisar duplicatas:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(analyze, 500); // Debounce
    return () => clearTimeout(timer);

  }, [targetDate, selectedTransactions, isOpen]); // Removido existingTransactionsInTargetMonth da dep para evitar loop se não memoizado

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (analysis && analysis.newItems.length > 0) {
      await onConfirm(targetDate, analysis.newItems);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-md shadow-4xl border border-white/20 overflow-hidden transform animate-in zoom-in-95 duration-300 flex flex-col">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg">
                <Copy size={20} />
             </div>
             <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tighter">Duplicação Inteligente</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clonar {selectedTransactions.length} itens selecionados</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-slate-400"><X size={20}/></button>
        </div>

        <div className="p-8 space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-2">Para qual data?</label>
              <div className="relative">
                 <input 
                   type="date" 
                   value={targetDate}
                   onChange={e => setTargetDate(e.target.value)}
                   className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold text-slate-800 focus:border-indigo-400 transition-all"
                 />
                 <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
           </div>

           {/* Painel de Análise */}
           <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
              {loading ? (
                 <div className="flex flex-col items-center justify-center py-4 gap-3 text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Verificando banco de dados...</span>
                 </div>
              ) : analysis ? (
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-xs font-bold text-slate-600">Novos Registros</span>
                       </div>
                       <span className="text-lg font-black text-emerald-600 font-mono">{analysis.new}</span>
                    </div>
                    
                    {analysis.dupe > 0 && (
                       <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                          <div className="flex items-center gap-3 text-amber-600">
                             <AlertTriangle size={14} />
                             <span className="text-xs font-bold">Duplicatas Ignoradas</span>
                          </div>
                          <span className="text-lg font-black text-amber-600 font-mono">{analysis.dupe}</span>
                       </div>
                    )}

                    <div className="pt-2 text-[9px] text-slate-400 font-medium leading-relaxed text-center">
                       O sistema verifica se já existe uma transação com a mesma descrição e valor no mês de destino para evitar repetição.
                    </div>
                 </div>
              ) : null}
           </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
           <button onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all bg-white rounded-2xl border border-slate-200 hover:bg-slate-100">
              Cancelar
           </button>
           <button 
             disabled={loading || !analysis || analysis.new === 0}
             onClick={handleConfirm}
             className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
           >
              {analysis && analysis.new > 0 ? (
                 <>Duplicar {analysis.new} Itens <ArrowRight size={14}/></>
              ) : (
                 'Nada para Duplicar'
              )}
           </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateModal;
