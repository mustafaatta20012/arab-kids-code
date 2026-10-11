import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { Lock, Unlock, Play, Search, Sparkles, Clock, Award } from 'lucide-react';
import { Seo } from '../components/common/Seo';

export const CurriculumPage: React.FC = () => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/lessons')
      .then((res) => {
        if (res.success && res.data) {
          setLessons(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredLessons = (lessons.length > 0 ? lessons : fallback30Lessons).filter((l) =>
    l.title.ar.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <Seo
        title="منهج كورس البرمجة وسكراتش للأطفال (30 درساً)"
        description="استعرض الخطة والمحتوى التعليمي الشامل لـ 30 درساً عملياً في لغة سكراتش وتصميم الألعاب للأطفال والناشئين من سن 6 إلى 14 سنة مع المهندس مصطفى عطا."
        keywords="منهج كورس البرمجة, دروس سكراتش للأطفال, كورس سكراتش 30 درساً, برمجة ألعاب للأطفال, كود أطفال العرب, مصطفى عطا"
        canonicalPath="/curriculum"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 text-xs font-extrabold border border-sky-200 dark:border-sky-800">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" /> منهج الـ 30 درساً التفاعلي
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
          منهج كورس البرمجة وتصميم الألعاب
        </h1>
        <p className="text-slate-600 dark:text-slate-300 font-medium text-base sm:text-lg leading-relaxed">
          تدرج عملي ومبسط يبدأ من مفاهيم الكمبيوتر الأساسية وحتى تصميم ألعاب ثلاثية وتقديم مشروع التخرج النهائي.
        </p>

        {/* Search Bar */}
        <div className="pt-4 max-w-md mx-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في عناوين الدروس..."
            className="w-full px-5 py-3.5 pr-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
        </div>
      </div>

      {/* Grid of 30 Lessons */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 font-bold">جاري تحميل منهج الدروس...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => {
            const isFree = lesson.isFree || lesson.order === 1;
            const isUnlocked = lesson.isUnlocked || isFree;

            return (
              <div
                key={lesson.order}
                className={`rounded-3xl p-6 border transition-all space-y-4 flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-white dark:bg-slate-900 border-sky-200 dark:border-sky-900/60 shadow-lg shadow-sky-500/5 hover:-translate-y-1'
                    : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 opacity-90'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black">
                      الدرس {lesson.order}
                    </span>
                    {isFree ? (
                      <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-black flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                        <Unlock className="w-3.5 h-3.5" /> مجاني
                      </span>
                    ) : isUnlocked ? (
                      <span className="px-3 py-1 rounded-xl bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 text-xs font-black flex items-center gap-1 border border-sky-200 dark:border-sky-800">
                        <Unlock className="w-3.5 h-3.5" /> مفتوح
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> مغلق
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                    {lesson.title.ar}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
                    {lesson.summary.ar}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-sky-500" /> {lesson.durationMin || 15} دقيقة
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-500" /> +{lesson.xpReward || 50} XP
                    </span>
                  </div>

                  {isUnlocked ? (
                    <Link
                      to={isFree ? '/lessons/free' : `/lessons/${lesson.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>شاهد وركز في الدرس</span>
                    </Link>
                  ) : (
                    <Link
                      to="/pricing"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      <span>اشترك لفتح هذا الدرس</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
};

const fallback30Lessons = Array.from({ length: 30 }, (_, i) => ({
  id: `lesson_${i + 1}`,
  order: i + 1,
  title: { ar: `الدرس ${i + 1}: موضوع تفاعلي لتعليم سكراتش وتصميم الألعاب` },
  summary: { ar: `في هذا الدرس الممتع يتعلم الطفل مفاهيم برمجة الألعاب والتطبيق العملي البسيط.` },
  isFree: i === 0,
  isUnlocked: i === 0,
  durationMin: 15,
  xpReward: 50,
}));
