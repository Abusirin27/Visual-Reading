
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Play, Pause, RotateCcw, Edit3, BookOpen, Keyboard, Layers, ChevronDown, Menu, Library, Globe, ExternalLink, ScrollText, User as UserIcon, LogOut, Settings2, Zap, Sparkles, X, Book, Coffee, Download, Monitor, Laptop } from 'lucide-react';
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
  
  // Feedback State
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  
  // New States
  const [shortcuts, setShortcuts] = useState<ShortcutMap>(DEFAULT_SHORTCUTS);
  
  // Modal/Menu States
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isExternalMenuOpen, setIsExternalMenuOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Pomodoro State
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>('focus');

  // Stats State
  const [sessions, setSessions] = useState<ReadingSession[]>([]);

  // Auth States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Translation Helper
  const t = TRANSLATIONS[lang];

  // Helper to show transient feedback (large numbers)
  const triggerFeedback = useCallback((msg: string) => {
    setFeedbackMessage(null); 
    setTimeout(() => setFeedbackMessage(msg), 0);
  }, []);

  // Sync brightness setting to CSS variable for Fullscreen support
  useEffect(() => {
    document.documentElement.style.setProperty('--app-brightness', `${settings.brightness}%`);
  }, [settings.brightness]);

  // Load User Session and Stats on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    const storedSessions = localStorage.getItem('reading_sessions');
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }
  }, []);

  // --- EXTENSION LOGIC: Grab Selected Text ---
  useEffect(() => {
    // Check if running in a Chrome extension environment with Tab permissions
    // @ts-ignore
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting) {
      try {
        // @ts-ignore
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          if (activeTab?.id) {
            // @ts-ignore
            chrome.scripting.executeScript({
              target: { tabId: activeTab.id },
              func: () => window.getSelection()?.toString() || ''
            }, (results: any[]) => {
              if (results && results[0] && results[0].result) {
                const selectedText = results[0].result.trim();
                if (selectedText.length > 0) {
                  setInputText(selectedText);
                  setMode('read'); // Or keep 'edit' if you want user to review first
                  triggerFeedback(lang === 'ar' ? 'تم استيراد النص المحدد' : 'Selected text imported');
                }
              }
            });
          }
        });
      } catch (e) {
        console.warn("Not running as extension or missing permissions", e);
      }
    }
  }, [lang, triggerFeedback]);


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

  // Record Session Logic
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

  // Split text into words
  const words = useMemo(() => {
    return inputText.trim().split(/\s+/).filter(w => w.length > 0);
  }, [inputText]);

  // Timer logic
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

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, settings.wpm, words.length, currentIndex]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(-1);
  }, []);

  const handleSeek = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Unified Playback Request Handler (Used by Toggle and Pomodoro)
  const requestPlayback = useCallback((shouldPlay: boolean) => {
    if (shouldPlay) {
      // Check if we are in Edit mode
      if (mode === 'edit') {
        setMode('read');
        handleReset();
        setTimeout(() => setIsPlaying(true), 50);
        return;
      }
      
      // Check if finished
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

  const togglePlay = useCallback(() => {
    requestPlayback(!isPlaying);
  }, [requestPlayback, isPlaying]);

  const updateSettings = useCallback((newSettings: Partial<ReaderSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Fullscreen Helper for Reader Only
  const toggleReaderFullscreen = () => {
    const el = document.getElementById('reader-container');
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(err => {
        console.error(`Error enabling reader fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  const toggleAppFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error enabling app fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  // Handle Enter key in textarea to start reading
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      requestPlayback(true);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;
      if (isShortcutsOpen) return; // Don't trigger if shortcuts modal is open

      const key = e.key;
      const lowerKey = key.toLowerCase();

      // Helper to check match case-insensitively for letters, exact for others
      const matches = (targetKey: string) => {
        if (targetKey.length === 1 && targetKey.toLowerCase() !== targetKey.toUpperCase()) {
           return lowerKey === targetKey.toLowerCase();
        }
        return key === targetKey;
      };

      if (matches(shortcuts.togglePlay)) {
        e.preventDefault();
        togglePlay();
      } else if (matches(shortcuts.reset)) {
        e.preventDefault();
        handleReset();
      } else if (matches(shortcuts.prevWord)) {
        e.preventDefault();
        setCurrentIndex(prev => Math.max(-1, prev - 1));
      } else if (matches(shortcuts.nextWord)) {
        e.preventDefault();
        setCurrentIndex(prev => Math.min(words.length - 1, prev + 1));
      } else if (matches(shortcuts.incFontSize)) {
        const newSize = Math.min(150, settings.fontSize + 2); 
        updateSettings({ fontSize: newSize });
        triggerFeedback(`${newSize}`);
      } else if (matches(shortcuts.decFontSize)) {
        const newSize = Math.max(12, settings.fontSize - 2);
        updateSettings({ fontSize: newSize });
        triggerFeedback(`${newSize}`);
      } else if (matches(shortcuts.incSpeed)) {
        const newSpeed = Math.min(1000, settings.wpm + 20);
        updateSettings({ wpm: newSpeed });
        triggerFeedback(`${newSpeed}`);
      } else if (matches(shortcuts.decSpeed)) {
        const newSpeed = Math.max(60, settings.wpm - 20);
        updateSettings({ wpm: newSpeed });
        triggerFeedback(`${newSpeed}`);
      } else if (matches(shortcuts.toggleFullscreenApp)) {
        e.preventDefault();
        toggleAppFullscreen();
      } else if (matches(shortcuts.toggleFullscreenReader)) {
        e.preventDefault();
        toggleReaderFullscreen();
      } else if (matches(shortcuts.incBrightness)) {
        e.preventDefault();
        const newVal = Math.min(150, settings.brightness + 5);
        updateSettings({ brightness: newVal });
        triggerFeedback(`${newVal}%`);
      } else if (matches(shortcuts.decBrightness)) {
        e.preventDefault();
        const newVal = Math.max(10, settings.brightness - 5);
        updateSettings({ brightness: newVal });
        triggerFeedback(`${newVal}%`);
      } else if (matches(shortcuts.nextFont)) {
        e.preventDefault();
        const currentIndex = ARABIC_FONTS.findIndex(f => f.family === settings.fontFamily);
        const nextIndex = (currentIndex + 1) % ARABIC_FONTS.length;
        const nextFont = ARABIC_FONTS[nextIndex];
        updateSettings({ fontFamily: nextFont.family });
        triggerFeedback(nextFont.name);
      } else if (matches(shortcuts.nextColor)) {
        e.preventDefault();
        const currentIndex = TEXT_COLORS.findIndex(c => c.value === settings.textColor);
        const nextIndex = (currentIndex + 1) % TEXT_COLORS.length;
        const nextColor = TEXT_COLORS[nextIndex];
        updateSettings({ textColor: nextColor.value });
        triggerFeedback(nextColor.name);
      } else if (matches(shortcuts.incGlow)) {
        e.preventDefault();
        const newVal = Math.min(50, settings.glowIntensity + 5);
        updateSettings({ glowIntensity: newVal });
        triggerFeedback(`${newVal}`);
      } else if (matches(shortcuts.decGlow)) {
        e.preventDefault();
        const newVal = Math.max(0, settings.glowIntensity - 5);
        updateSettings({ glowIntensity: newVal });
        triggerFeedback(`${newVal}`);
      } else if (matches(shortcuts.toggleBold)) {
        e.preventDefault();
        const newVal = !settings.isBold;
        updateSettings({ isBold: newVal });
        triggerFeedback(newVal ? (lang === 'ar' ? 'غامق' : 'Bold') : (lang === 'ar' ? 'عادي' : 'Normal'));
      } else if (matches(shortcuts.toggleLang)) {
        e.preventDefault();
        setLang(prev => prev === 'ar' ? 'en' : 'ar');
        triggerFeedback(lang === 'ar' ? 'English' : 'عربي');
      } else if (matches(shortcuts.nextMode)) {
        e.preventDefault();
        const currentIndex = ALL_READING_MODES.indexOf(settings.readingMode);
        const nextIndex = (currentIndex + 1) % ALL_READING_MODES.length;
        const nextMode = ALL_READING_MODES[nextIndex];
        updateSettings({ readingMode: nextMode });
        triggerFeedback(t.modes[nextMode as keyof typeof t.modes]);
      } else if (matches(shortcuts.toggleEdit)) {
        e.preventDefault();
        setMode(prev => prev === 'read' ? 'edit' : 'read');
      } else if (matches(shortcuts.clearText)) {
        if (mode === 'edit') {
           e.preventDefault();
           setInputText('');
           handleReset();
           triggerFeedback(lang === 'ar' ? 'تم مسح النص' : 'Text Cleared');
        }
      } else if (matches(shortcuts.togglePomodoro)) {
        e.preventDefault();
        setIsPomodoroOpen(prev => !prev);
      } else if (matches(shortcuts.toggleLibrary)) {
        e.preventDefault();
        setIsExternalMenuOpen(prev => !prev);
      } else if (matches(shortcuts.toggleShortcuts)) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      } else if (matches(shortcuts.toggleStats)) {
        e.preventDefault();
        setIsStatsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, settings, updateSettings, words.length, shortcuts, isShortcutsOpen, triggerFeedback, handleReset, lang, t.modes, mode, isPomodoroOpen, isExternalMenuOpen]);

  const progressPercentage = useMemo(() => {
    if (words.length === 0) return 0;
    return Math.min(100, Math.max(0, ((currentIndex + 1) / words.length) * 100));
  }, [currentIndex, words.length]);

  return (
    <div 
      className={`flex flex-col h-screen bg-background text-slate-200 font-sans transition-[filter] duration-200 ${lang === 'ar' ? 'text-lg' : ''}`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      
      {/* Break Time Overlay */}
      {(pomodoroMode === 'short' || pomodoroMode === 'long') && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center text-center animate-in fade-in duration-500 backdrop-blur-sm">
           <Coffee size={80} className="text-amber-500 mb-6 animate-bounce" />
           <h2 className="text-4xl font-bold text-white mb-4">{t.pomodoro.breakTime}</h2>
           <p className="text-slate-400 text-xl mb-8">{t.pomodoro.relax}</p>
           
           <button 
             onClick={() => setPomodoroMode('focus')}
             className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition-all border border-slate-600"
           >
             {t.pomodoro.skipBreak}
           </button>
        </div>
      )}

      {/* Header */}
      <header className="flex-none h-14 md:h-16 bg-surface/90 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-2 md:px-4 z-30 sticky top-0 shadow-lg">
        {/* Left Section: Brand & Auth */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-primary">
            <BookOpen size={24} />
          </div>
          <div className="hidden md:flex flex-col justify-center">
             <h1 className="text-lg font-bold text-white leading-none">
               {t.appTitle}
             </h1>
          </div>
          
          {/* Lang Toggle */}
          <button
            onClick={() => setLang(prev => prev === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 px-2 py-0.5 ml-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors border border-slate-700 rounded"
          >
             <Globe size={12} />
             <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
          
          {/* Login Button - Moved Here */}
          {currentUser ? (
             <div className="relative">
               <button 
                 onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                 className="flex items-center gap-2 pl-1 pr-1 rounded-full hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all p-1"
               >
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
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
                     <button
                        onClick={handleLogout}
                        className="w-full text-start px-4 py-2 flex items-center gap-2 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                     >
                       <LogOut size={16} />
                       {t.auth.logout}
                     </button>
                   </div>
                 </>
               )}
             </div>
           ) : (
             <button
               onClick={() => setIsAuthModalOpen(true)}
               className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/50"
               title={t.auth.login}
             >
               <UserIcon size={20} />
             </button>
           )}
        </div>
        
        {/* Right Section: Controls */}
        <div className="flex items-center gap-1.5 md:gap-3">

           {/* External Resources Menu */}
           <div className="relative">
              <button
                onClick={() => setIsExternalMenuOpen(!isExternalMenuOpen)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  isExternalMenuOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={t.library}
              >
                <Menu size={20} />
              </button>
              
              {isExternalMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsExternalMenuOpen(false)} />
                  <div className="absolute top-full rtl:left-0 ltr:right-0 mt-2 w-56 bg-surface border border-slate-700 rounded-xl shadow-xl z-20 py-1 animate-in fade-in slide-in-from-top-2">
                      {/* Turath */}
                      <button
                        onClick={() => {
                          window.open('https://app.turath.io/', '_blank');
                          setIsExternalMenuOpen(false);
                        }}
                        className="w-full text-start px-4 py-3 flex items-center gap-3 hover:bg-slate-700 text-slate-300 transition-colors border-b border-slate-700/50"
                      >
                        <Library size={18} className="text-emerald-500"/>
                        <span className="font-medium text-sm">{t.menu.turath}</span>
                      </button>

                      {/* Quran */}
                      <button
                        onClick={() => {
                          window.open('https://tafsir.app/1/1', '_blank');
                          setIsExternalMenuOpen(false);
                        }}
                        className="w-full text-start px-4 py-3 flex items-center gap-3 hover:bg-slate-700 text-slate-300 transition-colors border-b border-slate-700/50"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 21C12 21 7 20 3 21V5C7 3 12 3 12 3" fill="#4ade80" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 21C12 21 17 20 21 21V5C17 3 12 3 12 3" fill="#f87171" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 3V21" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="font-medium text-sm">{t.menu.quran}</span>
                      </button>

                      {/* Dorar */}
                      <button
                        onClick={() => {
                          window.open('https://dorar.net/', '_blank');
                          setIsExternalMenuOpen(false);
                        }}
                        className="w-full text-start px-4 py-3 flex items-center gap-3 hover:bg-slate-700 text-slate-300 transition-colors border-b border-slate-700/50"
                      >
                        <ExternalLink size={18} className="text-blue-400"/>
                        <span className="font-medium text-sm">{t.menu.dorar}</span>
                      </button>
                  </div>
                </>
              )}
           </div>

           {/* Pomodoro Timer */}
           <PomodoroTimer 
              lang={lang} 
              isPlaying={isPlaying} 
              onRequestPlayback={requestPlayback}
              isOpen={isPomodoroOpen}
              onToggle={() => setIsPomodoroOpen(!isPomodoroOpen)}
              mode={pomodoroMode}
              onModeChange={setPomodoroMode}
           />
           
           {/* Statistics */}
           <button
            onClick={() => setIsStatsOpen(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={t.statistics.title}
           >
             <Sparkles size={20} />
           </button>

           <div className="h-6 w-px bg-slate-700/50 mx-1 hidden md:block" />

           {/* Shortcuts - Hidden on Mobile */}
           <button
            onClick={() => setIsShortcutsOpen(true)}
            className={`hidden md:flex w-9 h-9 rounded-lg items-center justify-center transition-colors ${
              isShortcutsOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={t.shortcuts}
          >
            <Keyboard size={20} />
          </button>

           <div className="h-6 w-px bg-slate-700/50 mx-1 hidden md:block" />

            {/* Reading Mode Selector */}
            <div className="relative">
              <button
                onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Layers size={18} className="text-primary" />
                <span className="hidden lg:inline capitalize">
                    {t.modes[settings.readingMode as keyof typeof t.modes] || settings.readingMode}
                </span>
                <ChevronDown size={14} className={`transition-transform ${isModeMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Mode Dropdown - Fixed Below Header */}
              {isModeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px]" onClick={() => setIsModeMenuOpen(false)} />
                  <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] max-w-[95vw] bg-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[60] overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">

                    {/* Decorative Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-amber-500/5 pointer-events-none" />

                    <div className="relative grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x md:divide-slate-700/50 rtl:divide-x-reverse max-h-[80vh] overflow-y-auto">

                      {/* Standard Column (8 items) */}
                      <div className="p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                          <div className="p-1.5 rounded-lg bg-primary/10">
                             <Layers size={16} />
                          </div>
                          <span className="text-sm font-bold uppercase tracking-wider">{t.modes.standard}</span>
                        </div>
                        <div className="grid gap-2">
                          {[
                            { id: 'typewriter', label: t.modes.typewriter },
                            { id: 'rsvp', label: t.modes.rsvp },
                            { id: 'highlight', label: t.modes.highlight },
                            { id: 'dim', label: t.modes.dim },
                            { id: 'boxed', label: t.modes.boxed },
                            { id: 'underline', label: t.modes.underline },
                            { id: 'marker', label: t.modes.marker },
                            { id: 'thick', label: t.modes.thick }
                          ].map((m) => (
                            <button
                              key={m.id}
                              onClick={() => { updateSettings({ readingMode: m.id as ReadingMode }); setIsModeMenuOpen(false); }}
                              className={`group relative p-2.5 rounded-xl border text-start transition-all duration-200 overflow-hidden ${
                                settings.readingMode === m.id
                                  ? 'bg-primary/10 border-primary/50 text-primary shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                                  : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-100'
                              }`}
                            >
                               <div className="relative z-10 flex items-center justify-between">
                                  <span className="font-medium text-sm">{m.label}</span>
                                  {settings.readingMode === m.id && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_currentColor]" />}
                               </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Creative Column (8 items) */}
                      <div className="p-5 flex flex-col gap-3 bg-gradient-to-b from-purple-500/5 to-transparent">
                        <div className="flex items-center gap-2 mb-2 text-purple-400">
                           <div className="p-1.5 rounded-lg bg-purple-500/10">
                             <Sparkles size={16} />
                          </div>
                          <span className="text-sm font-bold uppercase tracking-wider">{t.modes.creative}</span>
                        </div>
                         <div className="grid gap-2">
                          {[
                            { id: 'spotlight', label: t.modes.spotlight },
                            { id: 'magnify', label: t.modes.magnify },
                            { id: 'scroller', label: t.modes.scroller },
                            { id: 'karaoke', label: t.modes.karaoke },
                            { id: 'bounce', label: t.modes.bounce },
                            { id: 'pulse', label: t.modes.pulse },
                            { id: 'spread', label: t.modes.spread },
                            { id: 'shake', label: t.modes.shake }
                          ].map((m) => (
                            <button
                              key={m.id}
                              onClick={() => { updateSettings({ readingMode: m.id as ReadingMode }); setIsModeMenuOpen(false); }}
                              className={`group relative p-2.5 rounded-lg border text-start transition-all duration-200 ${
                                 settings.readingMode === m.id
                                  ? 'bg-purple-500/10 border-purple-500/50 text-purple-300'
                                  : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-purple-500/30 hover:text-purple-200'
                              }`}
                            >
                                <span className="font-medium text-sm">{m.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Experimental Column (8 items) */}
                      <div className="p-5 flex flex-col gap-3 bg-gradient-to-b from-amber-500/5 to-transparent">
                        <div className="flex items-center gap-2 mb-2 text-amber-400">
                           <div className="p-1.5 rounded-lg bg-amber-500/10">
                             <Zap size={16} />
                          </div>
                          <span className="text-sm font-bold uppercase tracking-wider">{t.modes.experimental}</span>
                        </div>
                         <div className="grid gap-2">
                          {[
                            { id: 'blur', label: t.modes.blur },
                            { id: 'wavy', label: t.modes.wavy },
                            { id: 'glitch', label: t.modes.glitch },
                            { id: 'gradient', label: t.modes.gradient },
                            { id: 'outline', label: t.modes.outline },
                            { id: 'neon', label: t.modes.neon },
                            { id: 'mirror', label: t.modes.mirror },
                            { id: 'flash', label: t.modes.flash },
                          ].map((m) => (
                            <button
                              key={m.id}
                              onClick={() => { updateSettings({ readingMode: m.id as ReadingMode }); setIsModeMenuOpen(false); }}
                              className={`group relative p-2.5 rounded-lg border text-start transition-all duration-200 ${
                                 settings.readingMode === m.id
                                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                                  : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-amber-500/30 hover:text-amber-200'
                              }`}
                            >
                                <span className="font-medium text-sm">{m.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Edit Toggle */}
            <button
              onClick={() => setMode(mode === 'read' ? 'edit' : 'read')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                mode === 'edit' 
                  ? 'bg-slate-700 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={mode === 'edit' ? t.close : t.edit}
            >
              {mode === 'edit' ? <Settings2 size={20} /> : <Edit3 size={20} />}
            </button>
            
            {/* Reset */}
            <button
              onClick={handleReset}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={t.reset}
            >
              <RotateCcw size={20} />
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className={`h-9 px-3 md:px-4 rounded-lg font-bold shadow-lg transition-all transform active:scale-95 flex items-center gap-2 ${
                 isPlaying 
                   ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-500/20'
                   : 'bg-primary hover:bg-sky-400 text-slate-900'
              }`}
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              <span className="hidden md:inline">{isPlaying ? t.pause : t.read}</span>
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col min-h-0">
        
        {/* Progress Bar (Global) */}
        <div className="h-1 w-full bg-slate-800">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Dynamic View: Either Editor or Reader */}
        {mode === 'edit' ? (
          <div className="flex-1 w-full h-full p-4 md:p-8 flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full max-w-4xl h-full flex flex-col gap-2">
               <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{t.edit}</label>
               <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  handleReset();
                }}
                onKeyDown={handleTextareaKeyDown}
                dir="auto"
                className="w-full flex-1 bg-surface border border-slate-700 rounded-xl p-4 md:p-6 text-lg md:text-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none leading-relaxed shadow-inner font-sans"
                placeholder={t.pasteText}
              />
              <div className="flex justify-between items-center text-xs text-slate-500">
                 <span>{t.enterHint}</span>
                 <span>{words.length} {t.words}</span>
              </div>
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
          />
        )}
      </main>

      {/* Settings Footer */}
      <SettingsPanel 
        settings={settings} 
        onUpdate={updateSettings}
        onShowFeedback={triggerFeedback}
        className="flex-none" 
        lang={lang}
      />

      {/* Modals */}
      <ShortcutsModal 
        isOpen={isShortcutsOpen} 
        onClose={() => setIsShortcutsOpen(false)}
        shortcuts={shortcuts}
        onUpdateShortcuts={setShortcuts}
        lang={lang}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        lang={lang}
      />
      
      <StatisticsModal 
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        sessions={sessions}
        lang={lang}
      />
    </div>
  );
}

export default App;
