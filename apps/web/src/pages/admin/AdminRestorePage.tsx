/**
 * AdminRestorePage.tsx
 *
 * Hidden page — NOT linked from any nav.
 * Navigate directly to /admin-restore
 *
 * Purpose: re-create the Firestore super_admin document for an existing
 * Firebase Auth account whose Firestore doc was accidentally deleted.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { restoreAdminProfile } from '../../services/authService';
import { Seo } from '../../components/common/Seo';

export const AdminRestorePage: React.FC = () => {
  const navigate = useNavigate();

  const [phone,    setPhone]    = useState('');
  const [name,     setName]     = useState('مصطفى عطا');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await restoreAdminProfile(phone.trim(), password, name.trim());
      setSuccess(true);
      // Redirect to admin panel after 2 seconds
      setTimeout(() => navigate('/admin', { replace: true }), 2000);
    } catch (err: any) {
      const code: string = err.code ?? err.message ?? '';
      if (code.includes('wrong-password') || code.includes('invalid-credential'))
        setError('كلمة المرور غير صحيحة. إذا كان الحساب لا يزال موجوداً في Auth، استخدم كلمة المرور الأصلية.');
      else if (code.includes('weak-password'))
        setError('كلمة المرور قصيرة جداً — استخدم 6 أحرف على الأقل.');
      else if (code.includes('network'))
        setError('تعذر الاتصال بالإنترنت.');
      else
        setError(`خطأ: ${code}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-500 transition-shadow';

  return (
    <>
      <Seo title="استعادة حساب الإدمن" description="" noIndex={true} />

      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">استعادة حساب الإدمن</h1>
            <p className="text-sm text-slate-400">
              أعد إنشاء بيانات الإدمن في Firestore لحساب Auth موجود مسبقاً
            </p>
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-950/50 border border-amber-800 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              هذه الصفحة مخفية ومحمية بكلمة المرور فقط. لا تشارك رابطها.
              سيتم إنشاء Document جديد بدور <strong>super_admin</strong> وحالة <strong>active</strong>.
            </span>
          </div>

          {/* Success state */}
          {success && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              تم استعادة حساب الإدمن بنجاح! جاري تحويلك للوحة التحكم...
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-950/60 border border-rose-700 text-rose-300 text-sm font-bold">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          {!success && (
            <form
              onSubmit={handleRestore}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-5 shadow-2xl"
            >
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">
                  الاسم الكامل للإدمن
                </label>
                <input
                  id="restore-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مصطفى عطا"
                  className={inputClass}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">
                  رقم الهاتف (المسجل في Firebase Auth)
                </label>
                <input
                  id="restore-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01000000000"
                  className={inputClass}
                  dir="ltr"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    id="restore-password"
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputClass} pl-10`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute left-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label="إظهار/إخفاء كلمة المرور"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="btn-restore-admin"
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-4 h-4" />
                {loading ? 'جاري الاستعادة...' : 'استعادة حساب الإدمن'}
              </button>
            </form>
          )}

        </div>
      </div>
    </>
  );
};

export default AdminRestorePage;
