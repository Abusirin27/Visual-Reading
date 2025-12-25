
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Play, Pause, RotateCcw, Edit3, BookOpen, Keyboard, Layers, ChevronDown, Menu, Library, Globe, ExternalLink, ScrollText, User as UserIcon, LogOut, Settings2, Zap, Sparkles, X, Book, Coffee, Download, Monitor, Laptop, Maximize, Minimize } from 'lucide-react';
import SettingsPanel from './components/SettingsPanel';
import ReaderDisplay from './components/ReaderDisplay';
import ShortcutsModal from './components/ShortcutsModal';
import PomodoroTimer from './components/PomodoroTimer';
import AuthModal from './components/AuthModal';
import StatisticsModal from './components/StatisticsModal';
import { DEFAULT_SETTINGS, SAMPLE_TEXT, DEFAULT_SHORTCUTS, TRANSLATIONS, ARABIC_FONTS, TEXT_COLORS, ALL_READING_MODES } from './constants';
import { ReaderSettings, ShortcutMap, ReadingMode, Language, User, ReadingSession, PomodoroMode } from './types';

function App() {
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<'edit' | 'read'>('read');
  const [lang, setLang] = useState<Language>('ar');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [shortcuts, setShortcuts] = useState<ShortcutMap>(DEFAULT_SHORTCUTS);
  
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isExternalMenuOpen, setIsExternalMenuOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>('focus');
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const t = TRANSLATIONS[lang];

  const triggerFeedback = useCallback((msg: string) => {
    setFeedbackMessage(null); 
    setTimeout(() => setFeedbackMessage(msg), 0);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-brightness', `${settings.brightness}%`);
  }, [settings.brightness]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    const storedSessions = localStorage.getItem('reading_sessions');
    if (storedSessions) setSessions(JSON.parse(storedSessions));
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    triggerFeedback(`${t.auth.welcome} ${user.username}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setIsUserMenuOpen(false);
  };

  const sessionStartTime = useRef<number | null>(null);
  const startWordIndex = useRef<number>(0);

  useEffect(() => {
    if (isPlaying) {
      sessionStartTime.current = Date.now();
      startWordIndex.current = currentIndex;
    } else {
      if (sessionStartTime.current) {
        const duration = (Date.now() - sessionStartTime.current) / 1000;
        const wordsRead = Math.max(0, currentIndex - startWordIndex.current);
        if (wordsRead > 0) {
          const newSession: ReadingSession = {
            id: Date.now().toString(),
            date: Date.now(),
            duration,
            wordsRead,
            wpm: settings.wpm
          };
          const updatedSessions = [...sessions, newSession];
          setSessions(updatedSessions);
          localStorage.setItem('reading_sessions', JSON.stringify(updatedSessions));
        }
        sessionStartTime.current = null;
      }
    }
  }, [isPlaying]);

  const words = useMemo(() => {
    return inputText.trim().split(/\s+/).filter(w => w.length > 0);
  }, [inputText]);

  useEffect(() => {
    let intervalId: number | undefined;
    if (isPlaying) {
      if (currentIndex < words.length - 1) {
        const delay = 60000 / settings.wpm;
        intervalId = window.setInterval(() => {
          setCurrentIndex(prev => {
            if (prev >= words.length - 1) {
              setIsPlaying(false);
              return prev;
            }
            return prev + 1;
          });
        }, delay);
      } else {
        setIsPlaying(false);
      }
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [isPlaying, settings.wpm, words.length, currentIndex]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(-1);
  }, []);

  const handleSeek = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const requestPlayback = useCallback((shouldPlay: boolean) => {
    if (shouldPlay) {
      if (mode === 'edit') {
        setMode('read');
        handleReset();
        setTimeout(() => setIsPlaying(true), 50);
        return;
      }
      if (currentIndex >= words.length - 1) {
        handleReset();
        setTimeout(() => setIsPlaying(true), 10);
      } else {
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(false);
    }
  }, [mode, currentIndex, words.length, handleReset]);

  const togglePlay = useCallback(() => requestPlayback(!isPlaying), [requestPlayback, isPlaying]);

  const updateSettings = useCallback((newSettings: Partial<ReaderSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const toggleAppFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      requestPlayback(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;
      if (isShortcutsOpen) return;
      const key = e.key;
      const lowerKey = key.toLowerCase();
      const matches = (targetKey: string) => {
        if (targetKey.length === 1 && targetKey.toLowerCase() !== targetKey.toUpperCase()) {
           return lowerKey === targetKey.toLowerCase();
        }
        return key === targetKey;
      };
      if (matches(shortcuts.togglePlay)) { e.preventDefault(); togglePlay(); }
      else if (matches(shortcuts.reset)) { e.preventDefault(); handleReset(); }
      else if (matches(shortcuts.prevWord)) { e.preventDefault(); setCurrentIndex(prev => Math.max(-1, prev - 1)); }
      else if (matches(shortcuts.nextWord)) { e.preventDefault(); setCurrentIndex(prev => Math.min(words.length - 1, prev + 1)); }
      else if (matches(shortcuts.incFontSize)) { const newSize = Math.min(150, settings.fontSize + 2); updateSettings({ fontSize: newSize }); triggerFeedback(`${newSize}`); }
      else if (matches(shortcuts.decFontSize)) { const newSize = Math.max(12, settings.fontSize - 2); updateSettings({ fontSize: newSize }); triggerFeedback(`${newSize}`); }
      else if (matches(shortcuts.incSpeed)) { const newSpeed = Math.min(1000, settings.wpm + 20); updateSettings({ wpm: newSpeed }); triggerFeedback(`${newSpeed}`); }
      else if (matches(shortcuts.decSpeed)) { const newSpeed = Math.max(60, settings.wpm - 20); updateSettings({ wpm: newSpeed }); triggerFeedback(`${newSpeed}`); }
      else if (matches(shortcuts.toggleFullscreenApp)) { e.preventDefault(); toggleAppFullscreen(); }
      else if (matches(shortcuts.incBrightness)) { e.preventDefault(); const newVal = Math.min(150, settings.brightness + 5); updateSettings({ brightness: newVal }); triggerFeedback(`${newVal}%`); }
      else if (matches(shortcuts.decBrightness)) { e.preventDefault(); const newVal = Math.max(10, settings.brightness - 5); updateSettings({ brightness: newVal }); triggerFeedback(`${newVal}%`); }
      else if (matches(shortcuts.nextFont)) { e.preventDefault(); const curIdx = ARABIC_FONTS.findIndex(f => f.family === settings.fontFamily); const nextIdx = (curIdx + 1) % ARABIC_FONTS.length; const nextFont = ARABIC_FONTS[nextIdx]; updateSettings({ fontFamily: nextFont.family }); triggerFeedback(nextFont.name); }
      else if (matches(shortcuts.nextColor)) { e.preventDefault(); const curIdx = TEXT_COLORS.findIndex(c => c.value === settings.textColor); const nextIdx = (curIdx + 1) % TEXT_COLORS.length; const nextColor = TEXT_COLORS[nextIdx]; updateSettings({ textColor: nextColor.value }); triggerFeedback(nextColor.name); }
      else if (matches(shortcuts.incGlow)) { e.preventDefault(); const newVal = Math.min(50, settings.glowIntensity + 5); updateSettings({ glowIntensity: newVal }); triggerFeedback(`${newVal}`); }
      else if (matches(shortcuts.decGlow)) { e.preventDefault(); const newVal = Math.max(0, settings.glowIntensity - 5); updateSettings({ glowIntensity: newVal }); triggerFeedback(`${newVal}`); }
      else if (matches(shortcuts.toggleBold)) { e.preventDefault(); const newVal = !settings.isBold; updateSettings({ isBold: newVal }); triggerFeedback(newVal ? (lang === 'ar' ? 'غامق' : 'Bold') : (lang === 'ar' ? 'عادي' : 'Normal')); }
      else if (matches(shortcuts.toggleLang)) { e.preventDefault(); setLang(prev => prev === 'ar' ? 'en' : 'ar'); triggerFeedback(lang === 'ar' ? 'English' : 'عربي'); }
      else if (matches(shortcuts.nextMode)) { e.preventDefault(); const curIdx = ALL_READING_MODES.indexOf(settings.readingMode); const nextIdx = (curIdx + 1) % ALL_READING_MODES.length; const nextMode = ALL_READING_MODES[nextIdx]; updateSettings({ readingMode: nextMode }); triggerFeedback(t.modes[nextMode as keyof typeof t.modes]); }
      else if (matches(shortcuts.toggleEdit)) { e.preventDefault(); setMode(prev => prev === 'read' ? 'edit' : 'read'); }
      else if (matches(shortcuts.clearText)) { if (mode === 'edit') { e.preventDefault(); setInputText(''); handleReset(); triggerFeedback(lang === 'ar' ? 'تم مسح النص' : 'Text Cleared'); } }
      else if (matches(shortcuts.togglePomodoro)) { e.preventDefault(); setIsPomodoroOpen(prev => !prev); }
      else if (matches(shortcuts.toggleLibrary)) { e.preventDefault(); setIsExternalMenuOpen(prev => !prev); }
      else if (matches(shortcuts.toggleShortcuts)) { e.preventDefault(); setIsShortcutsOpen(prev => !prev); }
      else if (matches(shortcuts.toggleStats)) { e.preventDefault(); setIsStatsOpen(prev => !prev); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, settings, updateSettings, words.length, shortcuts, isShortcutsOpen, triggerFeedback, handleReset, lang, t.modes, mode, isPomodoroOpen, isExternalMenuOpen]);

  const progressPercentage = useMemo(() => {
    if (words.length === 0) return 0;
    return Math.min(100, Math.max(0, ((currentIndex + 1) / words.length) * 100));
  }, [currentIndex, words.length]);

  return (
    <div className={`flex flex-col h-screen bg-background text-slate-200 font-sans transition-[filter] duration-200 ${lang === 'ar' ? 'text-lg' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {(pomodoroMode === 'short' || pomodoroMode === 'long') && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center text-center backdrop-blur-sm">
           <Coffee size={80} className="text-amber-500 mb-6 animate-bounce" />
           <h2 className="text-4xl font-bold text-white mb-4">{t.pomodoro.breakTime}</h2>
           <p className="text-slate-400 text-xl mb-8">{t.pomodoro.relax}</p>
           <button onClick={() => setPomodoroMode('focus')} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition-all border border-slate-600">
             {t.pomodoro.skipBreak}
           </button>
        </div>
      )}

      <header className="flex-none h-14 md:h-16 bg-surface/90 backdrop-blur-md border-b border-slate-700 flex items-center justify-between z-[90] sticky top-0 shadow-lg">
        {/* Logo Section */}
        <div className="flex-none flex items-center gap-1.5 md:gap-3 px-2 md:px-4 bg-surface z-10 shrink-0">
          <div className="bg-gradient-to-br from-primary to-accent p-1.5 rounded-lg text-slate-900 shadow-lg">
            <BookOpen size={18} className="md:w-6 md:h-6" />
          </div>
          <div className="hidden xs:flex flex-col justify-center">
             <h1 className="text-sm md:text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent leading-none truncate max-w-[60px] md:max-w-none tracking-tight">
               {t.appTitle}
             </h1>
          </div>
          <button onClick={() => setLang(prev => prev === 'ar' ? 'en' : 'ar')} className="flex items-center gap-1 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors border border-slate-700 rounded ml-1">
             <Globe size={10} /><span>{lang === 'ar' ? 'EN' : 'ع'}</span>
          </button>
          
          {currentUser ? (
             <div className="relative">
               <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center p-0.5 rounded-full hover:bg-slate-800 transition-all">
                 <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                   {currentUser.username.charAt(0).toUpperCase()}
                 </div>
               </button>
               {isUserMenuOpen && (
                 <>
                   <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                   <div className="absolute top-full rtl:left-0 ltr:right-0 mt-2 w-48 bg-surface border border-slate-700 rounded-xl shadow-xl z-20 py-1">
                     <div className="px-4 py-2 border-b border-slate-700/50">
                       <div className="text-sm font-bold text-white">{currentUser.username}</div>
                       <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
                     </div>
                     <button onClick={handleLogout} className="w-full text-start px-4 py-2 flex items-center gap-2 text-red-400 hover:bg-red-500/10 transition-colors text-sm">
                       <LogOut size={16} />{t.auth.logout}
                     </button>
                   </div>
                 </>
               )}
             </div>
           ) : (
             <button onClick={() => setIsAuthModalOpen(true)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/50">
               <UserIcon size={16} />
             </button>
           )}
        </div>
        
        {/* Main Controls Section - Right Aligned and Compact for Mobile */}
        <div className="flex-1 flex items-center justify-end overflow-visible px-1 md:px-2">
          <div className="flex items-center gap-0.5 md:gap-2">
             <button onClick={toggleAppFullscreen} className={`w-8 h-8 md:w-9 md:h-9 flex-none rounded-lg flex items-center justify-center transition-all ${isFullscreen ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`} title={t.fullscreen}>
               {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
             </button>

             <div className="relative flex-none">
                <button onClick={() => setIsExternalMenuOpen(!isExternalMenuOpen)} className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center transition-all ${isExternalMenuOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`} title={t.library}>
                  <Menu size={18} />
                </button>
                {isExternalMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsExternalMenuOpen(false)} />
                    <div className="absolute top-full rtl:left-0 ltr:right-0 mt-2 w-56 bg-surface border border-slate-700 rounded-xl shadow-xl z-[100] py-1">
                        <button onClick={() => { window.open('https://app.turath.io/', '_blank'); setIsExternalMenuOpen(false); }} className="w-full text-start px-4 py-3 flex items-center gap-3 hover:bg-slate-700 text-slate-300 transition-colors border-b border-slate-700/50">
                          <Library size={18} className="text-emerald-500"/><span className="font-medium text-sm">{t.menu.turath}</span>
                        </button>
                        <button onClick={() => { window.open('https://tafsir.app/1/1', '_blank'); setIsExternalMenuOpen(false); }} className="w-full text-start px-4 py-3 flex items-center gap-3 hover:bg-slate-700 text-slate-300 transition-colors border-b border-slate-700/50">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21C12 21 7 20 3 21V5C7 3 12 3 12 3" fill="#4ade80" stroke="#166534" strokeWidth="1.5"/><path d="M12 21C12 21 17 20 21 21V5C17 3 12 3 12 3" fill="#f87171" stroke="#991b1b" strokeWidth="1.5"/><path d="M12 3V21" stroke="#fbbf24" strokeWidth="1.5"/></svg>
                          <span className="font-medium text-sm">{t.menu.quran}</span>
                        </button>
                        <button onClick={() => { window.open('https://dorar.net/', '_blank'); setIsExternalMenuOpen(false); }} className="w-full text-start px-4 py-3 flex items-center gap-3 hover:bg-slate-700 text-slate-300 transition-colors">
                          <ExternalLink size={18} className="text-blue-400"/><span className="font-medium text-sm">{t.menu.dorar}</span>
                        </button>
                    </div>
                  </>
                )}
             </div>

             <PomodoroTimer lang={lang} isPlaying={isPlaying} onRequestPlayback={requestPlayback} isOpen={isPomodoroOpen} onToggle={() => setIsPomodoroOpen(!isPomodoroOpen)} mode={pomodoroMode} onModeChange={setPomodoroMode} />
             
             <button onClick={() => setIsStatsOpen(!isStatsOpen)} className={`w-8 h-8 md:w-9 md:h-9 flex-none rounded-lg flex items-center justify-center transition-colors ${isStatsOpen ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`} title={t.statistics.title}>
               <Sparkles size={18} />
             </button>

             <button onClick={() => setIsShortcutsOpen(!isShortcutsOpen)} className={`w-8 h-8 md:w-9 md:h-9 flex-none rounded-lg flex items-center justify-center transition-colors ${isShortcutsOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`} title={t.shortcuts}>
               <Keyboard size={18} />
             </button>

             <div className="relative flex-none">
              <button onClick={() => setIsModeMenuOpen(!isModeMenuOpen)} className="flex items-center gap-1 px-1.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                <Layers size={18} className="text-primary" />
                <ChevronDown size={12} className={`transition-transform ${isModeMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isModeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setIsModeMenuOpen(false)} />
                  <div className="fixed top-16 left-1/2 -translate-x-1/2 w-[800px] max-w-[95vw] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-[100] overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-slate-700 rtl:divide-x-reverse max-h-[80vh] overflow-y-auto">
                      <div className="p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-1 text-primary"><Layers size={16} /><span className="text-xs font-bold uppercase">{t.modes.standard}</span></div>
                        <div className="grid gap-1">{['typewriter','rsvp','highlight','dim','boxed','underline','marker','thick'].map(m => (
                            <button key={m} onClick={() => { updateSettings({ readingMode: m as ReadingMode }); setIsModeMenuOpen(false); }} className={`p-2 rounded-lg border text-start text-sm ${settings.readingMode === m ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-800/30 border-slate-700 text-slate-400'}`}>{t.modes[m as keyof typeof t.modes]}</button>
                        ))}</div>
                      </div>
                      <div className="p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-1 text-purple-400"><Sparkles size={16} /><span className="text-xs font-bold uppercase">{t.modes.creative}</span></div>
                        <div className="grid gap-1">{['spotlight','magnify','scroller','karaoke','bounce','pulse','spread','shake'].map(m => (
                            <button key={m} onClick={() => { updateSettings({ readingMode: m as ReadingMode }); setIsModeMenuOpen(false); }} className={`p-2 rounded-lg border text-start text-sm ${settings.readingMode === m ? 'bg-purple-500/10 border-purple-500 text-purple-300' : 'bg-slate-800/30 border-slate-700 text-slate-400'}`}>{t.modes[m as keyof typeof t.modes]}</button>
                        ))}</div>
                      </div>
                      <div className="p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-1 text-amber-400"><Zap size={16} /><span className="text-xs font-bold uppercase">{t.modes.experimental}</span></div>
                        <div className="grid gap-1">{['blur','wavy','glitch','gradient','outline','neon','mirror','flash'].map(m => (
                            <button key={m} onClick={() => { updateSettings({ readingMode: m as ReadingMode }); setIsModeMenuOpen(false); }} className={`p-2 rounded-lg border text-start text-sm ${settings.readingMode === m ? 'bg-amber-500/10 border-amber-500 text-amber-300' : 'bg-slate-800/30 border-slate-700 text-slate-400'}`}>{t.modes[m as keyof typeof t.modes]}</button>
                        ))}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button onClick={() => setMode(mode === 'read' ? 'edit' : 'read')} className={`w-8 h-8 md:w-9 md:h-9 flex-none rounded-lg flex items-center justify-center transition-all ${mode === 'edit' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              {mode === 'edit' ? <Settings2 size={18} /> : <Edit3 size={18} />}
            </button>
            <button onClick={handleReset} className="w-8 h-8 md:w-9 md:h-9 flex-none rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><RotateCcw size={18} /></button>
            
            {/* Play Button with Gradient */}
            <button 
              onClick={togglePlay} 
              className={`h-8 md:h-9 flex-none px-2.5 md:px-4 rounded-lg font-bold shadow-lg transition-all flex items-center gap-1.5 md:gap-2 active:scale-95 ${
                isPlaying 
                  ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' 
                  : 'bg-gradient-to-r from-primary to-blue-500 text-slate-900 hover:brightness-110'
              }`}
            >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              <span className="hidden sm:inline text-xs md:text-sm">{isPlaying ? t.pause : t.read}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col min-h-0">
        <div className="h-1 w-full bg-slate-800">
          <div className="h-full bg-primary transition-all duration-300 ease-linear" style={{ width: `${progressPercentage}%` }} />
        </div>
        {mode === 'edit' ? (
          <div className="flex-1 w-full h-full p-4 md:p-8 flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full max-w-4xl h-full flex flex-col gap-2">
               <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t.edit}</label>
               <textarea value={inputText} onChange={(e) => { setInputText(e.target.value); handleReset(); }} onKeyDown={handleTextareaKeyDown} dir="auto" className="w-full flex-1 bg-surface border border-slate-700 rounded-xl p-4 md:p-6 text-lg md:text-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none leading-relaxed shadow-inner font-sans" placeholder={t.pasteText} />
               <div className="flex justify-between items-center text-xs text-slate-500"><span>{t.enterHint}</span><span>{words.length} {t.words}</span></div>
            </div>
          </div>
        ) : (
          <ReaderDisplay words={words} currentIndex={currentIndex} settings={settings} feedbackMessage={feedbackMessage} lang={lang} onSeek={handleSeek} onTogglePlay={togglePlay} isPlaying={isPlaying} />
        )}
      </main>

      <SettingsPanel settings={settings} onUpdate={updateSettings} onShowFeedback={triggerFeedback} className="flex-none" lang={lang} />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} shortcuts={shortcuts} onUpdateShortcuts={setShortcuts} lang={lang} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} lang={lang} />
      <StatisticsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} sessions={sessions} lang={lang} />
    </div>
  );
}

export default App;
