import React, { useState, useEffect } from 'react';
import { Users, CreditCard, Star, FolderKanban } from 'lucide-react';
import { getAnalytics } from '../../services/adminService';

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const overview = data ? {
    totalStudents:           data.totalUsers,
    activeSubscriptions:     data.approvedUsers,
    pendingReviewsCount:     data.totalReviews,
    pendingSubmissionsCount: data.totalSubmissions,
  } : {
    totalStudents: 0, activeSubscriptions: 0,
    pendingReviewsCount: 0, pendingSubmissionsCount: 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">نظرة عامة والتحليلات الإحصائية</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">متابعة إحصائيات منصة كود أطفال العرب والنشاط اليومي</p>
      </div>

      {/* Stats Overview Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-bold">جاري تحميل الإحصائيات والتحليلات...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">إجمالي الطلاب النشطين</span>
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white">{overview.totalStudents}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">الاشتراكات المفعلة</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white">{overview.activeSubscriptions}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">مشروعات بانتظار التقييم</span>
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white">{overview.pendingSubmissionsCount}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">تقييمات جديدة للمراجعة</span>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white">{overview.pendingReviewsCount}</span>
          </div>
        </div>
      )}

    </div>
  );
};
