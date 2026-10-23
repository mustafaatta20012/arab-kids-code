import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Seo } from '../components/common/Seo';

// ── Firebase error code → Arabic message ─────────────────────────────────
const mapAuthError = (code: string): string => {
  if (code.includes('invalid-credential') || code.includes('wrong-password'))
    return 'رقم الهاتف أو كلمة المرور غير صحيحة';
  if (code.includes('user-not-found'))
    return 'لا يوجد حساب بهذا الرقم، يرجى إنشاء حساب جديد';
  if (code.includes('profile-not-found'))
    return 'تم التحقق من الهوية بنجاح، لكن بيانات حسابك في قاعدة البيانات محذوفة. يُرجى استخدام صفحة استعادة الإدمن على /admin-restore';
  if (code.includes('too-many-requests'))
    return 'تم تجاوز عدد المحاولات، يرجى الانتظار قليلاً ثم المحاولة مجدداً';
  if (code.includes('network-request-failed'))
    return 'تعذر الاتصال بالإنترنت، تحقق من الشبكة وأعد المحاولة';
  if (code.includes('email-already-in-use'))
    return 'هذا الرقم مسجل مسبقاً، يرجى تسجيل الدخول';
  if (code.includes('weak-password'))
    return 'كلمة المرور قصيرة جداً — استخدم 6 أحرف على الأقل';
  if (code.includes('popup-closed-by-user'))
    return 'تم إغلاق نافذة تسجيل الدخول قبل الاكتمال';
  return 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, resetPassword } = useAuth();


  // Redirect destination after login (saved by ProtectedRoute)
  const from = (location.state as any)?.from?.pathname;

  const [activeTab, setActiveTab]     = useState<'login' | 'register' | 'forgot'>('login');
  const [phone, setPhone]             = useState('');
  const [name, setName]               = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');
  const [successMsg, setSuccessMsg]   = useState('');
  const [loading, setLoading]         = useState(false);

  // Decide where to redirect after successful login
  const redirectAfterLogin = (role: string) => {
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'teacher' || role === 'super_admin') navigate('/admin', { replace: true });
    else if (role === 'parent') navigate('/parent', { replace: true });
    else navigate('/student', { replace: true });
  };

  // ── Login ──────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const profile = await login(phone.trim(), password);
      redirectAfterLogin(profile.role);
    } catch (err: any) {
      setErrorMsg(mapAuthError(err.code ?? err.message ?? ''));
    } finally {
      setLoading(false);
    }
  };

  // ── Register ───────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const profile = await register(name.trim(), phone.trim(), password);
      redirectAfterLogin(profile.role);
    } catch (err: any) {
      setErrorMsg(mapAuthError(err.code ?? err.message ?? ''));
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ────────────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');
    setLoading(true);
    try {
      await resetPassword(phone.trim());
      setSuccessMsg('إذا كان الرقم مسجلاً، ستصل رسالة استعادة كلمة المرور إلى البريد المرتبط به.');
    } catch (err: any) {
      setErrorMsg(mapAuthError(err.code ?? err.message ?? ''));
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-shadow';

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
                onClick={() => switchTab(tab)}
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

          {/* Error */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              {successMsg}
            </div>
          )}

          {/* LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">رقم الهاتف</label>
                <input id="login-phone" type="tel" required value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01000000000" className={inputClass} autoComplete="tel" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">كلمة المرور</label>
                <div className="relative">
                  <input id="login-password" type={showPassword ? 'text' : 'password'} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" className={`${inputClass} pl-10`} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword((p) => !p)}
                    className="absolute left-3 top-3.5 text-slate-400" aria-label="إظهار/إخفاء كلمة المرور">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="button" onClick={() => switchTab('forgot')}
                className="text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline">
                نسيت كلمة المرور؟
              </button>
              <button id="btn-login" type="submit" disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'جاري التحقق...' : 'دخول للمنصة'}</span>
              </button>
            </form>
          )}

          {/* REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">اسم ولي الأمر</label>
                <input id="reg-name" type="text" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم الكامل" className={inputClass} autoComplete="name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">رقم الواتساب / الهاتف</label>
                <input id="reg-phone" type="tel" required value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01000000000" className={inputClass} autoComplete="tel" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">كلمة المرور (6 أحرف فأكثر)</label>
                <div className="relative">
                  <input id="reg-password" type={showPassword ? 'text' : 'password'} required
                    minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" className={`${inputClass} pl-10`} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword((p) => !p)}
                    className="absolute left-3 top-3.5 text-slate-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button id="btn-register" type="submit" disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                <span>{loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}</span>
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4" noValidate>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                أدخل رقم هاتفك وسنرسل رابط استعادة كلمة المرور.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">رقم الهاتف</label>
                <input id="forgot-phone" type="tel" required value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01000000000" className={inputClass} />
              </div>
              <button id="btn-forgot" type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {loading ? 'جاري الإرسال...' : 'إرسال رابط الاسترداد'}
              </button>
              <button type="button" onClick={() => switchTab('login')}
                className="w-full text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold">
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
