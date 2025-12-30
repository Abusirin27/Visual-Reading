
import React, { useMemo } from 'react';
import { X, Trophy, Activity, Clock, BookOpen, BarChart2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language, ReadingSession } from '../types';
import { useAuth } from '../AuthContext';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  localSessions: ReadingSession[];
  lang: Language;
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({ isOpen, onClose, localSessions, lang }) => {
  const { user, userData } = useAuth();
  const t = TRANSLATIONS[lang].statistics;

  const displaySessions = useMemo(() => {
    // دمج جلسات Firestore مع الجلسات المحلية غير المحفوظة
    if (userData?.sessions) {
      return [...userData.sessions, ...localSessions];
    }
    return localSessions;
  }, [userData, localSessions]);

  if (!isOpen) return null;

  const totalSessions = displaySessions.length;
  const totalWords = displaySessions.reduce((acc, s) => acc + s.wordsRead, 0);
  const totalTimeSeconds = displaySessions.reduce((acc, s) => acc + s.duration, 0);
  const avgSpeed = totalSessions > 0 
    ? Math.round(displaySessions.reduce((acc, s) => acc + s.wpm, 0) / totalSessions) 
    : 0;
  
  const formatTotalTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  let level = t.level1;
  let levelColor = 'text-slate-400';
  let levelIcon = <BookOpen size={24} />;
  
  if (totalWords > 50000) { level = t.level5; levelColor = 'text-amber-400'; levelIcon = <Trophy size={24} />; }
  else if (totalWords > 20000) { level = t.level4; levelColor = 'text-purple-400'; levelIcon = <Activity size={24} />; }
  else if (totalWords > 10000) { level = t.level3; levelColor = 'text-emerald-400'; levelIcon = <BookOpen size={24} />; }
  else if (totalWords > 2000) { level = t.level2; levelColor = 'text-blue-400'; levelIcon = <BookOpen size={24} />; }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-surface border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 text-primary">
            <BarChart2 size={24} />
            <h2 className="text-xl font-bold">{t.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">{t.totalWords}</span>
                 <span className="text-2xl font-black text-white">{totalWords.toLocaleString()}</span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">{t.totalTime}</span>
                 <span className="text-2xl font-black text-white">{formatTotalTime(totalTimeSeconds)}</span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">{t.avgSpeed}</span>
                 <span className="text-2xl font-black text-white">{avgSpeed}</span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">{t.sessions}</span>
                 <span className="text-2xl font-black text-white">{totalSessions}</span>
              </div>
           </div>

           <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 relative overflow-hidden group">
             <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity"><Trophy size={160} /></div>
             <div className="relative z-10 flex items-center gap-4">
                <div className={`p-4 rounded-2xl bg-slate-800 border border-slate-600 ${levelColor}`}>{levelIcon}</div>
                <div>
                  <h3 className={`text-xl font-black ${levelColor}`}>{level}</h3>
                  <p className="text-sm text-slate-400 mt-1">{t.encouragement}</p>
                </div>
             </div>
           </div>

           <div>
              <h3 className="text-lg font-black text-slate-200 mb-4 flex items-center gap-2">
                 <Clock size={18} className="text-slate-500"/>{t.sessions}
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {displaySessions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 italic border border-dashed border-slate-800 rounded-2xl">{t.noData}</div>
                ) : (
                  displaySessions.slice().reverse().map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                       <span className="text-sm font-medium text-slate-300">{new Date(session.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</span>
                       <div className="flex items-center gap-4 text-xs">
                          <span className="text-slate-400 font-bold"><span className="text-primary">{session.wordsRead}</span> {t.words}</span>
                          <span className="text-slate-400 font-bold"><span className="text-primary">{session.wpm}</span> wpm</span>
                       </div>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsModal;
