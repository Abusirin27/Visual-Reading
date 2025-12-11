
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Play, Pause, GripVertical, GripHorizontal } from 'lucide-react';
import { ReaderSettings, Language } from '../types';
import OverlayFeedback from './OverlayFeedback';
import { TRANSLATIONS, ARABIC_FONTS } from '../constants';

interface ReaderDisplayProps {
  words: string[];
  currentIndex: number;
  settings: ReaderSettings;
  feedbackMessage: string | null;
  lang: Language;
  onSeek?: (index: number) => void;
  onTogglePlay?: () => void;
  isPlaying?: boolean;
}

const ReaderDisplay: React.FC<ReaderDisplayProps> = ({ words, currentIndex, settings, feedbackMessage, lang, onSeek, onTogglePlay, isPlaying = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentWordRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  // State for Progress Bar Visibility
  const [showProgressBar, setShowProgressBar] = useState(true);
  const fadeTimer = useRef<number | null>(null);

  // State for Fullscreen detection
  const [isFullscreen, setIsFullscreen] = useState(false);

  // State for Window Resizing
  // Initialize to full window size to fill screen by default
  const [boxDimensions, setBoxDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });
  
  // Updated resizing state to include direction multiplier (1 for right/bottom, -1 for left)
  const [isResizing, setIsResizing] = useState<{ axis: 'x' | 'y' | null, direction: number }>({ axis: null, direction: 1 });

  // Mobile Detection
  const [isMobile, setIsMobile] = useState(false);

  // State for Dragging Progress Bar
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);

  const t = TRANSLATIONS[lang].readerBar;

  useEffect(() => {
    // Basic mobile detection based on window width
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setBoxDimensions({ width: window.innerWidth, height: window.innerHeight });
      } else {
        setIsMobile(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Stats Calculations
  const stats = useMemo(() => {
    const totalWords = words.length;
    const currentProcessed = Math.max(0, currentIndex + 1);
    
    const percentage = totalWords > 0 
      ? Math.round((currentProcessed / totalWords) * 100) 
      : 0;

    const remainingWords = Math.max(0, totalWords - currentProcessed);

    const secondsRemaining = settings.wpm > 0 
      ? Math.ceil((remainingWords / settings.wpm) * 60) 
      : 0;

    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return {
      percentage,
      remainingWords,
      totalWords,
      timeString: formatTime(secondsRemaining)
    };
  }, [words.length, currentIndex, settings.wpm]);

  // Handle Seek Logic
  const handleSeekInternal = (clientX: number) => {
    if (!progressBarRef.current || !onSeek || stats.totalWords <= 1) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const width = rect.width;
    const x = clientX - rect.left;
    
    // RTL: 0% is at the right edge, 100% at left edge.
    const normalizedPos = x / width;
    
    let percentage = 1 - normalizedPos;
    percentage = Math.max(0, Math.min(1, percentage));
    
    const newIndex = Math.floor(percentage * (stats.totalWords - 1));
    onSeek(newIndex);
  };

  const handleMouseDownProgress = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSeekInternal(e.clientX);
    setIsDraggingProgress(true);
  };
  
  const handleTouchStartProgress = (e: React.TouchEvent) => {
    e.stopPropagation();
    handleSeekInternal(e.touches[0].clientX);
    setIsDraggingProgress(true);
  }

  // Global mouse/touch listeners for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingProgress) {
        e.preventDefault();
        handleSeekInternal(e.clientX);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingProgress) {
        e.preventDefault();
        handleSeekInternal(e.touches[0].clientX);
      }
    };
    const handleMouseUp = () => {
      setIsDraggingProgress(false);
    };

    if (isDraggingProgress) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingProgress, stats.totalWords, onSeek]);


  // Handle Visibility of Controls
  useEffect(() => {
    const handleActivity = () => {
      setShowProgressBar(true);
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
      fadeTimer.current = window.setTimeout(() => setShowProgressBar(false), 3000);
    };
    handleActivity();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity); 
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    };
  }, []);

  // Fullscreen Change Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Window Resize Logic
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.axis) return;
      e.preventDefault();

      if (isResizing.axis === 'x') {
        const delta = e.movementX * 2 * isResizing.direction;
        const newWidth = Math.max(300, Math.min(window.innerWidth, boxDimensions.width + delta));
        setBoxDimensions(prev => ({ ...prev, width: newWidth }));
      } else if (isResizing.axis === 'y') {
        const delta = e.movementY * isResizing.direction;
        setBoxDimensions(prev => ({ ...prev, height: Math.max(200, prev.height + delta) }));
      }
    };

    const handleMouseUp = () => {
      setIsResizing({ axis: null, direction: 1 });
    };

    if (isResizing.axis) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isMobile, boxDimensions]);

  // Auto-scroll logic
  useEffect(() => {
    const mode = settings.readingMode;
    const shouldScrollToEnd = ['typewriter'].includes(mode);
    const shouldScrollToCenter = [
      'highlight', 'spotlight', 'magnify', 'scroller', 'karaoke', 'bounce', 'pulse',
      'blur', 'wavy', 'glitch', 'gradient', 'outline',
      'neon', 'mirror', 'spread', 'flash', 'dim',
      'boxed', 'underline', 'marker', 'thick', 'shake'
    ].includes(mode);

    if (shouldScrollToEnd) {
      if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else if (shouldScrollToCenter) {
       if (currentWordRef.current) currentWordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex, words, settings.readingMode]);

  const isRTL = true; 

  const isQuranicFont = useMemo(() => {
    const font = ARABIC_FONTS.find(f => f.family === settings.fontFamily);
    return font?.isQuranic;
  }, [settings.fontFamily]);

  const textStyle = {
    fontFamily: settings.fontFamily,
    fontSize: `${settings.fontSize}px`,
    fontWeight: settings.isBold ? 700 : 400,
    color: settings.textColor,
    textShadow: settings.glowIntensity > 0 ? `0 0 ${settings.glowIntensity}px ${settings.textColor}, 0 0 ${settings.glowIntensity * 2}px ${settings.textColor}` : 'none',
    lineHeight: isQuranicFont ? '2.5' : '1.8',
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (onTogglePlay) {
      onTogglePlay();
    }
  };

  const renderContent = () => {
    // 1. RSVP Mode (Single Word)
    if (settings.readingMode === 'rsvp') {
      const currentWord = words[currentIndex] || "";
      return (
        <div className="flex items-center justify-center h-full w-full min-h-[50vh]">
           <span 
              className="transition-all duration-100 animate-in fade-in zoom-in-50"
              style={{...textStyle, fontSize: `${settings.fontSize * 2}px`, color: settings.highlightColor}}
            >
              {currentWord}
            </span>
        </div>
      );
    }

    // 2. Teleprompter
    if (settings.readingMode === 'scroller') {
      return (
        <div className="flex flex-col items-center py-[40vh] gap-4">
          {words.map((word, index) => (
             <span
              key={index}
              ref={index === currentIndex ? currentWordRef : null}
              className={`transition-all duration-300 ${
                index === currentIndex ? 'scale-125 font-bold opacity-100' : 'scale-90 opacity-40'
              }`}
              style={{
                ...textStyle,
                color: index === currentIndex ? settings.highlightColor : '#475569',
                textShadow: index === currentIndex && settings.glowIntensity > 0 ? `0 0 ${settings.glowIntensity}px ${settings.highlightColor}` : 'none'
              }}
             >
               {word}
             </span>
          ))}
        </div>
      );
    }

    // Standard & New Modes
    return (
      <div className="transition-all duration-300" style={textStyle}>
        {words.map((word, index) => {
          let className = "inline-block mx-1 transition-all duration-200 ";
          const isCurrent = index === currentIndex;
          const isPast = index < currentIndex;
          
          let wordColor = settings.textColor;
          let wordOpacity = 1;
          let wordBlur = '0';
          let wordScale = '1';
          let wordTranslateY = '0';
          let wordTransform = 'none';
          
          const highlight = settings.highlightColor;
          const specialStyles: React.CSSProperties = {};

          switch (settings.readingMode) {
            case 'highlight':
              if (!isCurrent) { wordOpacity = 0.4; wordBlur = '0.5px'; wordColor = '#64748b'; }
              else { wordScale = '1.1'; wordColor = highlight; }
              break;
            case 'spotlight':
               if (!isCurrent) { wordOpacity = 0.2; wordBlur = '4px'; wordColor = '#475569'; wordScale = '0.95'; }
               else { wordScale = '1.1'; wordColor = highlight; }
               break;
            case 'magnify':
              if (isCurrent) { wordScale = '1.7'; wordColor = highlight; }
              else { wordOpacity = 0.8; wordColor = '#94a3b8'; }
              break;
            case 'karaoke':
              if (isCurrent) { wordColor = highlight; wordScale = '1.1'; } 
              else if (isPast) { wordColor = settings.textColor; }
              else { wordColor = '#334155'; wordOpacity = 0.5; }
              break;
            case 'bounce':
               if (index > currentIndex) return null;
               if (isCurrent) { 
                 className += " animate-bounce"; 
                 wordColor = highlight;
               } else {
                 wordColor = settings.textColor;
               }
               break;
            case 'pulse':
               if (index > currentIndex) return null;
               if (isCurrent) { 
                 className += " animate-pulse scale-110"; 
                 wordColor = highlight; 
               }
               else { wordOpacity = 0.8; wordColor = settings.textColor; }
               break;
            
            case 'blur':
               if (isCurrent) { 
                 wordColor = highlight; 
                 wordScale = '1.1';
               } else {
                 wordBlur = '4px';
                 wordOpacity = 0.4;
               }
               break;
            case 'wavy':
               if (index > currentIndex) return null;
               if (isCurrent) {
                 wordTransform = 'translateY(-10px)'; 
                 wordColor = highlight;
               } else {
                 wordTransform = 'translateY(0)';
               }
               break;
            case 'glitch':
               if (index > currentIndex) return null;
               if (isCurrent) {
                 wordTransform = 'skew(-10deg) scale(1.1)';
                 wordColor = highlight;
                 wordOpacity = 0.9;
               }
               break;
            case 'gradient':
               if (index > currentIndex) return null;
               break;
            case 'outline':
               if (index > currentIndex) return null;
               if (isCurrent) { wordColor = 'transparent'; }
               break;

            case 'dim':
               if (index > currentIndex) return null;
               if (isCurrent) {
                 wordColor = highlight;
                 wordScale = '1.05';
               } else {
                 wordOpacity = 0.05; 
                 wordColor = settings.textColor;
               }
               break;
            case 'flash':
               if (index > currentIndex) return null;
               if (isCurrent) {
                 wordColor = highlight;
                 className += " animate-pulse duration-75"; 
               }
               break;
            case 'spread':
               if (index > currentIndex) return null;
               if (isCurrent) {
                 wordColor = highlight;
                 specialStyles.letterSpacing = '0.2em';
                 wordScale = '1.1';
               }
               break;
            case 'mirror':
                if (index > currentIndex) return null;
                if (isCurrent) {
                  wordColor = highlight;
                  specialStyles.WebkitBoxReflect = 'below 0px linear-gradient(transparent, rgba(0,0,0,0.5))';
                }
                break;
            case 'neon':
                if (index > currentIndex) return null;
                if (isCurrent) {
                  wordColor = highlight;
                  specialStyles.textShadow = `0 0 5px #fff, 0 0 10px #fff, 0 0 20px ${highlight}, 0 0 35px ${highlight}, 0 0 50px ${highlight}`;
                }
                break;
            
            case 'boxed':
                if (index > currentIndex) return null;
                if (isCurrent) {
                    wordColor = highlight;
                    specialStyles.border = `2px solid ${highlight}`;
                    specialStyles.padding = '0px 4px';
                    specialStyles.borderRadius = '4px';
                }
                break;
            case 'underline':
                if (index > currentIndex) return null;
                if (isCurrent) {
                    wordColor = highlight;
                    specialStyles.textDecoration = 'underline';
                    specialStyles.textDecorationThickness = '3px';
                    specialStyles.textUnderlineOffset = '4px';
                }
                break;
            case 'marker':
                if (index > currentIndex) return null;
                if (isCurrent) {
                    wordColor = settings.textColor;
                    specialStyles.backgroundColor = `${highlight}80`; 
                    specialStyles.borderRadius = '2px';
                    specialStyles.padding = '0 2px';
                }
                break;
            case 'thick':
                if (index > currentIndex) return null;
                if (isCurrent) {
                    wordColor = highlight;
                    specialStyles.fontWeight = '900';
                }
                break;
            case 'shake':
                if (index > currentIndex) return null;
                if (isCurrent) {
                    wordColor = highlight;
                    className += " animate-pulse";
                }
                break;

            case 'typewriter':
            default:
               if (index > currentIndex) return null; 
               if (isCurrent) { 
                 wordScale = '1.05'; 
                 wordColor = highlight; 
               }
               else { 
                 wordOpacity = 0.9; 
                 wordColor = settings.textColor; 
               }
               break;
          }

          const useGlow = settings.glowIntensity > 0 && (isCurrent || ['typewriter', 'karaoke', 'wavy', 'glitch'].includes(settings.readingMode));

          if (settings.readingMode === 'gradient' && isCurrent) {
             specialStyles.backgroundImage = `linear-gradient(45deg, ${highlight}, ${settings.textColor})`;
             specialStyles.backgroundClip = 'text';
             specialStyles.WebkitBackgroundClip = 'text';
             specialStyles.color = 'transparent';
          }

          if (settings.readingMode === 'outline' && isCurrent) {
             specialStyles.WebkitTextStroke = `1px ${highlight}`;
          }

          return (
            <span 
              key={index} 
              ref={isCurrent ? currentWordRef : null}
              className={className}
              style={{
                color: wordColor,
                opacity: wordOpacity,
                filter: `blur(${wordBlur})`,
                transform: wordTransform !== 'none' ? wordTransform : `scale(${wordScale}) translateY(${wordTranslateY})`,
                textShadow: settings.readingMode !== 'neon' ? (useGlow ? `0 0 ${settings.glowIntensity}px ${wordColor}, 0 0 ${settings.glowIntensity * 2}px ${wordColor}` : 'none') : specialStyles.textShadow,
                ...specialStyles
              }}
            >
              {word}
            </span>
          );
        })}
        {(settings.readingMode === 'typewriter') && (
           <span className="inline-block w-1 h-[1em] bg-primary ml-1 animate-pulse align-middle translate-y-[10%]" />
        )}
        <div ref={bottomRef} className="h-32 w-full" />
      </div>
    );
  };

  return (
    <div className="flex-1 w-full bg-slate-900/50 relative flex flex-col items-center justify-center p-0">
      
      {/* Resizable Sizing Wrapper (Logical Container) */}
      <div 
        id="reader-container"
        ref={containerRef}
        onClick={handleContainerClick}
        className="relative transition-all duration-300 group/container"
        style={{
          width: isMobile ? '100%' : boxDimensions.width,
          height: isMobile ? '100%' : boxDimensions.height,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        {/* Visual Content Box (Inner) */}
        <div 
           className="absolute inset-0 overflow-hidden md:rounded-xl border-x-0 md:border border-slate-700 shadow-inner flex flex-col transition-colors duration-300"
           style={{
             backgroundColor: settings.backgroundColor,
             direction: isRTL ? 'rtl' : 'ltr',
             textAlign: settings.readingMode === 'rsvp' || settings.readingMode === 'scroller' ? 'center' : settings.textAlign,
           }}
        >
            {/* Scrollable Content Area */}
            <div className={`flex-1 w-full h-full overflow-y-auto overflow-x-hidden pt-6 pb-20 no-scrollbar scroll-smooth ${isFullscreen ? 'px-6 md:px-24' : 'px-4 md:px-6'}`}>
               {renderContent()}
            </div>
            
            <OverlayFeedback message={feedbackMessage} />

            {/* Main Horizontal Progress Bar */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className={`absolute bottom-0 left-0 right-0 z-40 px-0 transition-opacity duration-500 md:rounded-b-xl overflow-hidden cursor-auto ${showProgressBar ? 'opacity-100' : 'opacity-0'}`}
            >
                <div className="w-full">
                   <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 pb-2 pt-1 px-4 md:px-6 flex items-center justify-between gap-4 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                      
                      <div className="flex items-center gap-3">
                        <button 
                           onClick={onTogglePlay}
                           className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-slate-900 transition-all flex items-center justify-center"
                           title="Toggle Play"
                        >
                           {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                        </button>

                        <div className="flex flex-col items-start min-w-[60px] md:min-w-[80px]">
                            <div className="font-mono text-xs flex gap-1">
                              <span className="text-white font-bold">{stats.remainingWords}</span>
                              <span className="text-slate-600">/</span>
                              <span className="text-slate-500">{stats.totalWords}</span>
                            </div>
                        </div>
                      </div>
                      
                      <div 
                        ref={progressBarRef}
                        className="flex-1 relative h-6 flex items-center mx-2 group cursor-pointer" 
                        dir="rtl"
                        onMouseDown={handleMouseDownProgress}
                        onTouchStart={handleTouchStartProgress}
                      >
                          <div className="absolute left-0 right-0 h-1 bg-slate-800 rounded-full overflow-hidden group-hover:h-2 transition-all">
                             <div className="h-full bg-primary" style={{ width: `${stats.percentage}%` }} />
                          </div>
                          
                          <div 
                              className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-slate-900 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-transform duration-100 ease-linear z-10 border border-slate-700 group-hover:scale-110 ${isDraggingProgress ? 'scale-125 cursor-grabbing' : 'cursor-grab'}`}
                              style={{ right: `calc(${stats.percentage}% - 1rem)` }} 
                          >
                              <span className="text-[9px] font-bold text-white relative z-10 select-none">{stats.percentage}%</span>
                              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
                                  <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                                  <path className="text-primary transition-all duration-300 ease-linear" strokeDasharray={`${stats.percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                          </div>
                       </div>
                      <div className="hidden md:flex flex-col items-end min-w-[60px]">
                          <span className="font-mono text-primary font-bold text-sm">{stats.timeString}</span>
                      </div>
                   </div>
                </div>
            </div>
        </div>

        {/* --- Resize Handles (External Buttons) --- */}
        {!isFullscreen && !isMobile && (
          <>
            {/* Right Handle (Maximize/Resize Width) */}
            <div 
               className="absolute top-1/2 -translate-y-1/2 right-0 h-16 w-4 cursor-col-resize z-50 flex items-center justify-center bg-slate-800 border border-slate-600 rounded-l-lg shadow-lg hover:bg-primary hover:border-primary transition-colors active:scale-95 group/handle opacity-0 group-hover/container:opacity-100"
               onMouseDown={(e) => { e.stopPropagation(); setIsResizing({ axis: 'x', direction: 1 }); }}
               title="Resize Width"
            >
               <div className="h-6 w-1 bg-slate-500 rounded-full group-hover/handle:bg-white transition-colors" />
            </div>
            
            {/* Left Handle (Maximize/Resize Width) */}
            <div 
               className="absolute top-1/2 -translate-y-1/2 left-0 h-16 w-4 cursor-col-resize z-50 flex items-center justify-center bg-slate-800 border border-slate-600 rounded-r-lg shadow-lg hover:bg-primary hover:border-primary transition-colors active:scale-95 group/handle opacity-0 group-hover/container:opacity-100"
               onMouseDown={(e) => { e.stopPropagation(); setIsResizing({ axis: 'x', direction: -1 }); }}
               title="Resize Width"
            >
               <div className="h-6 w-1 bg-slate-500 rounded-full group-hover/handle:bg-white transition-colors" />
            </div>

            {/* Bottom Handle (Maximize/Resize Height) */}
            <div 
               className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-4 cursor-row-resize z-50 flex items-center justify-center bg-slate-800 border border-slate-600 rounded-t-lg shadow-lg hover:bg-primary hover:border-primary transition-colors active:scale-95 group/handle opacity-0 group-hover/container:opacity-100"
               onMouseDown={(e) => { e.stopPropagation(); setIsResizing({ axis: 'y', direction: 1 }); }}
               title="Resize Height"
            >
               <div className="w-6 h-1 bg-slate-500 rounded-full group-hover/handle:bg-white transition-colors" />
            </div>
          </>
        )}
      </div>
      
      <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
    </div>
  );
};

export default ReaderDisplay;
