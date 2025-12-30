
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Play, Pause } from 'lucide-react';
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
  isFocusMode?: boolean;
  showUI?: boolean;
}

const ReaderDisplay: React.FC<ReaderDisplayProps> = ({ 
  words, 
  currentIndex, 
  settings, 
  feedbackMessage, 
  lang, 
  onSeek, 
  onTogglePlay, 
  isPlaying = false,
  isFocusMode = false,
  showUI = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentWordRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  const [isMobile, setIsMobile] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);

  const t = TRANSLATIONS[lang].readerBar;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const stats = useMemo(() => {
    const totalWords = words.length;
    const currentProcessed = Math.max(0, currentIndex + 1);
    const percentage = totalWords > 0 ? Math.round((currentProcessed / totalWords) * 100) : 0;
    const remainingWords = Math.max(0, totalWords - currentProcessed);
    const secondsRemaining = settings.wpm > 0 ? Math.ceil((remainingWords / settings.wpm) * 60) : 0;
    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };
    return { percentage, remainingWords, totalWords, timeString: formatTime(secondsRemaining) };
  }, [words.length, currentIndex, settings.wpm]);

  const handleSeekInternal = (clientX: number) => {
    if (!progressBarRef.current || !onSeek || stats.totalWords <= 1) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = 1 - (x / rect.width);
    percentage = Math.max(0, Math.min(1, percentage));
    onSeek(Math.floor(percentage * (stats.totalWords - 1)));
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { if (isDraggingProgress) handleSeekInternal(e.clientX); };
    const handleTouchMove = (e: TouchEvent) => { if (isDraggingProgress) handleSeekInternal(e.touches[0].clientX); };
    const handleMouseUp = () => setIsDraggingProgress(false);

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
  }, [isDraggingProgress]);

  useEffect(() => {
    const mode = settings.readingMode;
    const shouldScrollToEnd = ['typewriter'].includes(mode);
    const shouldScrollToCenter = !shouldScrollToEnd && settings.readingMode !== 'rsvp';
    if (shouldScrollToEnd && bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    else if (shouldScrollToCenter && currentWordRef.current) currentWordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentIndex, settings.readingMode]);

  const isQuranicFont = useMemo(() => ARABIC_FONTS.find(f => f.family === settings.fontFamily)?.isQuranic, [settings.fontFamily]);

  const textStyle = {
    fontFamily: settings.fontFamily,
    fontSize: `${settings.fontSize}px`,
    fontWeight: settings.isBold ? 700 : 400,
    color: settings.textColor,
    textShadow: settings.glowIntensity > 0 ? `0 0 ${settings.glowIntensity}px ${settings.textColor}, 0 0 ${settings.glowIntensity * 2}px ${settings.textColor}` : 'none',
    lineHeight: isQuranicFont ? '2.5' : '1.8',
  };

  const renderContent = () => {
    if (settings.readingMode === 'rsvp') {
      return (
        <div className="flex items-center justify-center h-full w-full min-h-[60vh]">
           <span className="transition-all duration-100 animate-in fade-in zoom-in-50" style={{...textStyle, fontSize: `${settings.fontSize * 2.5}px`, color: settings.highlightColor}}>{words[currentIndex] || ""}</span>
        </div>
      );
    }
    if (settings.readingMode === 'scroller') {
      return (
        <div className="flex flex-col items-center py-[40vh] gap-6">
          {words.map((word, index) => (
             <span key={index} ref={index === currentIndex ? currentWordRef : null} className={`transition-all duration-300 ${index === currentIndex ? 'scale-150 font-bold opacity-100' : 'scale-90 opacity-20'}`} style={{...textStyle, color: index === currentIndex ? settings.highlightColor : settings.textColor}}>{word}</span>
          ))}
        </div>
      );
    }
    return (
      <div className="transition-all duration-300" style={textStyle}>
        {words.map((word, index) => {
          const isCurrent = index === currentIndex;
          if (index > currentIndex && (['typewriter','bounce','pulse','wavy','glitch','dim','flash','spread','mirror','neon','boxed','underline','marker','thick','shake'].includes(settings.readingMode))) return null;
          
          let specialStyles: React.CSSProperties = {};
          if (isCurrent) {
            specialStyles.color = settings.highlightColor;
            if (settings.readingMode === 'magnify') specialStyles.transform = 'scale(1.8)';
            if (settings.readingMode === 'neon') specialStyles.textShadow = `0 0 5px #fff, 0 0 10px #fff, 0 0 20px ${settings.highlightColor}`;
            if (settings.readingMode === 'boxed') specialStyles.border = `2px solid ${settings.highlightColor}`;
          }

          return (
            <span key={index} ref={isCurrent ? currentWordRef : null} className={`inline-block mx-1.5 transition-all duration-200 ${isCurrent ? 'scale-110' : 'opacity-60'}`} style={{...specialStyles}}>{word}</span>
          );
        })}
        {settings.readingMode === 'typewriter' && <span className="inline-block w-1.5 h-[1.2em] bg-primary animate-pulse align-middle" />}
        <div ref={bottomRef} className="h-40 w-full" />
      </div>
    );
  };

  return (
    <div className="flex-1 w-full bg-slate-900/50 relative flex flex-col items-center justify-center p-0 transition-all duration-500 overflow-hidden">
      <div 
        id="reader-container"
        ref={containerRef}
        onClick={onTogglePlay}
        className={`relative transition-all duration-500 group/container flex flex-col ${isFocusMode ? 'w-full h-full rounded-none border-none shadow-none z-[100]' : 'w-[96%] h-[94%] md:w-[94%] md:h-[92%] rounded-3xl border border-slate-700/60 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]'}`}
      >
        <div className="absolute inset-0 overflow-hidden flex flex-col" style={{ backgroundColor: settings.backgroundColor, direction: 'rtl', textAlign: (settings.readingMode === 'rsvp' || settings.readingMode === 'scroller') ? 'center' : settings.textAlign }}>
            <div className={`flex-1 w-full h-full overflow-y-auto pt-10 pb-20 no-scrollbar scroll-smooth ${isFocusMode ? 'px-8 md:px-32 lg:px-64' : 'px-4 md:px-16 lg:px-32'}`}>
               {renderContent()}
            </div>
            <OverlayFeedback message={feedbackMessage} />

            {/* In-Reader Progress Bar with Focus mode auto-hide */}
            <div className={`absolute bottom-0 left-0 right-0 z-40 transition-all duration-500 ${(!showUI && isFocusMode) ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                <div className="bg-slate-900/90 backdrop-blur-lg border-t border-slate-700/50 pb-4 pt-2 px-6 flex items-center justify-between gap-6 shadow-2xl">
                    <button onClick={(e) => { e.stopPropagation(); onTogglePlay?.(); }} className="p-3 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-slate-900 transition-all active:scale-90">{isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button>
                    <div ref={progressBarRef} className="flex-1 relative h-8 flex items-center group cursor-pointer" onMouseDown={(e) => { e.stopPropagation(); handleSeekInternal(e.clientX); setIsDraggingProgress(true); }}>
                        <div className="absolute left-0 right-0 h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-primary transition-all duration-300" style={{ width: `${stats.percentage}%` }} /></div>
                        <div className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 bg-slate-900 rounded-full border border-slate-600 shadow-xl group-hover:scale-110 transition-transform" style={{ right: `calc(${stats.percentage}% - 1rem)` }}>
                            <span className="text-[10px] font-black text-white">{stats.percentage}%</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end min-w-[80px]"><span className="font-mono text-primary font-black text-sm">{stats.timeString}</span><span className="text-[10px] text-slate-500">{stats.remainingWords} {t.wordsLeft}</span></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReaderDisplay;
