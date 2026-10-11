import React from 'react';
import { AlertTriangle, Clock, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../lib/auth';

export const SubscriptionBanner: React.FC = () => {
  const { user } = useAuthStore();

  if (!user || user.role !== 'student' || !user.subscriptionEnd) {
    return null;
  }

  const end = new Date(user.subscriptionEnd);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const isExpired = diffMs <= 0;
  const isExpiringSoon = diffDays <= 2 && !isExpired;

  // Banner is only displayed when 2 days or fewer remain or when expired
  if (!isExpired && !isExpiringSoon) {
    return null;
  }

  const formattedDate = end.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const whatsappMessage = isExpired
    ? encodeURIComponent(`مرحباً م. مصطفى عطا، انتهت فترة اشتراكي بحساب (${user.name}) وأرغب في تجديد الاشتراك لفتح الدروس.`)
    : encodeURIComponent(`مرحباً م. مصطفى عطا، اشتراكي بحساب (${user.name}) ينتهي في تاريخ ${formattedDate} وأرغب في تجديد الاشتراك.`);

  return (
    <aside
      role="alert"
      aria-live="assertive"
      className={`w-full z-50 sticky top-0 px-4 py-2.5 shadow-md transition-colors ${
        isExpired
          ? 'bg-rose-600 text-white dark:bg-rose-950 dark:text-rose-100 border-b border-rose-700 dark:border-rose-900'
          : 'bg-amber-500 text-slate-950 dark:bg-amber-950 dark:text-amber-100 border-b border-amber-600 dark:border-amber-900'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-bold">
        <div className="flex items-center gap-2 text-center sm:text-right">
          {isExpired ? (
            <AlertTriangle className="w-5 h-5 shrink-0 text-white dark:text-rose-400 animate-pulse" />
          ) : (
            <Clock className="w-5 h-5 shrink-0 text-slate-950 dark:text-amber-400" />
          )}
          <span>
            {isExpired
              ? 'انتهت فترة اشتراكك. يُرجى التواصل مع المعلم لتجديد الاشتراك وفتح الدروس.'
              : `ينتهي اشتراكك في ${formattedDate}. يُرجى التواصل مع المعلم لتجديد الاشتراك.`}
          </span>
        </div>

        <a
          href={`https://wa.me/201101587881?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تواصل مع المعلم مصطفى عطا عبر واتساب لتجديد الاشتراك"
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black shadow-sm transition-transform active:scale-95 ${
            isExpired
              ? 'bg-white text-rose-700 hover:bg-rose-50 dark:bg-rose-100 dark:text-rose-900'
              : 'bg-slate-950 text-white hover:bg-slate-900 dark:bg-amber-400 dark:text-slate-950'
          }`}
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>تواصل مع المعلم للتجديد 💬</span>
        </a>
      </div>
    </aside>
  );
};
