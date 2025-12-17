
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200',
    info: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
  };

  const iconColors = {
    danger: 'bg-rose-100 text-rose-600',
    warning: 'bg-amber-100 text-amber-600',
    info: 'bg-indigo-100 text-indigo-600'
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-md shadow-3xl border border-white/20 overflow-hidden transform animate-in zoom-in-95 duration-300">
        <div className="p-10 text-center">
          <div className={`mx-auto w-20 h-20 rounded-[28px] flex items-center justify-center mb-8 ${iconColors[variant]}`}>
            <AlertTriangle size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4">{title}</h3>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">{message}</p>
          
          <div className="flex gap-4">
            <button 
              onClick={onCancel}
              className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] active:scale-95 ${colors[variant]}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
