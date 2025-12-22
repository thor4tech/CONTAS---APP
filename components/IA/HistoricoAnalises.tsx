
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnaliseCompleta } from '../../types';
import ConfirmModal from '../ConfirmModal';
import { Search, Calendar, Zap, Trash2, Edit2, Check, X, ChevronRight, FileText, Download } from 'lucide-react';

interface HistoricoAnalisesProps {
  analises: AnaliseCompleta[];
  onSelectAnalise: (id: string) => void;
  onRenameAnalise: (id: string, novoNome: string) => void;
  onDeleteAnalise: (id: string) => void;
  onExport?: () => void;
}

export const HistoricoAnalises: React.FC<HistoricoAnalisesProps> = ({
  analises,
  onSelectAnalise,
  onRenameAnalise,
  onDeleteAnalise,
  onExport
}) => {
  const [filtro, setFiltro] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [localNome, setLocalNome] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const analisesFiltradas = analises.filter(a => {
    const matchBusca = a.nome.toLowerCase().includes(busca.toLowerCase()) || 
                      a.tags.some(t => t.includes(busca.toLowerCase()));
    const matchFiltro = filtro === 'todos' || a.tags.includes(filtro);
    return matchBusca && matchFiltro;
  });

  const handleStartRename = (e: React.MouseEvent, analise: AnaliseCompleta) => {
    e.stopPropagation();
    setEditandoId(analise.id);
    setLocalNome(analise.nome);
  };

  const handleSaveRename = (id: string) => {
    onRenameAnalise(id, localNome);
    setEditandoId(null);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDeleteAnalise(deleteId);
      setDeleteId(null);
    }
  };

  const getStatusClass = (score: number) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const formatarDataRelativa = (dataStr: string) => {
    const data = new Date(dataStr);
    const agora = new Date();
    const diff = agora.getTime() - data.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (dias === 0) return 'Hoje';
    if (dias === 1) return 'Ontem';
    if (dias < 7) return `${dias} dias atrás`;
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
          <FileText size={16} className="text-indigo-600"/> Histórico de Auditorias
        </h3>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar análises..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
          <select 
            className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-100"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="urgente">Urgentes</option>
            <option value="lucrativo">Lucrativos</option>
            <option value="queda">Queda</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 max-h-[600px]">
        <AnimatePresence mode="popLayout">
          {analisesFiltradas.map((analise, index) => (
            <motion.div
              key={analise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectAnalise(analise.id)}
              className="group bg-white p-5 rounded-[28px] border border-slate-100 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden flex items-center gap-6"
            >
              <div className={`w-1.5 h-12 rounded-full ${getStatusClass(analise.indicadores.saudeGeral)}`} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {editandoId === analise.id ? (
                    <div className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <input 
                        autoFocus
                        className="flex-1 bg-slate-50 border border-indigo-300 rounded-lg px-2 py-1 text-sm font-black outline-none"
                        value={localNome}
                        onChange={e => setLocalNome(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveRename(analise.id)}
                      />
                      <button onClick={() => handleSaveRename(analise.id)} className="p-1 text-emerald-500"><Check size={18}/></button>
                      <button onClick={() => setEditandoId(null)} className="p-1 text-rose-500"><X size={18}/></button>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-[13px] font-black text-slate-900 truncate uppercase tracking-tight">{analise.nome}</h4>
                      <button onClick={e => handleStartRename(e, analise)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-indigo-600 transition-all"><Edit2 size={14}/></button>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Calendar size={12}/> {formatarDataRelativa(analise.data)}</span>
                  <span className="flex items-center gap-1"><Zap size={12}/> {analise.indicadores.indiceFolego}d fôlego</span>
                </div>

                <div className="flex gap-2 mt-3">
                  {analise.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[8px] font-black uppercase text-slate-400 tracking-widest">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                 <button 
                  onClick={e => { e.stopPropagation(); setDeleteId(analise.id); }}
                  className="p-3 bg-rose-50 text-rose-300 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-sm group-hover:shadow-lg"
                 >
                   <Trash2 size={16} />
                 </button>
                 <div className="p-3 bg-slate-50 text-slate-300 group-hover:text-indigo-600 rounded-2xl">
                    <ChevronRight size={16} />
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {analisesFiltradas.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
            <FileText size={48} className="text-slate-300 mb-4" />
            <p className="text-[11px] font-black uppercase tracking-[0.3em]">Nenhuma auditoria encontrada</p>
          </div>
        )}
      </div>

      <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{analisesFiltradas.length} Auditorias</span>
        <button 
          onClick={onExport}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl"
        >
          <Download size={14}/> Exportar Banco
        </button>
      </div>

      <ConfirmModal 
        isOpen={deleteId !== null}
        title="Excluir Auditoria?"
        message="Esta ação é permanente. Todos os diagnósticos e táticas gerados para este período serão perdidos."
        confirmLabel="Sim, Excluir"
        cancelLabel="Manter"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        variant="danger"
      />
    </div>
  );
};
