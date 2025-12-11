
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
  custom: 30 * 60 // default custom
};

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ lang, isPlaying, onRequestPlayback, isOpen, onToggle, mode, onModeChange }) => {
  const [timeLeft, setTimeLeft] = useState(MODES[mode]);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customInput, setCustomInput] = useState('');
  
  const t = TRANSLATIONS[lang].pomodoro;

  // Reset timer when mode changes from parent
  useEffect(() => {
    setTimeLeft(MODES[mode]);
    setIsActive(false);
  }, [mode]);

  // Sync Timer with App Playback State
  useEffect(() => {
    // If App starts playing
    if (isPlaying) {
      // If we are in a break mode, force switch to focus to read
      if (mode === 'short' || mode === 'long') {
        onModeChange('focus');
        // useEffect above will handle reset
      } else {
        // Start the timer
        setIsActive(true);
      }
    } else {
      // If App stops playing AND we are in focus/custom mode, pause timer
      // We allow break timer to run even if playback is stopped (naturally)
      if (mode === 'focus' || mode === 'custom') {
        setIsActive(false);
      }
    }
  }, [isPlaying, mode, onModeChange]);

  // Timer Tick Logic
  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer Completed
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play().catch(() => {});

    if (mode === 'focus' || mode === 'custom') {
      // Focus Ended -> Stop Reading, Start Short Break
      onRequestPlayback(false); // Stop text
      onModeChange('short');
      // Timer will reset via effect, we need to auto-start it.
      // We can use a short timeout or another effect to auto-start break.
      // Since mode change triggers reset and setIsActive(false), we need a way to auto-start break.
      // Let's use a ref or specific logic.
      setTimeout(() => setIsActive(true), 100);
    } else {
      // Break Ended -> Start Reading (Focus)
      onModeChange('focus');
      onRequestPlayback(true); // Resume text (will also set isActive=true)
    }
  };

  const toggleTimer = () => {
    if (isActive) {
      // User wants to pause
      if (mode === 'focus' || mode === 'custom') {
        onRequestPlayback(false); // Pause text
      } else {
        setIsActive(false); // Just pause break timer
      }
    } else {
      // User wants to start
      if (mode === 'focus' || mode === 'custom') {
        onRequestPlayback(true); // Start text (which starts timer via effect)
      } else {
        setIsActive(true); // Just start break timer
      }
    }
  };
  
  const resetTimer = () => {
    if (mode === 'focus' || mode === 'custom') {
      onRequestPlayback(false);
    }
    setIsActive(false);
    setTimeLeft(MODES[mode]);
  };

  const switchMode = (newMode: PomodoroMode) => {
    // Switching modes manually stops everything
    if (isPlaying) onRequestPlayback(false);
    onModeChange(newMode);
    setIsEditing(false);
    // Timer resets via effect
  };

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = parseInt(customInput);
    if (!isNaN(minutes) && minutes > 0) {
      const seconds = minutes * 60;
      MODES.custom = seconds;
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
    <div className="relative">
      <button
        onClick={onToggle}
        className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
          isActive 
            ? 'bg-amber-500/20 text-amber-500 animate-pulse' 
            : isOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
        title={t.title}
      >
        <Timer size={20} />
        {isActive && <span className="text-xs font-mono font-bold">{formatTime(timeLeft)}</span>}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute top-full rtl:left-0 ltr:right-0 mt-2 w-64 bg-surface border border-slate-700 rounded-xl shadow-xl z-20 p-4 animate-in fade-in slide-in-from-top-2">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-2">
               <span className="text-sm font-bold text-slate-300">{t.title}</span>
               <div className="flex gap-1">
                 {/* Mode Icons */}
                 <button onClick={() => switchMode('focus')} className={`p-1 rounded ${mode === 'focus' ? 'text-primary bg-primary/10' : 'text-slate-500'}`} title={t.focus}><Brain size={14}/></button>
                 <button onClick={() => switchMode('short')} className={`p-1 rounded ${mode === 'short' ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500'}`} title={t.shortBreak}><Coffee size={14}/></button>
                 <button onClick={() => switchMode('long')} className={`p-1 rounded ${mode === 'long' ? 'text-blue-500 bg-blue-500/10' : 'text-slate-500'}`} title={t.longBreak}><Coffee size={16}/></button>
                 <button onClick={() => { setIsEditing(true); setIsActive(false); }} className={`p-1 rounded ${mode === 'custom' || isEditing ? 'text-amber-500 bg-amber-500/10' : 'text-slate-500'}`} title={t.custom}><Edit2 size={14}/></button>
               </div>
            </div>

            {/* Timer Display / Input */}
            <div className="text-center mb-6">
              {isEditing ? (
                 <form onSubmit={handleCustomTimeSubmit} className="flex flex-col items-center gap-2">
                   <label className="text-xs text-slate-500">{t.enterTime}</label>
                   <input 
                     type="number" 
                     autoFocus
                     className="w-20 bg-slate-900 border border-slate-600 rounded p-1 text-center text-xl font-mono text-white"
                     value={customInput}
                     onChange={(e) => setCustomInput(e.target.value)}
                     placeholder="25"
                     min="1"
                   />
                   <button type="submit" className="text-xs bg-primary text-slate-900 px-3 py-1 rounded font-bold">{t.start}</button>
                 </form>
              ) : (
                <>
                  <button onClick={() => { setIsEditing(true); setIsActive(false); }} title={t.custom} className="hover:scale-105 transition-transform">
                     <div className={`text-4xl font-mono font-bold tracking-widest cursor-pointer ${isActive ? 'text-white' : 'text-slate-400'}`}>
                       {formatTime(timeLeft)}
                     </div>
                  </button>
                  <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
                    {mode === 'focus' ? t.focus : mode === 'short' ? t.shortBreak : mode === 'long' ? t.longBreak : t.custom}
                  </div>
                </>
              )}
            </div>

            {/* Controls */}
            {!isEditing && (
              <div className="flex items-center justify-center gap-3">
                 <button
                   onClick={toggleTimer}
                   className={`flex-1 py-2 rounded-lg font-bold text-slate-900 transition-colors flex items-center justify-center gap-2 ${
                     isActive ? 'bg-amber-500 hover:bg-amber-400' : 'bg-primary hover:bg-sky-400'
                   }`}
                 >
                   {isActive ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>}
                   <span>{isActive ? t.pause : t.start}</span>
                 </button>
                 
                 <button
                   onClick={resetTimer}
                   className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                   title={t.reset}
                 >
                   <RotateCcw size={18} />
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
