import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../lib/auth';
import { Seo } from '../components/common/Seo';
import { loginWithPhone, registerParent, forgotPassword } from '../services/authService';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await loginWithPhone(identifier, password);
      setUser(user);
      const role = user.role;
      if (role === 'teacher' || role === 'super_admin') navigate('/admin');
      else if (role === 'parent') navigate('/parent');
      else navigate('/student');
    } catch (err: any) {
      // Firebase error codes → Arabic messages
      const code = err.code || '';
      if (code.includes('wrong-password') || code.includes('invalid-credential')) {
        setErrorMsg('كلمة المرور غير صحيحة');
      } else if (code.includes('user-not-found')) {
        setErrorMsg('لا يوجد حساب بهذا الرقم');
      } else if (code.includes('too-many-requests')) {
        setErrorMsg('تم تجاوز عدد المحاولات، حاول لاحقاً');
      } else {
        setErrorMsg(err.message || 'فشل تسجيل الدخول');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await registerParent({ name, phone, password });
      setUser(user);
      navigate('/parent');
    } catch (err: any) {
      const code = err.code || '';
      if (code.includes('email-already-in-use')) {
        setErrorMsg('هذا الرقم مسجل مسبقاً، يرجى تسجيل الدخول');
      } else if (code.includes('weak-password')) {
        setErrorMsg('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      } else {
        setErrorMsg(err.message || 'فشل إنشاء الحساب');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const email = identifier.includes('@')
        ? identifier
        : `${identifier.replace(/\D/g, '')}@arabkids.app`;
      await forgotPassword(email);
      setSuccessMsg('تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني (إن كان مسجلاً)');
    } catch (err: any) {
      setErrorMsg('فشل إرسال رابط الاسترداد');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400 dark:placeholder:text-slate-500';

  return (
    <>
      <Seo
        title="تسجيل الدخول"
        description="تسجيل الدخول إلى منصة كود أطفال العرب"
        noIndex={true}
      />

      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">

          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-700 text-sky-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab === 'login' ? 'تسجيل الدخول' : 'حساب جديد'}
              </button>
            ))}
          </div>

          {/* Error / Success */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              {successMsg}
            </div>
          )}

          {/* LOGIN form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="01000000000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass + ' pl-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute left-3 top-3.5 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('forgot')}
                className="text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline"
              >
                نسيت كلمة المرور؟
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'جاري التحقق...' : 'دخول للمنصة'}</span>
              </button>
            </form>
          )}

          {/* REGISTER form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">اسم ولي الأمر</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">رقم الواتساب / الهاتف</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01000000000" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">كلمة المرور (6 أحرف فأكثر)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass + ' pl-10'}
                  />
                  <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute left-3 top-3.5 text-slate-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <span>{loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}</span>
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                أدخل رقم هاتفك وسنرسل رابط استعادة كلمة المرور
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">رقم الهاتف</label>
                <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="01000000000" className={inputClass} />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm disabled:opacity-50">
                {loading ? 'جاري الإرسال...' : 'إرسال رابط الاسترداد'}
              </button>
              <button type="button" onClick={() => setActiveTab('login')} className="w-full text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold">
                ← العودة لتسجيل الدخول
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginPage;
