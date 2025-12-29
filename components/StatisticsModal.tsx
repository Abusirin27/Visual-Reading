
import React from 'react';
import { X, Trophy, Activity, Clock, BookOpen, BarChart2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language, ReadingSession } from '../types';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ReadingSession[];
  lang: Language;
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({ isOpen, onClose, sessions, lang }) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang].statistics;

  // Calculate Stats
  const totalSessions = sessions.length;
  const totalWords = sessions.reduce((acc, s) => acc + s.wordsRead, 0);
  const totalTimeSeconds = sessions.reduce((acc, s) => acc + s.duration, 0);
  const avgSpeed = totalSessions > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.wpm, 0) / totalSessions) 
    : 0;
  
  // Format Time
  const formatTotalTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Level Logic
  let level = t.level1;
  let levelColor = 'text-slate-400';
  let levelIcon = <BookOpen size={24} />;
  
  if (totalWords > 50000) { level = t.level5; levelColor = 'text-amber-400'; levelIcon = <Trophy size={24} />; }
  else if (totalWords > 20000) { level = t.level4; levelColor = 'text-purple-400'; levelIcon = <Activity size={24} />; }
  else if (totalWords > 10000) { level = t.level3; levelColor = 'text-emerald-400'; levelIcon = <BookOpen size={24} />; }
  else if (totalWords > 2000) { level = t.level2; levelColor = 'text-blue-400'; levelIcon = <BookOpen size={24} />; }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 text-primary">
            <BarChart2 size={24} />
            <h2 className="text-xl font-bold">{t.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
           
           {/* Summary Cards */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center">
                 <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t.totalWords}</span>
                 <span className="text-2xl font-bold text-white">{totalWords.toLocaleString()}</span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center">
                 <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t.totalTime}</span>
                 <span className="text-2xl font-bold text-white">{formatTotalTime(totalTimeSeconds)}</span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center">
                 <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t.avgSpeed}</span>
                 <span className="text-2xl font-bold text-white">{avgSpeed}</span>
                 <span className="text-[10px] text-slate-600">wpm</span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center">
                 <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t.sessions}</span>
                 <span className="text-2xl font-bold text-white">{totalSessions}</span>
              </div>
           </div>

           {/* Achievement / Level */}
           <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4">
                <Trophy size={120} />
             </div>
             <div className="relative z-10 flex items-center gap-4">
                <div className={`p-4 rounded-full bg-slate-800 border border-slate-600 ${levelColor}`}>
                   {levelIcon}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${levelColor}`}>{level}</h3>
                  <p className="text-sm text-slate-400 mt-1">{t.encouragement}</p>
                </div>
             </div>
           </div>

           {/* Session History List */}
           <div>
              <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                 <Clock size={18} className="text-slate-500"/>
                 {t.sessions}
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 italic border border-dashed border-slate-800 rounded-xl">
                    {t.noData}
                  </div>
                ) : (
                  sessions.slice().reverse().map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors">
                       <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-300">{new Date(session.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</span>
                       </div>
                       <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-400"><span className="text-white font-bold">{session.wordsRead}</span> {t.words}</span>
                          <span className="text-slate-500">|</span>
                          <span className="text-slate-400"><span className="text-white font-bold">{session.duration}</span>s</span>
                          <span className="text-slate-500">|</span>
                          <span className="text-slate-400"><span className="text-white font-bold">{session.wpm}</span> wpm</span>
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
