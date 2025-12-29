
import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, Edit2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language, PomodoroMode } from '../types';

interface PomodoroTimerProps {
  lang: Language;
  isPlaying: boolean;
  onRequestPlayback: (play: boolean) => void;
  isOpen: boolean;
  onToggle: () => void;
  mode: PomodoroMode;
  onModeChange: (mode: PomodoroMode) => void;
}

const MODES: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
  custom: 30 * 60
};

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ lang, isPlaying, onRequestPlayback, isOpen, onToggle, mode, onModeChange }) => {
  const [timeLeft, setTimeLeft] = useState(MODES[mode]);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customInput, setCustomInput] = useState('');
  
  const t = TRANSLATIONS[lang].pomodoro;

  useEffect(() => {
    setTimeLeft(MODES[mode]);
    setIsActive(false);
  }, [mode]);

  useEffect(() => {
    if (isPlaying) {
      if (mode === 'short' || mode === 'long') {
        onModeChange('focus');
      } else {
        setIsActive(true);
      }
    } else {
      if (mode === 'focus' || mode === 'custom') {
        setIsActive(false);
      }
    }
  }, [isPlaying, mode, onModeChange]);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play().catch(() => {});

    if (mode === 'focus' || mode === 'custom') {
      onRequestPlayback(false);
      onModeChange('short');
      setTimeout(() => setIsActive(true), 100);
    } else {
      onModeChange('focus');
      onRequestPlayback(true);
    }
  };

  const toggleTimer = () => {
    if (isActive) {
      if (mode === 'focus' || mode === 'custom') {
        onRequestPlayback(false);
      } else {
        setIsActive(false);
      }
    } else {
      if (mode === 'focus' || mode === 'custom') {
        onRequestPlayback(true);
      } else {
        setIsActive(true);
      }
    }
  };
  
  const resetTimer = () => {
    if (mode === 'focus' || mode === 'custom') onRequestPlayback(false);
    setIsActive(false);
    setTimeLeft(MODES[mode]);
  };

  const switchMode = (newMode: PomodoroMode) => {
    if (isPlaying) onRequestPlayback(false);
    onModeChange(newMode);
    setIsEditing(false);
  };

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = parseInt(customInput);
    if (!isNaN(minutes) && minutes > 0) {
      MODES.custom = minutes * 60;
      onModeChange('custom');
      setIsEditing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="relative flex-none">
      <button
        onClick={onToggle}
        className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
          isActive 
            ? 'bg-amber-500/20 text-amber-500 animate-pulse border border-amber-500/30' 
            : isOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
        title={t.title}
      >
        <Timer size={20} />
        {isActive && <span className="text-xs font-mono font-bold hidden xs:inline">{formatTime(timeLeft)}</span>}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[70]" onClick={onToggle} />
          <div className="absolute top-full rtl:left-0 ltr:right-0 mt-2 w-64 bg-surface border border-slate-700 rounded-xl shadow-2xl z-[80] p-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-2">
               <span className="text-sm font-bold text-slate-300">{t.title}</span>
               <div className="flex gap-1">
                 <button onClick={() => switchMode('focus')} className={`p-1.5 rounded transition-colors ${mode === 'focus' ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-300'}`} title={t.focus}><Brain size={16}/></button>
                 <button onClick={() => switchMode('short')} className={`p-1.5 rounded transition-colors ${mode === 'short' ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300'}`} title={t.shortBreak}><Coffee size={16}/></button>
                 <button onClick={() => switchMode('long')} className={`p-1.5 rounded transition-colors ${mode === 'long' ? 'text-blue-500 bg-blue-500/10' : 'text-slate-500 hover:text-slate-300'}`} title={t.longBreak}><Coffee size={18}/></button>
                 <button onClick={() => { setIsEditing(true); setIsActive(false); }} className={`p-1.5 rounded transition-colors ${mode === 'custom' || isEditing ? 'text-amber-500 bg-amber-500/10' : 'text-slate-500 hover:text-slate-300'}`} title={t.custom}><Edit2 size={16}/></button>
               </div>
            </div>

            <div className="text-center mb-6">
              {isEditing ? (
                 <form onSubmit={handleCustomTimeSubmit} className="flex flex-col items-center gap-2">
                   <label className="text-xs text-slate-500">{t.enterTime}</label>
                   <input 
                     type="number" 
                     autoFocus
                     className="w-24 bg-slate-900 border border-slate-600 rounded p-2 text-center text-xl font-mono text-white focus:border-primary outline-none"
                     value={customInput}
                     onChange={(e) => setCustomInput(e.target.value)}
                     placeholder="25"
                     min="1"
                   />
                   <button type="submit" className="w-full mt-2 text-xs bg-primary text-slate-900 py-2 rounded font-bold hover:bg-sky-400 transition-colors">{t.start}</button>
                 </form>
              ) : (
                <>
                  <button onClick={() => { setIsEditing(true); setIsActive(false); }} title={t.custom} className="hover:scale-105 transition-transform group">
                     <div className={`text-4xl font-mono font-bold tracking-widest transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-primary'}`}>
                       {formatTime(timeLeft)}
                     </div>
                  </button>
                  <div className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">
                    {mode === 'focus' ? t.focus : mode === 'short' ? t.shortBreak : mode === 'long' ? t.longBreak : t.custom}
                  </div>
                </>
              )}
            </div>

            {!isEditing && (
              <div className="flex items-center justify-center gap-3">
                 <button
                   onClick={toggleTimer}
                   className={`flex-1 py-2 rounded-lg font-bold text-slate-900 transition-all flex items-center justify-center gap-2 active:scale-95 ${
                     isActive ? 'bg-amber-500 hover:bg-amber-400' : 'bg-primary hover:bg-sky-400'
                   }`}
                 >
                   {isActive ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}
                   <span>{isActive ? t.pause : t.start}</span>
                 </button>
                 <button onClick={resetTimer} className="p-2.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-95" title={t.reset}>
                   <RotateCcw size={20} />
                 </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PomodoroTimer;
