import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  doc, getDoc, collection, addDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, Clock, ShieldAlert, ArrowRight, Lock, MessageCircle, LogIn, ExternalLink, Send } from 'lucide-react';
import { Seo } from '../../components/common/Seo';

export const StudentLessonPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, firebaseUser, hasActiveSubscription } = useAuth();
  const [lesson, setLesson]           = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [errorCode, setErrorCode]     = useState('');
  const [scratchLink, setScratchLink] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [completed, setCompleted]     = useState(false);

  useEffect(() => {
    if (!id) return;

    // Access check
    if (!firebaseUser) {
      setErrorCode('UNAUTHORIZED');
      setError('يجب تسجيل الدخول أولاً لمشاهدة هذا الدرس');
      setLoading(false);
      return;
    }

    if (user && !hasActiveSubscription) {
      if (user.approvalStatus === 'pending') {
        setErrorCode('ACCOUNT_PENDING_APPROVAL');
        setError('حسابك قيد مراجعة المعلم حالياً');
      } else {
        setErrorCode('SUBSCRIPTION_EXPIRED');
        setError('انتهت فترة اشتراكك');
      }
      setLoading(false);
      return;
    }

    // Load lesson from Firestore
    getDoc(doc(db, 'lessons', id))
      .then((snap) => {
        if (snap.exists()) {
          setLesson({ id: snap.id, ...snap.data() });
        } else {
          setError('لم يتم العثور على هذا الدرس');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, firebaseUser, user, hasActiveSubscription]);

  const handleMarkComplete = async () => {
    if (!firebaseUser || !id) return;
    try {
      await setDoc(
        doc(db, 'progress', `${firebaseUser.uid}_${id}`),
        {
          userId:      firebaseUser.uid,
          lessonId:    id,
          isCompleted: true,
          completedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setCompleted(true);
    } catch (_err) {
      // graceful failure
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !id) return;
    try {
      await addDoc(collection(db, 'submissions'), {
        studentId:   firebaseUser.uid,
        studentName: user?.name ?? 'طالب',
        lessonId:    id,
        scratchUrl:  scratchLink,
        status:      'pending',
        submittedAt: serverTimestamp(),
      });
      setSubmitSuccess(true);
    } catch (err: any) {
      alert(err.message || 'فشل إرسال المشروع');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-bold">جاري فتح قاعة الدرس...</div>;
  }

  // Access control error view
  if (error) {
    const isPending =
      errorCode === 'ACCOUNT_PENDING_APPROVAL' ||
      error.includes('awaiting teacher approval') ||
      error.includes('قيد مراجعة المعلم');

    const isExpired =
      errorCode === 'SUBSCRIPTION_EXPIRED' ||
      error.includes('انتهت فترة اشتراكك') ||
      error.includes('expired');

    const isUnauthorized = errorCode === 'UNAUTHORIZED' || error.includes('تسجيل الدخول');
    const isRejected = errorCode === 'ACCOUNT_REJECTED' || error.includes('تم رفض');

    return (
      <>
        <Seo
          title="تنبيه الوصول إلى الدرس"
          description="حالة الوصول إلى الدرس"
          noIndex={true}
        />

        <div className="max-w-2xl mx-auto my-16 px-4">
        <div
          className={`p-8 sm:p-10 rounded-3xl border shadow-2xl text-center space-y-6 ${
            isExpired
              ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
              : isPending
              ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
              : isRejected
              ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          {isExpired ? (
            <div className="w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-10 h-10 animate-bounce" />
            </div>
          ) : isPending ? (
            <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>
          ) : isRejected ? (
            <div className="w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-10 h-10" />
            </div>
          )}

          {/* Status Badge */}
          <div>
            {isExpired && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-200/80 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 text-xs font-black border border-rose-300 dark:border-rose-700">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>حالة الاشتراك: منتهي (Subscription Expired)</span>
              </span>
            )}
            {isPending && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-200/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-black border border-amber-300 dark:border-amber-700">
                <Clock className="w-3.5 h-3.5" />
                <span>حالة الحساب: قيد مراجعة المعلم (Pending Approval)</span>
              </span>
            )}
            {isRejected && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-200/80 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 text-xs font-black border border-rose-300 dark:border-rose-700">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>حالة الحساب: تم سحب / رفض الصلاحية (Access Rejected)</span>
              </span>
            )}
          </div>

          {/* Headline & Subhead */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isExpired
                ? 'انتهت فترة اشتراكك. يُرجى التواصل مع المعلم لتجديد الاشتراك.'
                : isPending
                ? 'حسابك قيد مراجعة المعلم حالياً'
                : isRejected
                ? 'تم رفض طلب الوصول'
                : error}
            </h2>
            {isExpired && (
              <p className="text-xs sm:text-sm font-extrabold text-rose-600 dark:text-rose-400 font-sans tracking-wide">
                Your subscription has expired. Contact the teacher to renew.
              </p>
            )}
            {isPending && (
              <p className="text-xs sm:text-sm font-extrabold text-amber-700 dark:text-amber-400 font-sans tracking-wide">
                Your account is awaiting teacher approval
              </p>
            )}
          </div>

          {/* Explanation Text */}
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-lg mx-auto">
            {isExpired
              ? 'انتهت فترة الاشتراك المحددة لحسابك وأغلقت الدروس تلقائياً. يُرجى التواصل مع المعلم لتجديد الاشتراك وإعادة فتح الدروس.'
              : isPending
              ? 'مرحباً بك يا بطل! تم استلام حسابك بنجاح. الدروس مقفلة بشكل افتراضي ويتم فتحها بمجرد أن يقوم المعلم باعتماد حسابك. يمكنك التواصل مع المعلم مباشرة عبر الواتساب لتسريع التفعيل.'
              : isRejected
              ? 'نعتذر، تم رفض أو سحب صلاحية الوصول لهذا الحساب من قبل المعلم المشرف. يرجى التواصل مع الإدارة لمراجعة حسابك.'
              : 'هذا الدرس مقفل. يرجى تسجيل الدخول أو الاشتراك لفتح جميع دروس الكورس التفاعلي.'}
          </p>

          {/* CTA Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800">
            {isExpired ? (
              <>
                <a
                  href={`https://wa.me/201101587881?text=${encodeURIComponent('مرحباً م. مصطفى عطا، انتهت فترة اشتراكي وأرغب في تجديد الاشتراك لفتح الدروس.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تجديد الاشتراك عبر واتساب 💬</span>
                </a>
                <Link
                  to="/curriculum"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm transition-all"
                >
                  <span>استعراض المنهج</span>
                </Link>
              </>
            ) : isPending ? (
              <>
                <a
                  href="https://wa.me/201101587881?text=مرحباً%20م.%20مصطفى%2C%20أنا%20سجلت%20في%20منصة%20عرب%20كيدز%20كود%20وأنتظر%20الموافقة%20على%20تفعيل%20حسابي%20للدروس"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تأكيد سريع عبر واتساب المعلم</span>
                </a>
                <Link
                  to="/curriculum"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm transition-all"
                >
                  <span>استعراض المنهج</span>
                </Link>
              </>
            ) : isUnauthorized ? (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول / إنشاء حساب</span>
              </Link>
            ) : (
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
              >
                <span>الاطلاع على باقات الكورس</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <Seo
        title={lesson ? `${lesson?.title?.ar || lesson?.title}` : 'مشاهدة الدرس'}
        description={lesson?.summary?.ar || 'مشاهدة درس البرمجة وسكراتش'}
        noIndex={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link to="/student" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-sm hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
          <ArrowRight className="w-4 h-4 rtl:rotate-180" /> العودة للوحة البطل
        </Link>

        {completed ? (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4" /> تم إنجاز هذا الدرس!
          </span>
        ) : (
          <button
            onClick={handleMarkComplete}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" /> تم إكمال مشاهدة الدرس
          </button>
        )}
      </div>

      {/* Lesson Title */}
      <div className="space-y-2">
        <span className="px-3 py-1 rounded-xl bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 text-xs font-black border border-sky-200 dark:border-sky-800">
          الدرس {lesson?.order || 1}
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">{lesson?.title?.ar || lesson?.title}</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{lesson?.summary?.ar || lesson?.summary}</p>
      </div>

      {/* Video & Scratch Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Protected Signed Video Player */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
          <div className="aspect-video w-full">
            <video controls autoPlay className="w-full h-full object-cover">
              <source src={lesson?.videoUrl || '/images/النظام_الثنائي.mp4'} type="video/mp4" />
              متصفحك لا يدعم الفيديو.
            </video>
          </div>
        </div>

        {/* Scratch Sandbox Launcher */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-2xl">
              🐱
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">طبق التحدي على سكراتش!</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              افتح بيئة سكراتش التفاعلية وصمم مشروع اللعبة الخاصة بهذا الدرس.
            </p>
          </div>

          <a
            href={lesson?.scratchProjectUrl || 'https://scratch.mit.edu/projects/editor/'}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-lg transition-transform active:scale-95"
          >
            <span>افتح محرر سكراتش</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Submit Scratch Project Form Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-sky-600 dark:text-sky-400" /> أرسل مشروع سكراتش للمعلم للحصول على تقييم ونجمات
        </h3>

        {submitSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> تم إرسال رابط المشروع بنجاح وسيصلك تقييم المعلم مصطفى عطا قريبًا! (كسبت +40 XP!)
          </div>
        ) : (
          <form onSubmit={handleProjectSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">رابط مشروع سكراتش الخاصة بك (Scratch Project Link)</label>
              <input
                type="url"
                required
                value={scratchLink}
                onChange={(e) => setScratchLink(e.target.value)}
                placeholder="مثال: https://scratch.mit.edu/projects/123456789"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
            >
              تسليم المشروع للمدرس
            </button>
          </form>
        )}
      </div>
    </div>
    </>
  );
};
