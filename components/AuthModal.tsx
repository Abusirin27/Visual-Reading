import React, { useState } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language, User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserType) => void;
  lang: Language;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, lang }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  
  const t = TRANSLATIONS[lang].auth;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!formData.email || !formData.password || (!isLoginView && !formData.username)) {
      setError(t.error);
      return;
    }

    // Simulate Backend logic with LocalStorage
    const storedUsersStr = localStorage.getItem('users');
    const users: UserType[] = storedUsersStr ? JSON.parse(storedUsersStr) : [];

    if (isLoginView) {
      // Login Logic
      const foundUser = users.find(u => u.email === formData.email && u.password === formData.password);
      if (foundUser) {
        onLogin(foundUser);
        onClose();
      } else {
        setError(t.error);
      }
    } else {
      // Register Logic
      const exists = users.find(u => u.email === formData.email);
      if (exists) {
        setError(t.error); // In real app, say "Email already exists"
        return;
      }

      const newUser: UserType = {
        id: Date.now().toString(),
        username: formData.username,
        email: formData.email,
        password: formData.password, // Security Warning: Never store plain text passwords in real apps
        createdAt: Date.now()
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      onLogin(newUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {isLoginView ? <LogIn size={24} className="text-primary"/> : <UserPlus size={24} className="text-emerald-400"/>}
            {isLoginView ? t.login : t.register}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {!isLoginView && (
            <div className="space-y-1">
              <label className="text-sm text-slate-400">{t.username}</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 rtl:right-3 rtl:left-auto" />
                <input 
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-3 rtl:pr-10 rtl:pl-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder={t.username}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm text-slate-400">{t.email}</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 rtl:right-3 rtl:left-auto" />
              <input 
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-3 rtl:pr-10 rtl:pl-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-400">{t.password}</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 rtl:right-3 rtl:left-auto" />
              <input 
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-3 rtl:pr-10 rtl:pl-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-2.5 bg-primary text-slate-900 font-bold rounded-lg hover:bg-sky-400 transition-all transform active:scale-95 shadow-lg shadow-primary/20 mt-4"
          >
            {isLoginView ? t.login : t.register}
          </button>

          <div className="text-center mt-4 pt-4 border-t border-slate-700/50">
            <button 
              type="button"
              onClick={() => { setIsLoginView(!isLoginView); setError(null); }}
              className="text-sm text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white transition-all"
            >
              {isLoginView ? t.noAccount : t.haveAccount}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AuthModal;