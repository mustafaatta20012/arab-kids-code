import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Star, ExternalLink, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Seo } from '../../components/common/Seo';
import { useAuth } from '../../context/AuthContext';
import { getMySubmissions } from '../../services/lessonsService';

export const StudentProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    getMySubmissions(user.uid)
      .then((data) => setSubmissions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.uid]);

  return (
    <>
      <Seo
        title="مشروعاتي المرسلة"
        description="متابعة مشروعات الطالب وتقييمات المعلم مصطفى عطا"
        noIndex={true}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">مشروعاتي المرسلة للمعلم</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">متابعة تقييمات وملاحظات المهندس مصطفى عطا على مشروعاتك</p>
        </div>
        <Link to="/student" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-sm hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
          <ArrowRight className="w-4 h-4 rtl:rotate-180" /> العودة للوحة البطل
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-bold">جاري تحميل مشروعاتك...</div>
      ) : submissions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <FolderKanban className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">لم تقم بإرسال مشروعات بعد!</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs">شاهد الدروس وطبق تحدي سكراتش لتسليم أول مشروع لك وتلقي نجمات المعلم.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 dark:text-white text-base">
                  مشروع الدرس {sub.lessonId}
                </span>

                {sub.status === 'reviewed' ? (
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-black flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> تمت المراجعة والتقييم
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs font-black flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                    <Clock className="w-3.5 h-3.5" /> قيد مراجعة المعلم
                  </span>
                )}
              </div>

              {sub.scratchUrl && (
                <a
                  href={sub.scratchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold text-xs hover:underline"
                >
                  <ExternalLink className="w-4 h-4" /> مشاهدة مشروع سكراتش
                </a>
              )}

              {sub.feedback && (
                <div className="bg-sky-50 dark:bg-sky-950/50 p-4 rounded-2xl border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-xs space-y-2">
                  <div className="flex items-center gap-1 font-extrabold text-sky-800 dark:text-sky-300">
                    <span>ملاحظات المعلم مصطفى عطا:</span>
                    {sub.score && (
                      <div className="flex text-amber-400 mr-2">
                        {Array.from({ length: Math.min(sub.score, 5) }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="italic">"{sub.feedback}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
