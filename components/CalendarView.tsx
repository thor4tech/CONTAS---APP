
import React from 'react';
import { BaseTransaction } from '../types';
// Add missing Activity icon import from lucide-react
import { Activity } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday, startOfWeek, endOfWeek, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  month: string;
  year: number;
  transactions: BaseTransaction[];
}

const CalendarView: React.FC<Props> = ({ month, year, transactions }) => {
  const monthIndex = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ].indexOf(month);

  const viewDate = new Date(year, monthIndex);
  const firstDay = startOfMonth(viewDate);
  const lastDay = endOfMonth(viewDate);
  const startDate = startOfWeek(firstDay, { locale: ptBR });
  const endDate = endOfWeek(lastDay, { locale: ptBR });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getTransactionsForDay = (day: Date) => {
    return transactions.filter(t => {
      if (!t.dueDate) return false;
      try {
        const txDate = parseISO(t.dueDate);
        return isSameDay(txDate, day);
      } catch {
        return false;
      }
    });
  };

  return (
    <div className="bg-white rounded-[56px] shadow-4xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="py-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 bg-slate-100 gap-[1px]">
        {days.map((day, idx) => {
          const dayTx = getTransactionsForDay(day);
          const isCurrentMonth = day.getMonth() === monthIndex;
          const isCurrentToday = isToday(day);
          const isDayWeekend = isWeekend(day);
          
          return (
            <div key={idx} className={`min-h-[160px] p-4 transition-all duration-300 ${isCurrentMonth ? (isDayWeekend ? 'bg-slate-50/50' : 'bg-white') : 'bg-slate-200/20 opacity-30'} group hover:bg-indigo-50/30 cursor-pointer overflow-hidden relative`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-sm font-black font-mono transition-transform group-hover:scale-110 ${isCurrentToday ? 'bg-indigo-600 text-white w-9 h-9 flex items-center justify-center rounded-[14px] shadow-indigo-200 shadow-2xl border-2 border-white' : 'text-slate-400'}`}>
                  {format(day, 'd')}
                </span>
                {dayTx.length > 0 && (
                   <div className="flex -space-x-1.5 overflow-hidden">
                      {dayTx.slice(0, 3).map((t, i) => (
                        <div key={t.id} className={`w-2.5 h-2.5 rounded-full border border-white shadow-sm ${t.type === 'Receita' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                      ))}
                      {dayTx.length > 3 && (
                        <div className="w-2.5 h-2.5 rounded-full border border-white bg-slate-300 flex items-center justify-center text-[5px] font-black text-white">+{dayTx.length-3}</div>
                      )}
                   </div>
                )}
              </div>
              <div className="space-y-1.5 max-h-[100px] overflow-y-auto no-scrollbar pb-2">
                {dayTx.map(tx => (
                  <div 
                    key={tx.id} 
                    className={`text-[9px] px-2.5 py-1.5 rounded-xl border leading-tight truncate font-black shadow-sm transition-all hover:translate-x-1 active:scale-95
                      ${tx.type === 'Receita' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100'}
                    `}
                    title={`${tx.description}: R$ ${tx.value.toLocaleString('pt-BR')}`}
                  >
                    <span className="opacity-40 mr-1.5">{tx.type === 'Receita' ? '▲' : '▼'}</span>
                    {tx.description}
                  </div>
                ))}
              </div>
              {isCurrentMonth && dayTx.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity">
                   <Activity size={40} className="text-indigo-900" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
