
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

interface FloatingInfoProps {
  title: string;
  text: string;
}

export const FloatingInfo: React.FC<FloatingInfoProps> = ({ title, text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Posição fixa baseada na viewport para evitar bugs de container
      setCoords({
        top: rect.top,
        left: rect.left + rect.width / 2
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible]);

  return (
    <>
      <button
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="p-1.5 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0 group/info"
        aria-label={`Informação sobre ${title}`}
      >
        <Info size={14} className="text-slate-300 group-hover/info:text-indigo-500" />
      </button>

      {isVisible && createPortal(
        <div 
          className="fixed z-[9999] -translate-x-1/2 -translate-y-full mb-3 w-64 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{ top: coords.top - 8, left: coords.left }}
        >
          <div className="bg-[#0b1221] text-white p-5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
              <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
                <Info size={12} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</span>
            </div>
            <p className="text-[11px] font-medium leading-relaxed text-slate-300">
              {text}
            </p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-[#0b1221]"></div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
