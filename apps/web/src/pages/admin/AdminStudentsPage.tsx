import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { Search, Download, UserPlus, RefreshCw, Lock, Unlock, Clock } from 'lucide-react';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [childName, setChildName] = useState('');
  const [childBirthYear, setChildBirthYear] = useState(2014);

  // Renewal Modal State
  const [selectedStudentForRenewal, setSelectedStudentForRenewal] = useState<any | null>(null);
  const [renewalStartDate, setRenewalStartDate] = useState('');
  const [renewalEndDate, setRenewalEndDate] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchStudents = () => {
    setLoading(true);
    fetchApi(`/admin/students?q=${encodeURIComponent(searchQuery)}`)
      .then((res) => {
        if (res.success && res.data) {
          setStudents(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, [searchQuery]);

  const handleOpenRenew = (student: any) => {
    const today = new Date().toISOString().split('T')[0];
    const defaultEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setSelectedStudentForRenewal(student);
    setRenewalStartDate(student.subscriptionStart ? student.subscriptionStart.split('T')[0] : today);
    setRenewalEndDate(student.subscriptionEnd ? student.subscriptionEnd.split('T')[0] : defaultEnd);
  };

  const handleSaveRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForRenewal) return;

    const targetUserId = selectedStudentForRenewal.userId || selectedStudentForRenewal.id;
    setActionLoadingId(selectedStudentForRenewal.id);
    try {
      const res = await fetchApi(`/admin/users/${targetUserId}/renew`, {
        method: 'POST',
        body: JSON.stringify({ newEndDate: renewalEndDate }),
      });

      if (res.success) {
        setSelectedStudentForRenewal(null);
        fetchStudents();
        alert(`تم تجديد اشتراك الطالب ${selectedStudentForRenewal.displayName} بنجاح حتى ${renewalEndDate}`);
      }
    } catch (err: any) {
      alert(err.message || 'فشل تجديد الاشتراك');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRevoke = async (student: any) => {
    if (!window.confirm(`هل أنت متأكد من سحب وإلغاء اشتراك الطالب (${student.displayName}) وقفل جميع الدروس فوراً؟`)) {
      return;
    }

    const targetUserId = student.userId || student.id;
    setActionLoadingId(student.id);
    try {
      const res = await fetchApi(`/admin/users/${targetUserId}/revoke`, {
        method: 'POST',
      });
      if (res.success) {
        fetchStudents();
        alert(`تم سحب وإلغاء اشتراك الطالب ${student.displayName} وقفل الدروس`);
      }
    } catch (err: any) {
      alert(err.message || 'فشل سحب الاشتراك');
    } finally {
      setActionLoadingId(null);
    }
  };

  const addDaysToStartDate = (days: number) => {
    const base = renewalStartDate ? new Date(renewalStartDate) : new Date();
    const newDate = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    setRenewalEndDate(newDate.toISOString().split('T')[0]);
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/admin/family', {
        method: 'POST',
        body: JSON.stringify({
          parentName,
          parentPhone,
          children: [{ displayName: childName, birthYear: childBirthYear }],
        }),
      });

      if (res.success) {
        setShowAddFamilyModal(false);
        setParentName('');
        setParentPhone('');
        setChildName('');
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.message || 'فشل إضافة العائلة');
    }
  };

  const handleDownloadCsv = () => {
    window.open('/api/v1/admin/export/students.csv', '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">إدارة الطلاب والعائلات</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">البحث وإدارة الاشتراكات والتواريخ وتجديد الحسابات</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تصدير تقرير CSV</span>
          </button>

          <button
            onClick={() => setShowAddFamilyModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة حساب عائلة طفل</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم الطالب..."
          className="w-full px-4 py-3 pr-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
        />
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-bold">جاري تحميل قائمة الطلاب...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 uppercase">
                <tr>
                  <th className="px-6 py-4">اسم الطالب</th>
                  <th className="px-6 py-4">اسم ولي الأمر</th>
                  <th className="px-6 py-4">رقم الهاتف</th>
                  <th className="px-6 py-4">المستوى / XP</th>
                  <th className="px-6 py-4">الدروس المكتملة</th>
                  <th className="px-6 py-4">فترة الاشتراك</th>
                  <th className="px-6 py-4">حالة الاشتراك</th>
                  <th className="px-6 py-4 text-center">إجراءات المعلم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {students.map((student) => {
                  const badge = student.subscriptionStatusBadge;
                  const isExpired = badge === 'expired';
                  const isExpiringSoon = badge === 'expiring_soon';
                  const isActive = badge === 'active';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{student.displayName}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{student.parentName}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{student.parentPhone || '—'}</td>
                      <td className="px-6 py-4 font-extrabold text-sky-700 dark:text-sky-400">
                        مستوى {student.level} ({student.xp} XP)
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{student.completedLessons || 0} / 30</td>

                      {/* Subscription Dates */}
                      <td className="px-6 py-4 text-xs">
                        {student.subscriptionEnd ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              حتى: {new Date(student.subscriptionEnd).toLocaleDateString('ar-EG')}
                            </span>
                            {student.subscriptionStart && (
                              <span className="text-slate-400 dark:text-slate-500 text-[11px] block">
                                من: {new Date(student.subscriptionStart).toLocaleDateString('ar-EG')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>

                      {/* Subscription Status Badge */}
                      <td className="px-6 py-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 text-xs font-black border border-rose-200 dark:border-rose-800">
                            <Lock className="w-3.5 h-3.5" />
                            <span>منتهي (Expired)</span>
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs font-black border border-amber-200 dark:border-amber-800 animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            <span>قارب على الانتهاء</span>
                          </span>
                        ) : isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800">
                            <Unlock className="w-3.5 h-3.5" />
                            <span>نشط (Active)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                            تجربة مجانية
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          {/* Renew Button */}
                          <button
                            onClick={() => handleOpenRenew(student)}
                            disabled={actionLoadingId === student.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
                            title="تجديد وتعديل فترة الاشتراك"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>تجديد (Renew)</span>
                          </button>

                          {/* Revoke Button */}
                          <button
                            onClick={() => handleRevoke(student)}
                            disabled={actionLoadingId === student.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/70 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 font-black text-xs transition-all active:scale-95 disabled:opacity-50 border border-rose-200 dark:border-rose-800"
                            title="سحب الصلاحية وقفل الدروس"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>سحب (Revoke)</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Setting / Renewing Subscription Dates */}
      {selectedStudentForRenewal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                تجديد اشتراك: {selectedStudentForRenewal.displayName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                حدد تاريخ انتهاء الاشتراك الجديد لفتح الدروس للطالب
              </p>
            </div>

            <form onSubmit={handleSaveRenewal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  تاريخ بدء الاشتراك
                </label>
                <input
                  type="date"
                  value={renewalStartDate}
                  onChange={(e) => setRenewalStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  تاريخ انتهاء الاشتراك (تاريخ القفل التلقائي)
                </label>
                <input
                  type="date"
                  required
                  value={renewalEndDate}
                  onChange={(e) => setRenewalEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Quick Duration Buttons */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">اختصارات سريعة للمدة:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addDaysToStartDate(30)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                  >
                    + شهر (30 يوماً)
                  </button>
                  <button
                    type="button"
                    onClick={() => addDaysToStartDate(90)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                  >
                    + 3 أشهر (90 يوماً)
                  </button>
                  <button
                    type="button"
                    onClick={() => addDaysToStartDate(365)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                  >
                    + سنة كاملة
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForRenewal(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === selectedStudentForRenewal.id}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md transition-colors disabled:opacity-50"
                >
                  {actionLoadingId === selectedStudentForRenewal.id ? 'جاري الحفظ...' : 'حفظ وتفعيل التجديد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Family */}
      {showAddFamilyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">إضافة حساب عائلة طفل جديد</h3>
            <form onSubmit={handleCreateFamily} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">اسم ولي الأمر</label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="مثال: أحمد علي"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">رقم هاتف / واتساب ولي الأمر</label>
                <input
                  type="tel"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="01000000000"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">اسم الطفل الثلاثي</label>
                <input
                  type="text"
                  required
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="مثال: ياسين أحمد"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">سنة ميلاد الطفل</label>
                <input
                  type="number"
                  required
                  value={childBirthYear}
                  onChange={(e) => setChildBirthYear(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddFamilyModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md transition-colors"
                >
                  حفظ إضافة العائلة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
