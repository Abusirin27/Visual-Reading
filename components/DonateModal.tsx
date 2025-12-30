
import React, { useState } from 'react';
import { X, Send, CreditCard, CheckCircle, Smartphone, Copy } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose, lang }) => {
  const [network, setNetwork] = useState<'libyana' | 'almadar'>('almadar');
  const [cardCode, setCardCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  
  const t = TRANSLATIONS[lang].donation;

  // Donation Numbers
  const LIBYANA_NUM = "0924828751";
  const ALMADAR_NUM = "0916451806";
  const SUPPORT_EMAILS = ["freelancing1444@gmail.com", "freelancing1443@gmail.com"];

  if (!isOpen) return null;

  const handleCopy = (num: string, label: string) => {
    navigator.clipboard.writeText(num).then(() => {
      setCopyFeedback(lang === 'ar' ? `تم نسخ رقم ${label}` : `${label} number copied`);
      setTimeout(() => setCopyFeedback(null), 2000);
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use strictly 13 digits requirement
    if (!cardCode || cardCode.trim().length !== 13) return;
    
    setLoading(true);
    // Simulate sending code
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        setCardCode('');
      }, 3000);
    }, 1500);
  };

  const isButtonDisabled = !cardCode || cardCode.trim().length !== 13 || loading;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-surface border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Copy Feedback Toast */}
        {copyFeedback && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
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

        {submitted ? (
          <div className="p-12 text-center animate-in zoom-in-95 duration-300">
            <CheckCircle size={64} className="text-emerald-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{t.success}</h3>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            
            {/* Network Toggle */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400">{t.selectNetwork}</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setNetwork('almadar')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold ${
                    network === 'almadar' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-slate-700 bg-slate-800 text-slate-500'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${network === 'almadar' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                  {t.almadar}
                </button>
                <button 
                  onClick={() => setNetwork('libyana')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold ${
                    network === 'libyana' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-700 bg-slate-800 text-slate-500'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${network === 'libyana' ? 'bg-primary' : 'bg-slate-600'}`} />
                  {t.libyana}
                </button>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">{t.scratchCard}</label>
                <input 
                  type="text"
                  value={cardCode}
                  onChange={(e) => setCardCode(e.target.value)}
                  placeholder={t.scratchPlaceholder}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-5 px-5 text-2xl font-mono text-center text-white focus:ring-2 focus:ring-primary outline-none tracking-[0.2em]"
                />
                <div className="text-[10px] text-center text-slate-500 mt-1">
                  {lang === 'ar' ? 'يجب إدخال 13 رقماً بالضبط' : 'Must be exactly 13 digits'}
                </div>
              </div>

              <button 
                type="submit"
                disabled={isButtonDisabled}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={20} />
                    {t.submitCode}
                  </>
                )}
              </button>
            </form>

            {/* Donation Numbers Footer */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-emerald-400 font-bold">
                 <Smartphone size={20} />
                 <span className="text-sm">{lang === 'ar' ? 'أرقام التبرع المتاحة (اضغط للنسخ):' : 'Available donation numbers (Tap to copy):'}</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => handleCopy(ALMADAR_NUM, t.almadar)}
                  className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800 hover:border-emerald-500/50 transition-all group"
                >
                   <span className="text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">{t.almadar}</span>
                   <div className="flex items-center gap-2">
                     <span className="text-sm font-mono font-bold text-white tracking-widest">{ALMADAR_NUM}</span>
                     <Copy size={14} className="text-slate-500 group-hover:text-emerald-400" />
                   </div>
                </button>
                <button 
                  onClick={() => handleCopy(LIBYANA_NUM, t.libyana)}
                  className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800 hover:border-primary/50 transition-all group"
                >
                   <span className="text-xs text-slate-400 group-hover:text-primary transition-colors">{t.libyana}</span>
                   <div className="flex items-center gap-2">
                     <span className="text-sm font-mono font-bold text-white tracking-widest">{LIBYANA_NUM}</span>
                     <Copy size={14} className="text-slate-500 group-hover:text-primary" />
                   </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonateModal;
