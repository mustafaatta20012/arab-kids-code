import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { Star, ExternalLink, Send, CheckCircle2 } from 'lucide-react';



export const AdminSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [starRating, setStarRating] = useState(5);

  const fetchSubmissions = () => {
    setLoading(true);
    fetchApi('/admin/submissions/pending')
      .then((res) => {
        if (res.success && res.data) {
          setSubmissions(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    try {
      await fetchApi(`/admin/submissions/${selectedSub._id || selectedSub.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          teacherFeedback: feedbackText,
          rating: starRating,
        }),
      });

      setSelectedSub(null);
      setFeedbackText('');
      fetchSubmissions();
    } catch (err: any) {
      alert(err.message || 'فشل تقييم المشروع');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">طابور تصحيح مشروعات سكراتش</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">مراجعة روابط مشروعات سكراتش وتزويد الطلاب بملاحظات وتشجيع ونجمات المعلم</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-bold">جاري تحميل المشروعات المعلقة...</div>
      ) : submissions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">لا توجد مشروعات معلقة بانتظار التقييم!</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs">تمت مراجعة وتصحيح كافة المشروعات المسلمة بنجاح.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List of Pending Submissions */}
          <div className="lg:col-span-6 space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub._id}
                onClick={() => {
                  setSelectedSub(sub);
                  setFeedbackText('عمل ممتااااز ورائع جداً يا بطل! استمر في الإبداع وتصميم الألعاب.');
                }}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all cursor-pointer space-y-3 ${
                  selectedSub?._id === sub._id
                    ? 'border-sky-500 shadow-xl ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">
                    {sub.studentId?.displayName || 'طالب'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    الدرس {sub.lessonId?.order || 1}
                  </span>
                </div>

                {sub.scratchLink && (
                  <a
                    href={sub.scratchLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> فتح رابط سكراتش في نافذة جديدة
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Grading Form Panel */}
          <div className="lg:col-span-6">
            {selectedSub ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  تقييم مشروع الطالب: {selectedSub.studentId?.displayName}
                </h3>

                <form onSubmit={handleGrade} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">عدد النجمات الممنوحة (1 - 5)</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setStarRating(star)}
                          className={`p-2 rounded-xl transition-all ${
                            star <= starRating ? 'text-amber-400 scale-110' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        >
                          <Star className="w-8 h-8 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">ملاحظات وتشجيع المعلم مصطفى عطا</label>
                    <textarea
                      rows={4}
                      required
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="اكتب كلمات التشجيع والملاحظات للطالب..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>إرسال التقييم والنجمات للطالب</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500 font-bold text-sm">
                اختر مشروعاً من القائمة الجانبية لبدء معاينته وتقييمه.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
