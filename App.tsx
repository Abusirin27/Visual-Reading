
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Play, Pause, RotateCcw, Edit3, BookOpen, Keyboard, Layers, ChevronDown, Menu, Library, Globe, ExternalLink, ScrollText, User as UserIcon, LogOut, Settings2, Zap, Sparkles, X, Book, Coffee, Download, Monitor, Laptop, Maximize, Minimize, Heart, CreditCard, Send, MessageCircle, Mail, Expand, Shrink, Search } from 'lucide-react';
import SettingsPanel from './components/SettingsPanel';
import ReaderDisplay from './components/ReaderDisplay';
import ShortcutsModal from './components/ShortcutsModal';
import PomodoroTimer from './components/PomodoroTimer';
import StatisticsModal from './components/StatisticsModal';
import DonateModal from './components/DonateModal';
import { DEFAULT_SETTINGS, SAMPLE_TEXT, DEFAULT_SHORTCUTS, TRANSLATIONS, ARABIC_FONTS, TEXT_COLORS, ALL_READING_MODES, ESSENTIAL_COLORS } from './constants';
import { ReaderSettings, ShortcutMap, ReadingMode, Language, ReadingSession, PomodoroMode } from './types';

function App() {
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<'edit' | 'read'>('read');
  const [lang, setLang] = useState<Language>('ar');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showUI, setShowUI] = useState(true);
  
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [shortcuts, setShortcuts] = useState<ShortcutMap>(DEFAULT_SHORTCUTS);
  
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>('focus');
  const [sessions, setSessions] = useState<ReadingSession[]>([]);

  const uiTimeoutRef = useRef<number | null>(null);
  const t = TRANSLATIONS[lang];

  // Logic to hide distracting elements when settings or modals are active
  const isAnyModalOpen = useMemo(() => 
    isShortcutsOpen || isStatsOpen || isDonateOpen || isColorMenuOpen || isLibraryOpen || isPomodoroOpen, 
  [isShortcutsOpen, isStatsOpen, isDonateOpen, isColorMenuOpen, isLibraryOpen, isPomodoroOpen]);

  // Auto-hide UI logic for Focus Mode
  useEffect(() => {
    const handleMouseMove = () => {
      if (!isFocusMode) {
        setShowUI(true);
        return;
      }
      setShowUI(true);
      if (uiTimeoutRef.current) window.clearTimeout(uiTimeoutRef.current);
      uiTimeoutRef.current = window.setTimeout(() => {
        if (isFocusMode && isPlaying && !isAnyModalOpen) setShowUI(false);
      }, 2500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (uiTimeoutRef.current) window.clearTimeout(uiTimeoutRef.current);
    };
  }, [isFocusMode, isPlaying, isAnyModalOpen]);

  const socialLinks = useMemo(() => [
    { name: 'Telegram', icon: Send, url: 'https://t.me/Abusirin1445', hoverColor: 'hover:text-[#0088cc]', tooltip: lang === 'ar' ? 'تليجرام: @Abusirin1445' : 'Telegram: @Abusirin1445' },
    { name: 'WhatsApp', icon: MessageCircle, url: 'https://wa.me/218916451806', hoverColor: 'hover:text-[#25D366]', tooltip: lang === 'ar' ? 'واتساب: 0916451806' : 'WhatsApp: 0916451806' },
    { name: 'Email', icon: Mail, url: 'mailto:abusirinprogrammer@gmail.com', hoverColor: 'hover:text-[#EA4335]', tooltip: 'abusirinprogrammer@gmail.com' },
  ], [lang]);

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
          setSessions(prev => [...prev, newSession]);
        }
        sessionStartTime.current = null;
      }
    }
  }, [isPlaying]);

  const words = useMemo(() => inputText.trim().split(/\s+/).filter(w => w.length > 0), [inputText]);

  const timeRemainingString = useMemo(() => {
    const remainingWords = Math.max(0, words.length - (currentIndex + 1));
    const seconds = settings.wpm > 0 ? Math.ceil((remainingWords / settings.wpm) * 60) : 0;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }, [words.length, currentIndex, settings.wpm]);

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
    triggerFeedback(lang === 'ar' ? 'إعادة تشغيل' : 'Restarted');
  }, [lang, triggerFeedback]);

  const handleSeek = useCallback((index: number) => { setCurrentIndex(index); }, []);
  const requestPlayback = useCallback((shouldPlay: boolean) => {
    if (shouldPlay) {
      if (mode === 'edit') {
        setMode('read');
        setCurrentIndex(-1);
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 50);
        return;
      }
      if (currentIndex >= words.length - 1) { 
        setCurrentIndex(-1);
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 10); 
      }
      else { setIsPlaying(true); }
    } else { setIsPlaying(false); }
  }, [mode, currentIndex, words.length]);

  const togglePlay = useCallback(() => requestPlayback(!isPlaying), [requestPlayback, isPlaying]);
  const updateSettings = useCallback((newSettings: Partial<ReaderSettings>) => { setSettings(prev => ({ ...prev, ...newSettings })); }, []);
  
  const toggleAppFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  const toggleFocusMode = useCallback(() => {
    const nextVal = !isFocusMode;
    setIsFocusMode(nextVal);
    // Immediately hide toolbars when Focus Mode is activated
    setShowUI(!nextVal);
    triggerFeedback(nextVal ? (lang === 'ar' ? 'نمط التركيز المباشر' : 'Direct Focus Mode') : (lang === 'ar' ? 'النمط العادي' : 'Normal Mode'));
  }, [isFocusMode, lang, triggerFeedback]);

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); requestPlayback(true); }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;
      if (isShortcutsOpen) return;
      const key = e.key;
      const lowerKey = key.toLowerCase();
      const matches = (targetKey: string) => targetKey.length === 1 && targetKey.toLowerCase() !== targetKey.toUpperCase() ? lowerKey === targetKey.toLowerCase() : key === targetKey;
      
      if (matches(shortcuts.togglePlay)) { e.preventDefault(); togglePlay(); }
      else if (matches(shortcuts.reset)) { e.preventDefault(); handleReset(); }
      else if (matches(shortcuts.prevWord)) { e.preventDefault(); setCurrentIndex(prev => Math.max(-1, prev - 1)); }
      else if (matches(shortcuts.nextWord)) { e.preventDefault(); setCurrentIndex(prev => Math.min(words.length - 1, prev + 1)); }
      else if (matches(shortcuts.incFontSize)) { const newSize = Math.min(150, settings.fontSize + 2); updateSettings({ fontSize: newSize }); triggerFeedback(`${newSize}`); }
      else if (matches(shortcuts.decFontSize)) { const newSize = Math.max(12, settings.fontSize - 2); updateSettings({ fontSize: newSize }); triggerFeedback(`${newSize}`); }
      else if (matches(shortcuts.incSpeed)) { const newSpeed = Math.min(1000, settings.wpm + 20); updateSettings({ wpm: newSpeed }); triggerFeedback(`${newSpeed}`); }
      else if (matches(shortcuts.decSpeed)) { const newSpeed = Math.max(60, settings.wpm - 20); updateSettings({ wpm: newSpeed }); triggerFeedback(`${newSpeed}`); }
      else if (matches(shortcuts.toggleFullscreenApp)) { e.preventDefault(); toggleAppFullscreen(); }
      else if (matches(shortcuts.toggleFullscreenReader)) { e.preventDefault(); toggleFocusMode(); }
      else if (matches(shortcuts.incBrightness)) { e.preventDefault(); const newVal = Math.min(150, settings.brightness + 5); updateSettings({ brightness: newVal }); triggerFeedback(`${newVal}%`); }
      else if (matches(shortcuts.decBrightness)) { e.preventDefault(); const newVal = Math.max(10, settings.brightness - 5); updateSettings({ brightness: newVal }); triggerFeedback(`${newVal}%`); }
      else if (matches(shortcuts.nextFont)) { e.preventDefault(); const curIdx = ARABIC_FONTS.findIndex(f => f.family === settings.fontFamily); const nextIdx = (curIdx + 1) % ARABIC_FONTS.length; updateSettings({ fontFamily: ARABIC_FONTS[nextIdx].family }); triggerFeedback(ARABIC_FONTS[nextIdx].name); }
      else if (matches(shortcuts.nextColor)) { e.preventDefault(); const curIdx = ESSENTIAL_COLORS.findIndex(c => c.value === settings.textColor); const nextIdx = (curIdx + 1) % ESSENTIAL_COLORS.length; updateSettings({ textColor: ESSENTIAL_COLORS[nextIdx].value }); triggerFeedback(ESSENTIAL_COLORS[nextIdx].name); }
      else if (matches(shortcuts.nextHighlightColor)) { e.preventDefault(); const curIdx = ESSENTIAL_COLORS.findIndex(c => c.value === settings.highlightColor); const nextIdx = (curIdx + 1) % ESSENTIAL_COLORS.length; updateSettings({ highlightColor: ESSENTIAL_COLORS[nextIdx].value }); triggerFeedback(`${t.settings.highlightColor}: ${ESSENTIAL_COLORS[nextIdx].name}`); }
      else if (matches(shortcuts.incGlow)) { e.preventDefault(); const newVal = Math.min(50, settings.glowIntensity + 5); updateSettings({ glowIntensity: newVal }); triggerFeedback(`${newVal}`); }
      else if (matches(shortcuts.decGlow)) { e.preventDefault(); const newVal = Math.max(0, settings.glowIntensity - 5); updateSettings({ glowIntensity: newVal }); triggerFeedback(`${newVal}`); }
      else if (matches(shortcuts.toggleBold)) { e.preventDefault(); const newVal = !settings.isBold; updateSettings({ isBold: newVal }); triggerFeedback(newVal ? (lang === 'ar' ? 'غامق' : 'Bold') : (lang === 'ar' ? 'عادي' : 'Normal')); }
      else if (matches(shortcuts.toggleLang)) { e.preventDefault(); setLang(prev => prev === 'ar' ? 'en' : 'ar'); triggerFeedback(lang === 'ar' ? 'English' : 'عربي'); }
      else if (matches(shortcuts.nextMode)) { e.preventDefault(); const curIdx = ALL_READING_MODES.indexOf(settings.readingMode); const nextIdx = (curIdx + 1) % ALL_READING_MODES.length; updateSettings({ readingMode: ALL_READING_MODES[nextIdx] }); triggerFeedback(t.modes[ALL_READING_MODES[nextIdx] as keyof typeof t.modes]); }
      else if (matches(shortcuts.toggleEdit)) { e.preventDefault(); setMode(prev => prev === 'read' ? 'edit' : 'read'); }
      else if (matches(shortcuts.clearText)) { if (mode === 'edit') { e.preventDefault(); setInputText(''); setCurrentIndex(-1); setIsPlaying(false); triggerFeedback(lang === 'ar' ? 'تم مسح النص' : 'Text Cleared'); } }
      else if (matches(shortcuts.togglePomodoro)) { e.preventDefault(); setIsPomodoroOpen(prev => !prev); }
      else if (matches(shortcuts.toggleLibrary)) { e.preventDefault(); setIsLibraryOpen(prev => !prev); }
      else if (matches(shortcuts.toggleShortcuts)) { e.preventDefault(); setIsShortcutsOpen(prev => !prev); }
      else if (matches(shortcuts.toggleStats)) { e.preventDefault(); setIsStatsOpen(prev => !prev); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, settings, updateSettings, words.length, shortcuts, isShortcutsOpen, triggerFeedback, handleReset, lang, t.modes, mode, isPomodoroOpen, isLibraryOpen, toggleFocusMode, t.settings.highlightColor]);

  const progressPercentage = useMemo(() => words.length === 0 ? 0 : Math.min(100, Math.max(0, ((currentIndex + 1) / words.length) * 100)), [currentIndex, words.length]);

  return (
    <div className={`relative flex flex-col h-screen bg-background text-slate-200 font-sans transition-all duration-300 ${lang === 'ar' ? 'text-lg' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {(pomodoroMode === 'short' || pomodoroMode === 'long') && (
        <div className="fixed inset-0 z-[400] bg-black/95 flex flex-col items-center justify-center text-center backdrop-blur-sm">
           <Coffee size={80} className="text-amber-500 mb-6 animate-bounce" />
           <h2 className="text-4xl font-bold text-white mb-4">{t.pomodoro.breakTime}</h2>
           <p className="text-slate-400 text-xl mb-8">{t.pomodoro.relax}</p>
           <button onClick={() => setPomodoroMode('focus')} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition-all border border-slate-600">{t.pomodoro.skipBreak}</button>
        </div>
      )}

      {/* Header: Absolute when in Focus Mode */}
      <header className={`transition-all duration-500 bg-surface/90 backdrop-blur-md border-b border-slate-700 flex items-center justify-between shadow-lg px-2 md:px-4 ${
        isFocusMode 
          ? 'absolute top-0 left-0 right-0 z-[200] h-14 md:h-16' 
          : 'relative z-[200] flex-none h-14 md:h-16'
      } ${isFocusMode && !showUI ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <div className="flex-none flex items-center gap-1.5 md:gap-3 bg-surface shrink-0">
          <button 
            onClick={handleReset}
            className="flex items-center gap-1.5 md:gap-3 group active:scale-95 transition-transform"
            title={lang === 'ar' ? 'إعادة تشغيل البرنامج' : 'Restart Program'}
          >
            <div className="bg-gradient-to-br from-lime-400 to-emerald-500 p-1.5 rounded-lg text-slate-900 shadow-[0_0_20px_rgba(163,230,53,0.6)] group-hover:shadow-[0_0_30px_rgba(163,230,53,0.8)] transition-all">
              <BookOpen size={18} className="md:w-6 md:h-6" />
            </div>
            <div className="hidden xs:flex flex-col justify-center">
               <h1 className="text-sm md:text-lg font-black bg-clip-text text-transparent bg-gradient-to-br from-lime-400 to-emerald-500 leading-none truncate max-w-[60px] md:max-w-none tracking-tight drop-shadow-[0_0_10px_rgba(163,230,53,0.4)]">
                 {t.appTitle}
               </h1>
            </div>
          </button>
          
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={() => setIsDonateOpen(true)} 
              className="relative flex items-center gap-1.5 px-4 py-2 text-[11px] md:text-xs font-black uppercase tracking-widest bg-gradient-to-br from-lime-400 to-emerald-500 hover:brightness-110 text-slate-900 transition-all rounded-full shadow-[0_0_20px_rgba(163,230,53,0.5)] active:scale-95 group overflow-hidden border border-white/20"
            >
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-50" />
               <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 blur-sm rounded-t-full" />
               <CreditCard size={14} className="group-hover:rotate-12 transition-transform relative z-10 drop-shadow-md" />
               <span className="relative z-10 drop-shadow-md font-bold text-black">{t.donate}</span>
               <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            </button>

            <div className="hidden sm:flex items-center gap-1 md:gap-2 px-2 border-x border-slate-700/50">
              {socialLinks.map((link) => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className={`p-1.5 text-slate-400 transition-all active:scale-90 ${link.hoverColor}`} title={link.tooltip}><link.icon size={18} /></a>
              ))}
            </div>
          </div>

          <button onClick={() => setLang(prev => prev === 'ar' ? 'en' : 'ar')} className="flex items-center gap-1 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors border border-slate-700 rounded ml-1">
             <Globe size={10} /><span>{lang === 'ar' ? 'EN' : 'ع'}</span>
          </button>
          
          <div className="relative">
            <button onClick={() => setIsLibraryOpen(!isLibraryOpen)} className={`w-8 h-8 md:w-9 md:h-9 flex-none rounded-lg flex items-center justify-center transition-all ${isLibraryOpen ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`} title={t.library}>
              <Library size={18} />
            </button>
            {isLibraryOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsLibraryOpen(false)} />
                <div className="absolute top-full rtl:right-0 ltr:left-0 mt-2 w-56 bg-surface/95 backdrop-blur-lg border border-slate-700 rounded-xl shadow-2xl z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                   <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700/50">{t.library}</div>
                   <a href="https://turath.io/" target="_blank" rel="noopener noreferrer" className="w-full text-start px-4 py-3 flex items-center justify-between hover:bg-primary/10 text-slate-200 transition-all group">
                     <div className="flex items-center gap-3">
                       <ScrollText size={16} className="text-primary group-hover:scale-110 transition-transform" />
                       <span className="text-sm font-bold">{t.menu.turath}</span>
                     </div>
                     <ExternalLink size={12} className="text-slate-500" />
                   </a>
                   <a href="https://dorar.net/" target="_blank" rel="noopener noreferrer" className="w-full text-start px-4 py-3 flex items-center justify-between hover:bg-primary/10 text-slate-200 transition-all group">
                     <div className="flex items-center gap-3">
                       <Search size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                       <span className="text-sm font-bold">{t.menu.dorar}</span>
                     </div>
                     <ExternalLink size={12} className="text-slate-500" />
                   </a>
                   <a href="https://furqan.co/" target="_blank" rel="noopener noreferrer" className="w-full text-start px-4 py-3 flex items-center justify-between hover:bg-primary/10 text-slate-200 transition-all group">
                     <div className="flex items-center gap-3">
                       <Book size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
                       <span className="text-sm font-bold">{t.menu.quran}</span>
                     </div>
                     <ExternalLink size={12} className="text-slate-500" />
                   </a>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-end overflow-visible px-1 md:px-2">
          <div className="flex items-center gap-0.5 md:gap-2">
             <button onClick={toggleAppFullscreen} className={`w-8 h-8 md:w-9 md:h-9 flex-none rounded-lg flex items-center justify-center transition-all ${isFullscreen ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`} title={lang === 'ar' ? 'ملء شاشة التطبيق' : 'App Fullscreen'}>
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
             </button>
             <PomodoroTimer lang={lang} isPlaying={isPlaying} onRequestPlayback={requestPlayback} isOpen={isPomodoroOpen} onToggle={() => setIsPomodoroOpen(!isPomodoroOpen)} mode={pomodoroMode} onModeChange={setPomodoroMode} />
             <button onClick={() => setIsStatsOpen(!isStatsOpen)} className={`w-8 h-8 md:w-9 md:h-9 flex-none rounded-lg flex items-center justify-center transition-colors ${isStatsOpen ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`} title={t.statistics.title}><Sparkles size={18} /></button>
             <button onClick={() => setIsShortcutsOpen(!isShortcutsOpen)} className={`w-8 h-8 md:w-9 md:h-9 flex-none rounded-lg flex items-center justify-center transition-colors ${isShortcutsOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`} title={t.shortcuts}><Keyboard size={18} /></button>
             <button onClick={() => setMode(mode === 'read' ? 'edit' : 'read')} className={`w-8 h-8 md:w-9 md:h-9 flex-none rounded-lg flex items-center justify-center transition-all ${mode === 'edit' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{mode === 'edit' ? <Settings2 size={18} /> : <Edit3 size={18} />}</button>
             <button 
                onClick={togglePlay} 
                className={`h-9 md:h-11 flex-none px-3 md:px-5 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95 shadow-lg ${
                  isPlaying 
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900 hover:brightness-110 shadow-[0_0_25px_rgba(245,158,11,0.7)] animate-pulse' 
                    : 'bg-gradient-to-br from-lime-400 to-emerald-500 text-slate-900 hover:brightness-110 shadow-[0_0_30px_rgba(163,230,53,0.7)]'
                }`}
             >
               {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
               <div className="flex flex-col items-start justify-center leading-none">
                 <span className="text-xs md:text-sm font-black">{isPlaying ? t.pause : t.read}</span>
                 {currentIndex > -1 && (
                   <span className="text-[9px] md:text-[10px] font-mono mt-0.5 opacity-90">{timeRemainingString}</span>
                 )}
               </div>
             </button>
          </div>
        </div>
      </header>

      <main className={`relative transition-all duration-500 flex flex-col ${isFocusMode ? 'h-full w-full' : 'flex-1 min-h-0'}`}>
        {/* Top Global Progress Bar - Now reacts to isAnyModalOpen */}
        <div className={`h-1 w-full bg-slate-800 transition-all duration-500 ${((isFocusMode && !showUI) || isAnyModalOpen) ? 'opacity-0 scale-y-0' : 'opacity-100 scale-y-100'} z-[210] ${isFocusMode ? 'absolute top-0 md:top-0' : ''}`}>
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
          <ReaderDisplay 
            words={words} 
            currentIndex={currentIndex} 
            settings={settings} 
            feedbackMessage={feedbackMessage} 
            lang={lang} 
            onSeek={handleSeek} 
            onTogglePlay={togglePlay} 
            isPlaying={isPlaying} 
            isFocusMode={isFocusMode}
            showUI={showUI}
            isAnyModalOpen={isAnyModalOpen}
          />
        )}
      </main>

      <div className={`transition-all duration-500 transform ${
        isFocusMode 
          ? 'absolute bottom-0 left-0 right-0 z-[200]' 
          : 'relative flex-none'
      } ${isFocusMode && !showUI ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <SettingsPanel 
          settings={settings} 
          onUpdate={updateSettings} 
          onShowFeedback={triggerFeedback} 
          className="flex-none" 
          lang={lang} 
          isFocusMode={isFocusMode} 
          onToggleFocusMode={toggleFocusMode} 
          isColorMenuOpen={isColorMenuOpen}
          onToggleColorMenu={setIsColorMenuOpen}
        />
      </div>
      
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} shortcuts={shortcuts} onUpdateShortcuts={setShortcuts} lang={lang} />
      <StatisticsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} localSessions={sessions} lang={lang} />
      <DonateModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} lang={lang} />
    </div>
  );
}

export default App;
