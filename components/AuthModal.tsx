import React, { useState } from 'react';
import { X, User, Mail, Lock, LogIn } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // التحقق من المدخلات الأساسية
    if (!formData.email || !formData.password || (!isLoginView && !formData.username)) {
      setError(t.error);
      return;
    }

    try {
      // نحدد المسار بناءً على الحالة (دخول أم تسجيل)
      const endpoint = isLoginView ? 'login' : 'register';
      
      const response = await fetch(`https://visual-reading-backend.onrender.com/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username // سيرسل فقط في حالة التسجيل
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (isLoginView) {
          // في حالة نجاح تسجيل الدخول
          localStorage.setItem('token', data.token);
          
          // محاكاة بيانات المستخدم لإرجاعها للواجهة (يمكنك تحسينها بجلب بيانات المستخدم من السيرفر)
          const loggedUser: UserType = {
            id: '1', 
            username: formData.email.split('@')[0],
            email: formData.email,
            createdAt: Date.now()
          };
          
          onLogin(loggedUser);
          onClose();
          alert('تم تسجيل الدخول بنجاح!');
        } else {
          // في حالة نجاح التسجيل
          alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
          setIsLoginView(true);
        }
      } else {
        setError(data.error || 'حدث خطأ في العملية');
      }
    } catch (err) {
      setError('السيرفر لا يستجيب، تأكد من تشغيل Node.js على بورت 4000');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {isLoginView ? <LogIn size={24} className="text-blue-500" /> : <User size={24} className="text-green-500" />}
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
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500"
                  placeholder={t.username}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm text-slate-400">{t.email}</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-400">{t.password}</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            {isLoginView ? t.login : t.register}
          </button>

          <div className="text-center mt-4 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={() => { setIsLoginView(!isLoginView); setError(null); }}
              className="text-sm text-slate-400 hover:text-white underline transition-colors"
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
