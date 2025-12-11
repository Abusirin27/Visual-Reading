import React, { useState } from 'react';
import { Type, Bold, Minus, Plus, Sun, Lightbulb, Palette, ChevronUp, ChevronDown, Highlighter, PaintBucket, Zap } from 'lucide-react';
import { ARABIC_FONTS, TRANSLATIONS, TEXT_COLORS } from '../constants';
import { ReaderSettings, Language } from '../types';

interface SettingsPanelProps {
  settings: ReaderSettings;
  onUpdate: (newSettings: Partial<ReaderSettings>) => void;
  onShowFeedback: (message: string) => void;
  className?: string;
  lang: Language;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate, onShowFeedback, className, lang }) => {
  const t = TRANSLATIONS[lang].settings;
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightColorPicker, setShowHighlightColorPicker] = useState(false);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  
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
    <div className={`bg-surface border-t border-slate-700/50 p-2 shadow-2xl z-50 ${className}`}>
      {/* Added overflow-x-auto for mobile scrollability and hide scrollbar */}
      <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-4 text-slate-300 overflow-x-auto no-scrollbar pb-1 px-1">
        
        {/* Speed Section */}
        <div className="flex-none flex items-center gap-2 bg-slate-900/50 rounded-lg p-1 border border-slate-700/50" title={t.speed}>
          <div className="p-1 text-primary"><Zap size={16} /></div>
          <input 
            type="number" 
            value={settings.wpm}
            onChange={handleWpmInputChange}
            className="w-12 bg-transparent text-sm font-mono text-center text-primary font-bold focus:outline-none"
          />
          <input
            type="range"
            min="60"
            max="1000"
            step="20"
            value={settings.wpm}
            onChange={handleWpmChange}
            className="w-20 md:w-32 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
            style={{ direction: 'ltr' }}
          />
        </div>

        {/* Vertical Divider */}
        <div className="flex-none w-px h-8 bg-slate-700/50" />

        {/* Typography Section */}
        <div className="flex-none flex items-center gap-2">
          {/* Font Select */}
          <div className="relative" title={t.font}>
            <select
              value={settings.fontFamily}
              onChange={(e) => onUpdate({ fontFamily: e.target.value })}
              className="w-32 md:w-40 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary focus:border-primary truncate appearance-none"
              style={{ fontFamily: settings.fontFamily }}
            >
              {ARABIC_FONTS.map((font) => (
                <option key={font.name} value={font.family} style={{ fontFamily: font.family }}>
                  {font.name}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          {/* Size Stepper */}
          <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700" title={t.size} style={{ direction: 'ltr' }}>
            <button onClick={() => handleFontSizeChange(-2)} className="p-1.5 hover:text-primary transition-colors"><Minus size={14} /></button>
            <input 
              type="number" 
              value={settings.fontSize}
              onChange={handleFontSizeInputChange}
              className="w-10 text-center text-xs font-mono bg-transparent text-slate-200 focus:outline-none"
            />
            <button onClick={() => handleFontSizeChange(2)} className="p-1.5 hover:text-primary transition-colors"><Plus size={14} /></button>
          </div>

          {/* Bold Toggle */}
          <button
            onClick={() => onUpdate({ isBold: !settings.isBold })}
            className={`p-1.5 rounded-lg border border-slate-700 transition-all ${
              settings.isBold ? 'bg-primary text-slate-900' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
            title={t.bold}
          >
            <Bold size={18} />
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="flex-none w-px h-8 bg-slate-700/50" />

        {/* Appearance Section */}
        <div className="flex-none flex items-center gap-4">
          
          {/* Colors Group */}
          <div className="flex items-center gap-2">
             {/* Text Color */}
             <div className="relative">
               <button 
                  onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightColorPicker(false); setShowBackgroundColorPicker(false); }}
                  className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center relative hover:scale-105 transition-transform"
                  style={{ backgroundColor: settings.textColor }}
                  title={t.color}
               >
                  <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full p-0.5 border border-slate-600">
                    <Palette size={10} className="text-slate-300"/>
                  </div>
               </button>
               {showColorPicker && (
                 <>
                   <div className="fixed inset-0 z-[90]" onClick={() => setShowColorPicker(false)} />
                   <div className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-slate-600 p-2 rounded-xl shadow-2xl z-[100] w-max">
                      <div className="grid grid-cols-10 gap-2">
                          {TEXT_COLORS.map((color) => (
                            <button key={color.name} onClick={() => { onUpdate({ textColor: color.value }); setShowColorPicker(false); }} className="w-5 h-5 rounded-full border border-transparent hover:border-white" style={{ backgroundColor: color.value }} title={color.name} />
                          ))}
                      </div>
                   </div>
                 </>
               )}
             </div>

             {/* Highlight Color */}
             <div className="relative">
               <button 
                  onClick={() => { setShowHighlightColorPicker(!showHighlightColorPicker); setShowColorPicker(false); setShowBackgroundColorPicker(false); }}
                  className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center relative hover:scale-105 transition-transform"
                  style={{ backgroundColor: settings.highlightColor }}
                  title={t.highlightColor}
               >
                  <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full p-0.5 border border-slate-600">
                    <Highlighter size={10} className="text-slate-300"/>
                  </div>
               </button>
               {showHighlightColorPicker && (
                 <>
                   <div className="fixed inset-0 z-[90]" onClick={() => setShowHighlightColorPicker(false)} />
                   <div className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-slate-600 p-2 rounded-xl shadow-2xl z-[100] w-max">
                      <div className="grid grid-cols-10 gap-2">
                          {TEXT_COLORS.map((color) => (
                            <button key={color.name} onClick={() => { onUpdate({ highlightColor: color.value }); setShowHighlightColorPicker(false); }} className="w-5 h-5 rounded-full border border-transparent hover:border-white" style={{ backgroundColor: color.value }} title={color.name} />
                          ))}
                      </div>
                   </div>
                 </>
               )}
             </div>

             {/* Background Color */}
             <div className="relative">
               <button 
                  onClick={() => { setShowBackgroundColorPicker(!showBackgroundColorPicker); setShowColorPicker(false); setShowHighlightColorPicker(false); }}
                  className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center relative hover:scale-105 transition-transform"
                  style={{ backgroundColor: settings.backgroundColor }}
                  title={t.backgroundColor}
               >
                  <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full p-0.5 border border-slate-600">
                    <PaintBucket size={10} className="text-slate-300"/>
                  </div>
               </button>
               {showBackgroundColorPicker && (
                 <>
                   <div className="fixed inset-0 z-[90]" onClick={() => setShowBackgroundColorPicker(false)} />
                   <div className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-slate-600 p-2 rounded-xl shadow-2xl z-[100] w-max">
                      <div className="grid grid-cols-10 gap-2">
                          {TEXT_COLORS.map((color) => (
                            <button key={color.name} onClick={() => { onUpdate({ backgroundColor: color.value }); setShowBackgroundColorPicker(false); }} className="w-5 h-5 rounded-full border border-transparent hover:border-white" style={{ backgroundColor: color.value }} title={color.name} />
                          ))}
                      </div>
                   </div>
                 </>
               )}
             </div>
          </div>

          <div className="w-px h-8 bg-slate-700/50" />

          {/* Effects Group */}
          <div className="flex items-center gap-3">
             {/* Glow */}
             <div className="flex items-center gap-1 bg-slate-900 rounded-lg border border-slate-700 p-1" title={t.glow}>
                <button onClick={() => handleGlowChange(-5)} className="hover:text-amber-400"><Minus size={12} /></button>
                <Lightbulb size={16} className={settings.glowIntensity > 0 ? "text-amber-400" : "text-slate-600"} />
                <button onClick={() => handleGlowChange(5)} className="hover:text-amber-400"><Plus size={12} /></button>
             </div>

             {/* Brightness */}
             <div className="flex items-center gap-2 bg-slate-900 rounded-lg border border-slate-700 px-2 py-1" title={t.brightness}>
                <Sun size={16} className="text-slate-400"/>
                <input 
                  type="range" 
                  min="10" 
                  max="150" 
                  step="5"
                  value={settings.brightness}
                  onChange={handleBrightnessChange}
                  className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  style={{ direction: 'ltr' }}
                />
             </div>
          </div>

        </div>

        {/* Hidden Icon for ChevronDown import usage check */}
        <ChevronUp className="hidden" /> 
      </div>
    </div>
  );
};

export default SettingsPanel;