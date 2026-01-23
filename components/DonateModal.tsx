
import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Copy } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose, lang }) => {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  
  const t = TRANSLATIONS[lang].donation;

  // Donation Numbers
  const LIBYANA_NUM = "0924828751";
  const ALMADAR_NUM = "0916451806";

  if (!isOpen) return null;

  const handleCopy = (num: string, label: string) => {
    navigator.clipboard.writeText(num).then(() => {
      setCopyFeedback(lang === 'ar' ? `تم نسخ رقم ${label}` : `${label} number copied`);
      setTimeout(() => setCopyFeedback(null), 2000);
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-surface border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Copy Feedback Toast */}
        {copyFeedback && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[350] bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            {copyFeedback}
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <CreditCard className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t.title}</h2>
              <p className="text-green-100 text-xs">{t.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          <div className="text-center space-y-2">
            <p className="text-slate-300 text-sm leading-relaxed">
              {lang === 'ar' 
                ? 'يمكنك المساهمة في دعم استمرار المشروع عبر تحويل رصيد للأرقام التالية:' 
                : 'You can contribute to the project by transferring credit to the following numbers:'}
            </p>
          </div>

          {/* Donation Numbers List */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-emerald-400 font-bold mb-1">
               <Smartphone size={20} />
               <span className="text-sm">{lang === 'ar' ? 'أرقام التبرع المتاحة (اضغط للنسخ):' : 'Available donation numbers (Tap to copy):'}</span>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Almadar Card */}
              <button 
                onClick={() => handleCopy(ALMADAR_NUM, t.almadar)}
                className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800 hover:border-emerald-500/50 transition-all group active:scale-[0.98]"
              >
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-sm font-bold text-slate-400 group-hover:text-emerald-400 transition-colors">{t.almadar}</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-lg font-mono font-bold text-white tracking-widest">{ALMADAR_NUM}</span>
                   <div className="p-1.5 bg-slate-800 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                     <Copy size={16} className="text-slate-500 group-hover:text-emerald-400" />
                   </div>
                 </div>
              </button>

              {/* Libyana Card */}
              <button 
                onClick={() => handleCopy(LIBYANA_NUM, t.libyana)}
                className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800 hover:border-primary/50 transition-all group active:scale-[0.98]"
              >
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-primary" />
                   <span className="text-sm font-bold text-slate-400 group-hover:text-primary transition-colors">{t.libyana}</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-lg font-mono font-bold text-white tracking-widest">{LIBYANA_NUM}</span>
                   <div className="p-1.5 bg-slate-800 rounded-lg group-hover:bg-primary/20 transition-colors">
                     <Copy size={16} className="text-slate-500 group-hover:text-primary" />
                   </div>
                 </div>
              </button>
            </div>
          </div>

          <p className="text-xs text-center text-slate-500 font-medium italic pb-2">
            {lang === 'ar' ? 'شكراً جزيلاً لمساهمتكم الكريمة' : 'Thank you very much for your kind contribution'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonateModal;
