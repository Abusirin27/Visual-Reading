
import React, { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { ShortcutMap, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: ShortcutMap;
  onUpdateShortcuts: (newShortcuts: ShortcutMap) => void;
  lang: Language;
}

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose, shortcuts, onUpdateShortcuts, lang }) => {
  const [editingKey, setEditingKey] = useState<keyof ShortcutMap | null>(null);
  const t = TRANSLATIONS[lang].shortcutsModal;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingKey) {
        e.preventDefault();
        e.stopPropagation();
        
        let newKey = e.key;
        if (newKey === ' ') newKey = ' '; // Explicit space
        
        onUpdateShortcuts({
          ...shortcuts,
          [editingKey]: newKey
        });
        setEditingKey(null);
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [editingKey, isOpen, onClose, onUpdateShortcuts, shortcuts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2 text-primary">
            <Keyboard size={20} />
            <h2 className="text-lg font-bold">{t.title}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-2">
           <p className="text-xs text-slate-400 mb-4 bg-slate-800/50 p-3 rounded border border-slate-700">
             {t.desc}
           </p>

           {Object.entries(shortcuts).map(([key, value]) => (
             <div key={key} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
               <span className="text-sm font-medium text-slate-300">
                 {t.keys[key as keyof typeof t.keys]}
               </span>
               <button
                 onClick={() => setEditingKey(key as keyof ShortcutMap)}
                 className={`min-w-[80px] px-3 py-1.5 text-sm font-mono rounded border transition-all text-center ${
                   editingKey === key 
                     ? 'bg-primary text-slate-900 border-primary ring-2 ring-primary/50 animate-pulse' 
                     : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-primary hover:text-primary'
                 }`}
               >
                 {editingKey === key ? t.pressKey : (value === ' ' ? t.space : value)}
               </button>
             </div>
           ))}
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-800/30 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="w-full py-2 bg-primary text-slate-900 font-bold rounded-lg hover:bg-sky-400 transition-colors"
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
