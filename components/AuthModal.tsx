
import React, { useState } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { auth, db, googleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, lang }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const t = TRANSLATIONS[lang].auth;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.username });
        
        // إنشاء وثيقة المستخدم في Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          username: formData.username,
          email: formData.email,
          total_words_read: 0,
          reading_time: 0,
          createdAt: Date.now(),
          sessions: []
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-slate-700 rounded-3xl w-full max-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {isLoginView ? <LogIn size={24} className="text-primary"/> : <UserPlus size={24} className="text-emerald-400"/>}
            {isLoginView ? t.login : t.register}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            {isLoginView ? 'Login with Google' : 'Sign up with Google'}
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t.username}</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 rtl:right-3 rtl:left-auto" />
                  <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 rtl:pr-10 rtl:pl-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder={t.username} />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t.email}</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 rtl:right-3 rtl:left-auto" />
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 rtl:pr-10 rtl:pl-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="name@example.com" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t.password}</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 rtl:right-3 rtl:left-auto" />
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 rtl:pr-10 rtl:pl-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="••••••••" />
              </div>
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-xs text-center">{error}</div>}

            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-slate-900 font-bold rounded-xl hover:bg-sky-400 transition-all active:scale-95 shadow-lg shadow-primary/20 mt-4 disabled:opacity-50">
              {loading ? '...' : (isLoginView ? t.login : t.register)}
            </button>

            <div className="text-center mt-4 pt-4 border-t border-slate-700/50">
              <button type="button" onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="text-sm text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white transition-all">
                {isLoginView ? t.noAccount : t.haveAccount}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
