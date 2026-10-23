/**
 * AdminLessonsPage.tsx
 * Admin panel page to manage lessons: view, add, edit videoUrl & details.
 */
import React, { useState, useEffect } from 'react';
import {
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc,
  orderBy, query, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Plus, Pencil, Trash2, Save, X, Youtube, Video,
  ExternalLink, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react';

interface Lesson {
  id: string;
  order: number;
  title: string;
  titleAr: string;
  description: string;
  isPublic: boolean;
  isFree: boolean;
  durationMin: number;
  xpReward: number;
  videoUrl: string;
  scratchProjectUrl: string;
  objectives: string[];
}

const emptyLesson = (): Omit<Lesson, 'id'> => ({
  order: 1, title: '', titleAr: '', description: '',
  isPublic: false, isFree: false, durationMin: 20, xpReward: 50,
  videoUrl: '', scratchProjectUrl: 'https://scratch.mit.edu/projects/editor/',
  objectives: [],
});

export const AdminLessonsPage: React.FC = () => {
  const [lessons, setLessons]         = useState<Lesson[]>([]);
  const [loading, setLoading]         = useState(true);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editData, setEditData]       = useState<Partial<Lesson>>({});
  const [showAdd, setShowAdd]         = useState(false);
  const [newLesson, setNewLesson]     = useState(emptyLesson());
  const [saving, setSaving]           = useState(false);
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [toast, setToast]             = useState('');

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'lessons'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      setLessons(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lesson)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLessons(); }, []);

  // ── Save edit ─────────────────────────────────────────────────────────────
  const handleSaveEdit = async (id: string) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'lessons', id), { ...editData, updatedAt: serverTimestamp() });
      triggerToast('✅ تم حفظ التعديلات بنجاح');
      setEditingId(null);
      fetchLessons();
    } catch (e: any) {
      alert('فشل الحفظ: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Add new lesson ────────────────────────────────────────────────────────
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const id = `lesson_${newLesson.order}`;
      await setDoc(doc(db, 'lessons', id), {
        ...newLesson,
        createdAt: serverTimestamp(),
      });
      triggerToast(`✅ تم إضافة الدرس ${newLesson.order} بنجاح`);
      setShowAdd(false);
      setNewLesson(emptyLesson());
      fetchLessons();
    } catch (e: any) {
      alert('فشل الإضافة: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete lesson ─────────────────────────────────────────────────────────
  const handleDelete = async (id: string, order: number) => {
    if (!window.confirm(`حذف الدرس ${order}؟ هذا الإجراء لا يمكن التراجع عنه.`)) return;
    try {
      await deleteDoc(doc(db, 'lessons', id));
      triggerToast(`🗑️ تم حذف الدرس ${order}`);
      fetchLessons();
    } catch (e: any) {
      alert('فشل الحذف: ' + e.message);
    }
  };

  const inputClass = 'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';

  const isYoutube = (url: string) => url.includes('youtube') || url.includes('youtu.be');

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 text-sm font-bold">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">إدارة الدروس</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            إضافة وتعديل الدروس وروابط الفيديو ({lessons.length} درس)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchLessons}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          <button onClick={() => setShowAdd(!showAdd)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all">
            <Plus className="w-4 h-4" />
            إضافة درس جديد
          </button>
        </div>
      </div>

      {/* Add Lesson Form */}
      {showAdd && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-sky-200 dark:border-sky-800 p-6 space-y-4 shadow-xl">
          <h2 className="font-black text-slate-900 dark:text-white text-lg">➕ درس جديد</h2>
          <form onSubmit={handleAddLesson} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">رقم الدرس</label>
              <input type="number" required min={1} value={newLesson.order}
                onChange={(e) => setNewLesson({ ...newLesson, order: +e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">المدة (دقيقة)</label>
              <input type="number" min={5} value={newLesson.durationMin}
                onChange={(e) => setNewLesson({ ...newLesson, durationMin: +e.target.value })}
                className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">عنوان الدرس (عربي)</label>
              <input type="text" required value={newLesson.titleAr}
                onChange={(e) => setNewLesson({ ...newLesson, titleAr: e.target.value, title: e.target.value })}
                placeholder="مثال: الدرس 1: مرحباً بعالم البرمجة"
                className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">وصف الدرس</label>
              <textarea rows={2} value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                رابط الفيديو (YouTube أو رابط مباشر)
              </label>
              <input type="url" value={newLesson.videoUrl}
                onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className={inputClass} dir="ltr" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">رابط مشروع سكراتش</label>
              <input type="url" value={newLesson.scratchProjectUrl}
                onChange={(e) => setNewLesson({ ...newLesson, scratchProjectUrl: e.target.value })}
                className={inputClass} dir="ltr" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={newLesson.isFree}
                  onChange={(e) => setNewLesson({ ...newLesson, isFree: e.target.checked, isPublic: e.target.checked })}
                  className="w-4 h-4 rounded" />
                درس مجاني (عام)
              </label>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">نقاط XP</label>
                <input type="number" min={10} value={newLesson.xpReward}
                  onChange={(e) => setNewLesson({ ...newLesson, xpReward: +e.target.value })}
                  className={`${inputClass} w-24`} />
              </div>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setShowAdd(false)}
                className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50">
                إلغاء
              </button>
              <button type="submit" disabled={saving}
                className="px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50">
                {saving ? 'جاري الحفظ...' : '+ إضافة الدرس'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lessons Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-bold">جاري تحميل الدروس...</div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">لا توجد دروس في Firestore بعد</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              شغّل: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono text-xs">node scripts/seed-lessons.js</code> لإضافة 30 درساً تلقائياً
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {lessons.map((lesson) => {
              const isEditing  = editingId === lesson.id;
              const isExpanded = expandedId === lesson.id;
              const hasVideo   = !!lesson.videoUrl;

              return (
                <div key={lesson.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  {/* Row */}
                  <div className="flex items-center gap-4 px-6 py-4">
                    {/* Order badge */}
                    <span className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-black text-sm flex items-center justify-center shrink-0">
                      {lesson.order}
                    </span>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-slate-900 dark:text-white text-sm truncate">
                        {lesson.titleAr || lesson.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {lesson.isFree && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">مجاني</span>
                        )}
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{lesson.durationMin} د • {lesson.xpReward} XP</span>
                        {hasVideo ? (
                          isYoutube(lesson.videoUrl) ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              <Youtube className="w-3 h-3" /> YouTube
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                              <Video className="w-3 h-3" /> فيديو مباشر
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">⚠️ لا يوجد فيديو</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {lesson.videoUrl && (
                        <a href={lesson.videoUrl} target="_blank" rel="noreferrer"
                          className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-all"
                          title="معاينة الفيديو">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => { setExpandedId(isExpanded ? null : lesson.id); setEditingId(isExpanded ? null : lesson.id); setEditData(lesson); }}
                        className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-all"
                        title="تعديل">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDelete(lesson.id, lesson.order)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                        title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Edit Form (expandable) */}
                  {isEditing && isExpanded && (
                    <div className="px-6 pb-6 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4 bg-slate-50/50 dark:bg-slate-800/20">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">عنوان الدرس (عربي)</label>
                          <input type="text" value={editData.titleAr ?? ''}
                            onChange={(e) => setEditData({ ...editData, titleAr: e.target.value, title: e.target.value })}
                            className={inputClass} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">وصف الدرس</label>
                          <textarea rows={2} value={editData.description ?? ''}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            className={inputClass} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                            <Youtube className="w-3.5 h-3.5 text-rose-500" />
                            رابط الفيديو (YouTube أو رابط مباشر)
                          </label>
                          <input type="url" value={editData.videoUrl ?? ''}
                            onChange={(e) => setEditData({ ...editData, videoUrl: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className={inputClass} dir="ltr" />
                          <p className="text-[11px] text-slate-400 mt-1">يمكنك وضع رابط YouTube مباشر أو رابط فيديو مباشر (Firebase Storage)</p>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">رابط مشروع سكراتش</label>
                          <input type="url" value={editData.scratchProjectUrl ?? ''}
                            onChange={(e) => setEditData({ ...editData, scratchProjectUrl: e.target.value })}
                            className={inputClass} dir="ltr" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">المدة (دقيقة)</label>
                          <input type="number" min={5} value={editData.durationMin ?? 20}
                            onChange={(e) => setEditData({ ...editData, durationMin: +e.target.value })}
                            className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">نقاط XP</label>
                          <input type="number" min={10} value={editData.xpReward ?? 50}
                            onChange={(e) => setEditData({ ...editData, xpReward: +e.target.value })}
                            className={inputClass} />
                        </div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input type="checkbox" checked={editData.isFree ?? false}
                            onChange={(e) => setEditData({ ...editData, isFree: e.target.checked, isPublic: e.target.checked })}
                            className="w-4 h-4 rounded" />
                          درس مجاني (عام لغير المشتركين)
                        </label>
                      </div>
                      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => { setEditingId(null); setExpandedId(null); }}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50">
                          <X className="w-3.5 h-3.5" /> إلغاء
                        </button>
                        <button onClick={() => handleSaveEdit(lesson.id)} disabled={saving}
                          className="inline-flex items-center gap-1 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50">
                          <Save className="w-3.5 h-3.5" />
                          {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLessonsPage;
