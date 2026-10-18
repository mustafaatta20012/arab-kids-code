import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Flame, Play, CheckCircle2, Lock, Sparkles, FolderKanban } from 'lucide-react';
import { Seo } from '../../components/common/Seo';
import { useAuthStore } from '../../lib/auth';
import { getLessons } from '../../services/lessonsService';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLessons()
      .then((data) => setLessons(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const studentName = user?.name || 'البطل الصغير';
  const xp = 250;
  const level = 2;
  const streak = 3;
  const badges = ['بطل الدرس الأول', 'مبتكر الألعاب'];

  const completedCount = lessons.filter((l) => l.isCompleted).length || 1;
  const progressPercent = Math.round((completedCount / 30) * 100);

  return (
    <>
      <Seo
        title={`لوحة البطل ${studentName}`}
        description="لوحة تحكم الطالب لمتابعة التقدم والدروس والأوسمة"
        noIndex={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 text-center md:text-right">
          <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold inline-flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" /> لوحة البطل الصغير
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">أهلاً بك يا {studentName}! 👋</h1>
          <p className="text-sky-100 text-sm font-medium max-w-xl">
            أنت في المستوي {level}! واصل مشوارك اليوم لتصمم لعبتك القادمة وتكسب المزيد من نقاط الـ XP الأوسمة!
          </p>
        </div>

        {/* Gamification Stats Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center min-w-[260px] space-y-4">
          <div className="flex items-center justify-around gap-4">
            <div>
              <div className="flex items-center justify-center gap-1 text-amber-300 font-black text-2xl">
                <Award className="w-6 h-6 fill-amber-300 text-amber-300" />
                <span>{xp}</span>
              </div>
              <span className="text-xs text-sky-200 font-bold">مجموع الـ XP</span>
            </div>

            <div className="h-10 w-px bg-white/20"></div>

            <div>
              <div className="flex items-center justify-center gap-1 text-rose-400 font-black text-2xl">
                <Flame className="w-6 h-6 fill-rose-400 text-rose-400" />
                <span>{streak}</span>
              </div>
              <span className="text-xs text-sky-200 font-bold">أيام المواظبة</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/20 flex justify-between text-xs font-bold">
            <span>المستوى الحالي: {level}</span>
            <span>الهدف القادم: {level * 100} XP</span>
          </div>
        </div>
      </div>

      {/* Progress & Quick Links Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">تقدمك في منهج سكراتش</h3>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent || 3}%` }}
            ></div>
          </div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 text-start">
            أنجزت {completedCount} من 30 درساً ({progressPercent}%)
          </p>
        </div>

        {/* Badges Collection */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 md:col-span-2">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">أوسمة الأبطال والإنجازات</h3>
          <div className="flex flex-wrap gap-3">
            {badges.map((badge: string, idx: number) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 font-extrabold text-xs shadow-sm flex items-center gap-1.5 border border-amber-200 dark:border-amber-800"
              >
                🏆 {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Lessons List Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">مسيرة دروسك البرمجية</h2>
          <Link
            to="/student/projects"
            className="inline-flex items-center gap-2 text-sky-600 dark:text-sky-400 font-extrabold text-sm hover:underline"
          >
            <FolderKanban className="w-4 h-4" /> مشروعاتي المرسلة للمعلم
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-bold">جاري تحميل لوحة الدروس...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(lessons.length > 0 ? lessons : fallbackStudentLessons).map((lesson) => (
              <div
                key={lesson.order}
                className={`rounded-3xl p-6 border transition-all space-y-4 flex flex-col justify-between ${
                  lesson.isUnlocked
                    ? 'bg-white dark:bg-slate-900 border-sky-200 dark:border-sky-800/80 shadow-xl hover:-translate-y-1'
                    : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black">
                      الدرس {lesson.order}
                    </span>
                    {lesson.isUnlocked ? (
                      <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-black flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> جاهز للبدء
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> مغلق
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{lesson.title?.ar || lesson.title}</h3>
                </div>

                {lesson.isUnlocked ? (
                  <Link
                    to={`/student/lessons/${lesson.id || lesson.order}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>ابدأ التعلم الآن</span>
                  </Link>
                ) : (
                  <div className="w-full py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-center text-xs">
                    يتطلب تفعيل الاشتراك
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

const fallbackStudentLessons = Array.from({ length: 30 }, (_, i) => ({
  id: `lesson_${i + 1}`,
  order: i + 1,
  title: { ar: `الدرس ${i + 1}: تصميم ولعبة تفاعلية` },
  isUnlocked: i === 0,
}));
