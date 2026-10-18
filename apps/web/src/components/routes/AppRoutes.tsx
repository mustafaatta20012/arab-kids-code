/**
 * AppRoutes.tsx — route guard components.
 *
 * Added: LessonRoute — checks login + account status.
 * - Not logged in      → /login (saves original path)
 * - status: pending    → PendingScreen (with WhatsApp CTA)
 * - status: suspended  → SuspendedScreen
 * - status: active     → renders lesson  ✓
 * - isAdmin            → always renders  ✓
 */
import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MessageCircle, Clock, ShieldAlert } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

// ── ProtectedRoute ────────────────────────────────────────────────────────

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
};

// ── AdminRoute ────────────────────────────────────────────────────────────

export const AdminRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading)          return <AuthSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin)         return <Navigate to="/" replace />;
  return <>{children}</>;
};

// ── GuestRoute ────────────────────────────────────────────────────────────

export const GuestRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();

  if (loading) return <AuthSpinner />;

  if (isAuthenticated) {
    if (isAdmin)                  return <Navigate to="/admin"   replace />;
    if (user?.role === 'parent')  return <Navigate to="/parent"  replace />;
    return                               <Navigate to="/student" replace />;
  }

  return <>{children}</>;
};

// ── LessonRoute ───────────────────────────────────────────────────────────

/**
 * Guards lesson content:
 *   not logged in  → /login
 *   pending        → <PendingApprovalScreen>
 *   suspended      → <SuspendedScreen>
 *   active / admin → renders lesson content
 */
export const LessonRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isAdmin, hasAccess, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAdmin || hasAccess) return <>{children}</>;

  const status = user?.status ?? 'pending';

  if (status === 'suspended') return <SuspendedScreen />;
  return <PendingApprovalScreen />;
};

// ── Status screens ────────────────────────────────────────────────────────

const PendingApprovalScreen: React.FC = () => {
  const { user } = useAuth();
  const waMsg = encodeURIComponent(
    `مرحباً م. مصطفى عطا، أنا ${user?.name ?? ''} (${user?.phone ?? ''}) — سجلت في منصة كود أطفال العرب وأنتظر تفعيل حسابي للدروس.`
  );
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-amber-50 dark:bg-amber-950/30 rounded-3xl p-10 border border-amber-200 dark:border-amber-800 text-center space-y-6 shadow-2xl">
        <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center mx-auto">
          <Clock className="w-10 h-10 animate-pulse" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-xs font-black">
          <Clock className="w-3.5 h-3.5" /> حسابك قيد المراجعة — Pending Approval
        </span>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          جاري مراجعة حسابك يا {user?.name?.split(' ')[0] ?? 'بطل'} 🌟
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          تم استلام تسجيلك بنجاح! ستُفتح جميع الدروس تلقائياً في اللحظة التي يوافق فيها المعلم على حسابك — <strong>بدون الحاجة لإعادة تسجيل الدخول</strong>.
        </p>
        <p className="text-xs text-slate-400">Your account is awaiting teacher approval. Lessons will unlock automatically.</p>
        <a
          href={`https://wa.me/201101587881?text=${waMsg}`}
          target="_blank" rel="noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
        >
          <MessageCircle className="w-5 h-5" /> تأكيد سريع مع المعلم عبر واتساب
        </a>
        <Link to="/curriculum" className="block text-xs text-slate-500 hover:text-sky-600 font-bold transition-colors">
          ← استعراض فهرس الدروس
        </Link>
      </div>
    </div>
  );
};

const SuspendedScreen: React.FC = () => (
  <div className="min-h-[70vh] flex items-center justify-center px-4">
    <div className="max-w-md w-full bg-rose-50 dark:bg-rose-950/30 rounded-3xl p-10 border border-rose-200 dark:border-rose-800 text-center space-y-6 shadow-2xl">
      <div className="w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-200/80 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200 text-xs font-black">
        <ShieldAlert className="w-3.5 h-3.5" /> تم تعليق الحساب — Account Suspended
      </span>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white">
        تم تعليق صلاحية الوصول مؤقتاً
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        يرجى التواصل مع المعلم لمعرفة السبب وإعادة تفعيل الحساب.
      </p>
      <a
        href="https://wa.me/201101587881?text=مرحباً م. مصطفى، تم تعليق حسابي وأرغب في معرفة السبب."
        target="_blank" rel="noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md transition-all"
      >
        <MessageCircle className="w-5 h-5" /> تواصل مع المعلم عبر واتساب
      </a>
    </div>
  </div>
);

// ── Shared spinner ────────────────────────────────────────────────────────

export const AuthSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
        جاري التحقق من الجلسة...
      </p>
    </div>
  </div>
);
