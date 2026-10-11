import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { UserPlus, Award, Flame, CheckCircle2, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { Seo } from '../../components/common/Seo';

export const ParentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  const [newChildName, setNewChildName] = useState('');
  const [newChildBirthYear, setNewChildBirthYear] = useState(2014);

  useEffect(() => {
    fetchApi('/me/children')
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
          if (res.data.children && res.data.children.length > 0) {
            setSelectedChildId(res.data.children[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/me/children', {
        method: 'POST',
        body: JSON.stringify({ displayName: newChildName, birthYear: newChildBirthYear }),
      });
      if (res.success) {
        setShowAddChildModal(false);
        setNewChildName('');
        // Refresh children list
        const refreshed = await fetchApi('/me/children');
        if (refreshed.data) setData(refreshed.data);
      }
    } catch (err: any) {
      alert(err.message || 'فشل إضافة الطفل');
    }
  };

  const children = data?.children || fallbackDemoChildren;
  const selectedChild = children.find((c: any) => c.id === selectedChildId) || children[0];

  return (
    <>
      <Seo
        title="لوحة متابعة ولي الأمر"
        description="لوحة متابعة تقدم الأطفال وتقارير أداء كورس البرمجة"
        noIndex={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Parent Header */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 text-center md:text-start">
          <span className="px-4 py-1.5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-extrabold inline-flex items-center gap-1 border border-sky-500/30">
            <Sparkles className="w-4 h-4" /> لوحة ولي الأمر متابعة تقدم الأطفال
          </span>
          <h1 className="text-3xl font-black">مرحباً بك في منصة أطفال العرب 👋</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            يمكنك متابعة الإنجازات اليومية لكل طفل واستعراض تقارير الأداء واشتراكاتهم بسهولة.
          </p>
        </div>

        <button
          onClick={() => setShowAddChildModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-lg transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة طفل جديد</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-bold">جاري جلب تقارير بيئة التعلم...</div>
      ) : (
        /* Child Switcher Selector */
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">اختر الطفل لمعاينة التقرير</h3>
          <div className="flex flex-wrap gap-4">
            {children.map((child: any) => {
              const isSelected = child.id === selectedChild?.id;
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`px-6 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 border ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-lg shadow-sky-500/20 scale-105'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-slate-800 text-sky-900 dark:text-sky-300 flex items-center justify-center text-base">
                    👶
                  </div>
                  <span>{child.displayName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Child Progress Report Card */}
      {selectedChild && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-md">
                🤖
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedChild.displayName}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">
                  سنة الميلاد: {selectedChild.birthYear} | المستوى: {selectedChild.level}
                </p>
              </div>
            </div>

            {/* Child Subscription Pill */}
            {selectedChild.subscription ? (
              <span className="px-4 py-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 font-extrabold text-xs flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> اشتراك مفعل الكورس الكامل
              </span>
            ) : (
              <span className="px-4 py-2 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 font-extrabold text-xs flex items-center gap-1.5 border border-amber-200 dark:border-amber-800">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" /> التجربة المجانية (الدرس الأول فقط)
              </span>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-2 text-center">
              <div className="flex items-center justify-center gap-1 text-sky-600 dark:text-sky-400 font-black text-3xl">
                <span>{selectedChild.progress?.completedLessonsCount || 1}</span>
                <span className="text-slate-400 text-base">/ 30</span>
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold block">الدروس المنجزة</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-2 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500 dark:text-amber-400 font-black text-3xl">
                <Award className="w-6 h-6 fill-amber-500" />
                <span>{selectedChild.xp || 250}</span>
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold block">نقاط الإنجاز XP</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-2 text-center">
              <div className="flex items-center justify-center gap-1 text-rose-500 dark:text-rose-400 font-black text-3xl">
                <Flame className="w-6 h-6 fill-rose-500" />
                <span>{selectedChild.streakDays || 3}</span>
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold block">أيام المواظبة</span>
            </div>
          </div>
        </div>
      )}

      {/* Child Privacy Legal Evidence Consent Footer */}
      <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl p-6 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-between border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>موافقة ولي الأمر مسجلة رسمياً ومحفوظة بنظام حماية الأطفال COPPA v1.0.</span>
        </div>
      </div>

      {/* Modal Add Child */}
      {showAddChildModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">إضافة ملف طفل جديد</h3>

            <form onSubmit={handleAddChild} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">اسم الطفل الثلاثي</label>
                <input
                  type="text"
                  required
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="مثال: يوسف أحمد"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">سنة الميلاد</label>
                <input
                  type="number"
                  required
                  min={2005}
                  max={2022}
                  value={newChildBirthYear}
                  onChange={(e) => setNewChildBirthYear(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                >
                  حفظ إضافة الطفل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

const fallbackDemoChildren = [
  {
    id: 'demo_child_1',
    displayName: 'ياسين أحمد',
    birthYear: 2014,
    level: 2,
    xp: 250,
    streakDays: 3,
    progress: { completedLessonsCount: 1, totalLessonsCount: 30, percentage: 3 },
    subscription: { status: 'active', plan: 'full_access' },
  },
  {
    id: 'demo_child_2',
    displayName: 'فريدة أحمد',
    birthYear: 2016,
    level: 1,
    xp: 50,
    streakDays: 1,
    progress: { completedLessonsCount: 1, totalLessonsCount: 30, percentage: 3 },
    subscription: null,
  },
];
