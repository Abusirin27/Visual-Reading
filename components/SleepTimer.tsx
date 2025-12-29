


import React, { useState } from 'react';
import { Moon, Clock, Edit2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface SleepTimerProps {
  lang: Language;
  onSetTimer: (minutes: number | null) => void;
  timeLeft: number | null;
  isOpen: boolean;
  onToggle: () => void;
}

const SleepTimer: React.FC<SleepTimerProps> = ({ lang, onSetTimer, timeLeft, isOpen, onToggle }) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');
  
  const t = TRANSLATIONS[lang].sleepTimer;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelect = (minutes: number | null) => {
    onSetTimer(minutes);
    onToggle();
    setIsCustomMode(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customValue);
    if (!isNaN(mins) && mins > 0) {
      onSetTimer(mins);
      onToggle();
      setIsCustomMode(false);
      setCustomValue('');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
          timeLeft !== null
            ? 'bg-indigo-500/20 text-indigo-400 animate-pulse border border-indigo-500/30'
            : isOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'
        }`}
        title={t.title}
      >
        {timeLeft !== null ? (
           <div className="flex flex-col items-center leading-none">
             <span className="text-[10px] font-bold">{formatTime(timeLeft)}</span>
           </div>
        ) : (
          <Moon size={20} />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute top-full rtl:left-0 ltr:right-0 mt-2 w-48 bg-surface border border-slate-700 rounded-xl shadow-xl z-20 py-1 animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-2 border-b border-slate-700/50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">{t.title}</span>
              <button 
                onClick={() => setIsCustomMode(!isCustomMode)} 
                className={`p-1 rounded hover:bg-slate-700 ${isCustomMode ? 'text-primary' : 'text-slate-500'}`}
                title={t.custom}
              >
                <Edit2 size={12} />
              </button>
            </div>
            
            {isCustomMode ? (
              <form onSubmit={handleCustomSubmit} className="p-4 space-y-2">
                 <input 
                   type="number"
                   value={customValue}
                   onChange={(e) => setCustomValue(e.target.value)}
                   className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-center text-sm focus:outline-none focus:border-primary"
                   placeholder="Min"
                   autoFocus
                   min="1"
                 />
                 <button 
                   type="submit"
                   className="w-full py-1.5 bg-primary text-slate-900 text-xs font-bold rounded hover:bg-sky-400 transition-colors"
                 >
                   {t.set}
                 </button>
              </form>
            ) : (
              <>
                <button onClick={() => handleSelect(15)} className="w-full text-start px-4 py-2.5 flex items-center gap-3 hover:bg-slate-700 text-slate-300 transition-colors">
                  <Clock size={16} className="text-slate-500"/>
                  <span className="text-sm">{t.min15}</span>
                </button>
                <button onClick={() => handleSelect(30)} className="w-full text-start px-4 py-2.5 flex items-center gap-3 hover:bg-slate-700 text-slate-300 transition-colors">
                  <Clock size={16} className="text-slate-500"/>
                  <span className="text-sm">{t.min30}</span>
                </button>
                <button onClick={() => handleSelect(60)} className="w-full text-start px-4 py-2.5 flex items-center gap-3 hover:bg-slate-700 text-slate-300 transition-colors">
                  <Clock size={16} className="text-slate-500"/>
                  <span className="text-sm">{t.min60}</span>
                </button>
              </>
            )}
            
            <div className="border-t border-slate-700/50 my-1"></div>
            
            <button onClick={() => handleSelect(null)} className="w-full text-start px-4 py-2.5 flex items-center gap-3 hover:bg-red-500/10 text-red-400 transition-colors">
              <span className="text-sm font-medium">{t.off}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SleepTimer;