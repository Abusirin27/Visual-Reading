
import React from 'react';
import { Bold, Minus, Plus, Sun, Lightbulb, Zap, Expand, Shrink, ChevronDown, Palette, Type, Highlighter } from 'lucide-react';
import { ARABIC_FONTS, TRANSLATIONS, ESSENTIAL_COLORS } from '../constants';
import { ReaderSettings, Language } from '../types';

interface SettingsPanelProps {
  settings: ReaderSettings;
  onUpdate: (newSettings: Partial<ReaderSettings>) => void;
  onShowFeedback: (message: string) => void;
  className?: string;
  lang: Language;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  isColorMenuOpen?: boolean;
  onToggleColorMenu?: (isOpen: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  settings, 
  onUpdate, 
  onShowFeedback, 
  className, 
  lang, 
  isFocusMode, 
  onToggleFocusMode,
  isColorMenuOpen = false,
  onToggleColorMenu,
}) => {
  const t = TRANSLATIONS[lang].settings;
  
  const handleWpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onUpdate({ wpm: val });
    onShowFeedback(`${val} ${t.wpm}`);
  };

  const handleWpmInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (val < 60) val = 60;
    if (val > 1000) val = 1000;
    onUpdate({ wpm: val });
  };

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(150, settings.fontSize + delta));
    onUpdate({ fontSize: newSize });
    onShowFeedback(`${newSize}`);
  };

  const handleFontSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (val < 12) val = 12;
    if (val > 150) val = 150;
    onUpdate({ fontSize: val });
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onUpdate({ brightness: val });
    onShowFeedback(`${val}%`);
  };

  const handleGlowChange = (delta: number) => {
    const newVal = Math.max(0, Math.min(50, settings.glowIntensity + delta));
    onUpdate({ glowIntensity: newVal });
  };

  return (
    <div className={`bg-surface border-t border-slate-700/50 p-2 shadow-2xl z-[250] ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-3 text-slate-300 overflow-visible px-2">
        
        {/* Speed & Zoom Section */}
        <div className="flex-none flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900/50 rounded-lg p-1 border border-slate-700/50" title={t.speed}>
            <div className="p-1 text-primary"><Zap size={14} /></div>
            <input 
              type="number" 
              value={settings.wpm}
              onChange={handleWpmInputChange}
              className="w-10 bg-transparent text-xs font-mono text-center text-primary font-bold focus:outline-none"
            />
            <input
              type="range"
              min="60"
              max="1000"
              step="20"
              value={settings.wpm}
              onChange={handleWpmChange}
              className="w-16 md:w-28 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              style={{ direction: 'ltr' }}
            />
          </div>

          <button 
            onClick={onToggleFocusMode}
            className={`flex items-center justify-center p-1.5 rounded-lg border transition-all active:scale-90 ${
              isFocusMode 
                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(56,189,248,0.2)]' 
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
            }`}
            title={lang === 'ar' ? 'تركيز نافذة القراءة (Z)' : 'Reader Focus Mode (Z)'}
          >
            {isFocusMode ? <Shrink size={16} /> : <Expand size={16} />}
          </button>
        </div>

        <div className="flex-none w-px h-6 bg-slate-700/50" />

        {/* Typography Section */}
        <div className="flex-none flex items-center gap-2 overflow-visible">
          <div className="relative" title={t.font}>
            <select
              value={settings.fontFamily}
              onChange={(e) => onUpdate({ fontFamily: e.target.value })}
              className="w-20 md:w-36 bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary focus:border-primary truncate appearance-none"
              style={{ fontFamily: settings.fontFamily }}
            >
              {ARABIC_FONTS.map((font) => (
                <option key={font.name} value={font.family} style={{ fontFamily: font.family }}>{font.name}</option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700" title={t.size} style={{ direction: 'ltr' }}>
            <button onClick={() => handleFontSizeChange(-2)} className="p-1 hover:text-primary transition-colors"><Minus size={12} /></button>
            <input 
              type="number" 
              value={settings.fontSize}
              onChange={handleFontSizeInputChange}
              className="w-8 text-center text-[10px] font-mono bg-transparent text-slate-200 focus:outline-none"
            />
            <button onClick={() => handleFontSizeChange(2)} className="p-1 hover:text-primary transition-colors"><Plus size={12} /></button>
          </div>

          <button
            onClick={() => onUpdate({ isBold: !settings.isBold })}
            className={`p-1.5 rounded-lg border border-slate-700 transition-all active:scale-95 ${
              settings.isBold ? 'bg-primary text-slate-900 shadow-[0_0_10px_rgba(56,189,248,0.3)]' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
            title={t.bold}
          >
            <Bold size={16} />
          </button>

          {/* Color Selection Popover */}
          <div className="relative overflow-visible">
            <button
              onClick={() => onToggleColorMenu?.(!isColorMenuOpen)}
              className={`p-1.5 rounded-lg border border-slate-700 transition-all flex items-center gap-2 active:scale-95 ${
                isColorMenuOpen ? 'bg-slate-800 border-primary' : 'bg-slate-900 hover:bg-slate-800'
              }`}
              title={t.color}
            >
              <div className="flex items-center -space-x-1.5 rtl:space-x-reverse">
                <div 
                  className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm z-10" 
                  style={{ backgroundColor: settings.textColor }} 
                  title={t.color}
                />
                <div 
                  className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm z-0 opacity-80" 
                  style={{ backgroundColor: settings.highlightColor }} 
                  title={t.highlightColor}
                />
              </div>
              <ChevronDown size={10} className={`transition-transform duration-200 text-slate-500 ${isColorMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isColorMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10 bg-transparent" 
                  onClick={(e) => { e.stopPropagation(); onToggleColorMenu?.(false); }} 
                />
                
                <div className="absolute bottom-full mb-3 rtl:right-0 ltr:left-0 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl z-20 flex flex-col gap-5 w-[280px] md:w-[320px] animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto backdrop-blur-md">
                  
                  {/* Text Color Section */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Type size={12} className="text-primary" />
                        {t.color}
                      </div>
                      <span className="text-[10px] font-mono text-slate-600">{settings.textColor}</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                      {ESSENTIAL_COLORS.map((color) => (
                        <button
                          key={`text-${color.value}`}
                          onClick={() => onUpdate({ textColor: color.value })}
                          className={`w-7 h-7 rounded-full border-2 transition-all active:scale-90 flex-none relative ${
                            settings.textColor === color.value ? 'border-primary scale-110 shadow-[0_0_12px_rgba(56,189,248,0.5)]' : 'border-transparent hover:scale-110'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          {settings.textColor === color.value && <div className="absolute inset-0.5 border border-white/40 rounded-full" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-slate-800" />

                  {/* Highlight Color Section */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Highlighter size={12} className="text-amber-400" />
                        {t.highlightColor}
                      </div>
                      <span className="text-[10px] font-mono text-slate-600">{settings.highlightColor}</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                      {ESSENTIAL_COLORS.map((color) => (
                        <button
                          key={`highlight-${color.value}`}
                          onClick={() => onUpdate({ highlightColor: color.value })}
                          className={`w-7 h-7 rounded-full border-2 transition-all active:scale-90 flex-none relative ${
                            settings.highlightColor === color.value ? 'border-amber-400 scale-110 shadow-[0_0_12px_rgba(251,191,36,0.5)]' : 'border-transparent hover:scale-110'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          {settings.highlightColor === color.value && <div className="absolute inset-0.5 border border-white/40 rounded-full" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex-none w-px h-6 bg-slate-700/50" />

        {/* Appearance Section */}
        <div className="flex-none flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 rounded-lg border border-slate-700 p-1" title={t.glow}>
            <button onClick={() => handleGlowChange(-5)} className="hover:text-amber-400 p-1 active:scale-75 transition-transform"><Minus size={10} /></button>
            <Lightbulb size={14} className={settings.glowIntensity > 0 ? "text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]" : "text-slate-600"} />
            <button onClick={() => handleGlowChange(5)} className="hover:text-amber-400 p-1 active:scale-75 transition-transform"><Plus size={10} /></button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 rounded-lg border border-slate-700 px-2 py-1" title={t.brightness}>
            <Sun size={14} className="text-slate-400"/>
            <input 
              type="range" 
              min="10" 
              max="150" 
              step="5"
              value={settings.brightness}
              onChange={handleBrightnessChange}
              className="w-12 md:w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              style={{ direction: 'ltr' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
