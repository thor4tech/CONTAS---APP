
import React, { useState } from 'react';
import { BaseTransaction } from '../types';
import { Activity, X, CheckCircle2, AlertCircle, Clock, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday, startOfWeek, endOfWeek, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  month: string;
  year: number;
  transactions: BaseTransaction[];
}

const CalendarView: React.FC<Props> = ({ month, year, transactions }) => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

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

  const dayData = selectedDay ? getTransactionsForDay(selectedDay) : [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700">
      {/* Grade Principal do Calendário */}
      <div className="flex-1 bg-white rounded-[40px] md:rounded-[56px] shadow-4xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="py-6 text-center text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-slate-100 gap-[1px]">
          {days.map((day, idx) => {
            const dayTx = getTransactionsForDay(day);
            const isCurrentMonth = day.getMonth() === monthIndex;
            const isCurrentToday = isToday(day);
            const isDayWeekend = isWeekend(day);
            const isSelected = selectedDay && isSameDay(day, selectedDay);

            const totalIncomes = dayTx.filter(t => t.type === 'Receita').reduce((acc, t) => acc + t.value, 0);
            const totalExpenses = dayTx.filter(t => t.type === 'Despesa').reduce((acc, t) => acc + t.value, 0);
            
            return (
              <div 
                key={idx} 
                onClick={() => setSelectedDay(day)}
                className={`min-h-[120px] md:min-h-[160px] p-2 md:p-4 transition-all duration-300 cursor-pointer overflow-hidden relative group
                  ${isCurrentMonth ? (isDayWeekend ? 'bg-slate-50/50' : 'bg-white') : 'bg-slate-100/10 opacity-20'}
                  ${isSelected ? 'ring-2 ring-inset ring-indigo-500 z-10' : 'hover:bg-indigo-50/30'}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs md:text-sm font-black font-mono 
                    ${isCurrentToday ? 'bg-indigo-600 text-white w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-[14px] shadow-lg' : 'text-slate-400'}
                  `}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Indicadores Visuais de Fluxo */}
                <div className="space-y-1 mt-auto">
                  {totalIncomes > 0 && (
                    <div className="h-1 md:h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-full animate-in slide-in-from-left duration-1000"></div>
                    </div>
                  )}
                  {totalExpenses > 0 && (
                    <div className="h-1 md:h-1.5 w-full bg-rose-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 w-full animate-in slide-in-from-left duration-1000 delay-200"></div>
                    </div>
                  )}
                </div>

                {/* Preview de Texto para Desktop */}
                <div className="hidden md:block mt-3 space-y-1">
                   {dayTx.slice(0, 2).map(t => (
                     <div key={t.id} className={`text-[8px] font-black uppercase truncate px-2 py-1 rounded-lg border ${t.type === 'Receita' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                       {t.description}
                     </div>
                   ))}
                   {dayTx.length > 2 && (
                     <div className="text-[7px] font-black text-slate-300 uppercase pl-1">+{dayTx.length - 2} itens</div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Painel Lateral de Detalhes Diários */}
      <div className={`lg:w-96 space-y-6 ${!selectedDay ? 'hidden lg:block' : 'block animate-in slide-in-from-right duration-500'}`}>
        {selectedDay ? (
          <div className="bg-white p-8 rounded-[40px] shadow-4xl border border-slate-200 flex flex-col h-full min-h-[500px]">
            <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-6">
              <div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tighter">
                  {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
                </h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lançamentos do Dia</p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="p-2 bg-slate-50 text-slate-400 rounded-full lg:hidden"><X size={20}/></button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pr-1">
              {dayData.length > 0 ? (
                dayData.map(tx => (
                  <div key={tx.id} className="bg-slate-50 p-5 rounded-[28px] border border-slate-200 flex flex-col gap-4 group hover:bg-white hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start">
                      <div className={`p-2.5 rounded-xl ${tx.type === 'Receita' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {tx.type === 'Receita' ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}
                      </div>
                      <span className={`text-[13px] font-black font-mono tracking-tighter ${tx.type === 'Receita' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {tx.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-tight line-clamp-2">{tx.description}</h5>
                      <div className="flex items-center gap-4 mt-3">
                         <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase">
                            <Clock size={10} /> {tx.situation}
                         </div>
                         {tx.situation === 'PAGO' && <CheckCircle2 size={12} className="text-emerald-500" />}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
                  <Activity size={48} className="text-slate-300 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Nenhum fluxo registrado</p>
                </div>
              )}
            </div>
            
            {dayData.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex justify-between items-center bg-slate-950 p-6 rounded-[24px] text-white">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Total do Dia</span>
                  <span className="text-lg font-black font-mono tracking-tighter">
                    {(dayData.reduce((acc, t) => t.type === 'Receita' ? acc + t.value : acc - t.value, 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[40px] shadow-4xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center h-full min-h-[500px]">
             <div className="p-8 bg-slate-50 rounded-full text-slate-200 mb-6">
                <Tag size={48} strokeWidth={1} />
             </div>
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] leading-relaxed">Selecione um dia<br/>para auditar os fluxos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
