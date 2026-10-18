import React, { useState, useEffect } from 'react';
import { Star, Check, X } from 'lucide-react';
import { getPendingReviews, moderateReview } from '../../services/adminService';


export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    getPendingReviews()
      .then((data) => setReviews(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleModerate = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      await moderateReview(reviewId, status);
      fetchReviews();
    } catch (_err) {
      alert('فشل مراجعة التقييم');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">طابور مراجعة التقييمات العامة</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">الموافقة على آراء أولياء الأمور والطلاب ونشرها على الصفحة الرئيسية</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-bold">جاري تحميل التقييمات المعلقة...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm shadow-sm">
          لا توجد تقييمات جديدة بانتظار المراجعة حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">{rev.authorName}</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic">"{rev.comment}"</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleModerate(rev.id, 'rejected')}
                  className="px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-extrabold text-xs flex items-center gap-1 transition-colors"
                >
                  <X className="w-4 h-4" /> رفض التقييم
                </button>

                <button
                  onClick={() => handleModerate(rev.id, 'approved')}
                  className="px-5 py-2 rounded-xl bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-md transition-colors"
                >
                  <Check className="w-4 h-4" /> الموافقة ونشر التقييم
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
