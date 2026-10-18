/**
 * AdminStudentsPage – real-time users list from Firestore.
 * Uses onSnapshot so new registrations appear instantly without refresh.
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  collection, query, orderBy, limit,
  onSnapshot, doc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Search, UserPlus, RefreshCw, Lock, Unlock,
  Clock, Users, CheckCircle2, XCircle, AlertTriangle,
  Download, Wifi,
} from 'lucide-react';

interface UserRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  approved: boolean;
  approvalStatus: string;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  createdAt: any;
  lastLoginAt: any;
}

const toDate = (val: any): string => {
  if (!val) return '—';
  if (typeof val?.toDate === 'function') return val.toDate().toLocaleDateString('ar-EG');
  if (typeof val === 'string') return new Date(val).toLocaleDateString('ar-EG');
  return '—';
};

const subStatus = (user: UserRow) => {
  if (!user.approved) return 'pending';
  if (!user.subscriptionEnd) return 'active';
  const diff = new Date(user.subscriptionEnd).getTime() - Date.now();
  if (diff < 0) return 'expired';
  if (diff < 3 * 86400000) return 'expiring';
  return 'active';
};

export const AdminStudentsPage: React.FC = () => {
  const [users, setUsers]           = useState<UserRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [liveConnected, setLive]    = useState(false);
  const [searchQuery, setSearch]    = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [actionId, setActionId]     = useState<string | null>(null);

  // ── Renewal modal ─────────────────────────────────────────────────────
  const [renewUser, setRenewUser]   = useState<UserRow | null>(null);
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');

  // ── Add-family modal ──────────────────────────────────────────────────
  const [showAdd, setShowAdd]       = useState(false);

  // ── Real-time Firestore listener ──────────────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(500),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: UserRow[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<UserRow, 'id'>),
        }));
        setUsers(rows);
        setLoading(false);
        setLive(true);
      },
      (err) => {
        console.error('Firestore users listener error:', err);
        setLoading(false);
        setLive(false);
      },
    );

    return unsub; // cleanup on unmount
  }, []);

  // ── Filtered / sorted list ────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = users;

    if (roleFilter !== 'all') {
      list = list.filter((u) => u.role === roleFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.phone?.includes(searchQuery) ||
          u.email?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [users, searchQuery, roleFilter]);

  // ── Stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 86400000;
    const newThisWeek = users.filter((u) => {
      const ts = u.createdAt?.toDate?.()?.getTime() ?? 0;
      return ts > oneWeekAgo;
    }).length;
    return {
      total:    users.length,
      approved: users.filter((u) => u.approved).length,
      pending:  users.filter((u) => u.approvalStatus === 'pending').length,
      newThisWeek,
    };
  }, [users]);

  // ── CSV export (client-side) ──────────────────────────────────────────
  const handleExportCsv = () => {
    const rows = [
      ['الاسم', 'الهاتف', 'الدور', 'الحالة', 'تاريخ التسجيل', 'آخر دخول'],
      ...users.map((u) => [
        u.name, u.phone, u.role, u.approvalStatus,
        toDate(u.createdAt), toDate(u.lastLoginAt),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ── Approve / reject ──────────────────────────────────────────────────
  const handleApprove = async (user: UserRow) => {
    setActionId(user.id);
    try {
      const today = new Date();
      const oneMonth = new Date(today.getTime() + 30 * 86400000);
      await updateDoc(doc(db, 'users', user.id), {
        approved:          true,
        approvalStatus:    'approved',
        subscriptionStart: today.toISOString(),
        subscriptionEnd:   oneMonth.toISOString(),
        lastUpdatedAt:     serverTimestamp(),
      });
    } finally {
      setActionId(null);
    }
  };

  // ── Renew modal ───────────────────────────────────────────────────────

  const openRenew = (user: UserRow) => {
    const today = new Date().toISOString().split('T')[0];
    const oneMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    setRenewUser(user);
    setStartDate(user.subscriptionStart?.split('T')[0] ?? today);
    setEndDate(user.subscriptionEnd?.split('T')[0] ?? oneMonth);
  };

  const handleSaveRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewUser) return;
    setActionId(renewUser.id);
    try {
      await updateDoc(doc(db, 'users', renewUser.id), {
        approved:          true,
        approvalStatus:    'approved',
        subscriptionStart: startDate,
        subscriptionEnd:   endDate,
        lastUpdatedAt:     serverTimestamp(),
      });
      setRenewUser(null);
    } finally {
      setActionId(null);
    }
  };

  const handleRevoke = async (user: UserRow) => {
    if (!window.confirm(`سحب اشتراك ${user.name}؟`)) return;
    setActionId(user.id);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        approved:       false,
        approvalStatus: 'rejected',
        lastUpdatedAt:  serverTimestamp(),
      });
    } finally {
      setActionId(null);
    }
  };

  const addDays = (days: number) => {
    const base = startDate ? new Date(startDate) : new Date();
    setEndDate(new Date(base.getTime() + days * 86400000).toISOString().split('T')[0]);
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';

  return (
    <div className="space-y-8">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            إدارة المستخدمين
            {liveConnected && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                <Wifi className="w-3 h-3" /> مباشر
              </span>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            يتحدث تلقائياً عند تسجيل مستخدم جديد
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition-colors">
            <Download className="w-4 h-4" /> تصدير CSV
          </button>
          <button onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md transition-colors">
            <UserPlus className="w-4 h-4" /> إضافة مستخدم
          </button>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المستخدمين', value: stats.total,      icon: Users,        color: 'sky' },
          { label: 'مشتركون نشطون',      value: stats.approved,   icon: CheckCircle2, color: 'emerald' },
          { label: 'طلبات معلقة',         value: stats.pending,    icon: Clock,        color: 'amber' },
          { label: 'جدد هذا الأسبوع',    value: stats.newThisWeek, icon: UserPlus,     color: 'indigo' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{s.label}</span>
              <s.icon className={`w-4 h-4 text-${s.color}-500`} />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input type="text" value={searchQuery} onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الهاتف..."
            className="w-full px-4 py-3 pr-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold">
          <option value="all">جميع الأدوار</option>
          <option value="parent">ولي أمر</option>
          <option value="student">طالب</option>
          <option value="teacher">معلم</option>
          <option value="super_admin">مدير</option>
        </select>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-bold">
            <div className="w-8 h-8 rounded-full border-4 border-sky-500 border-t-transparent animate-spin mx-auto mb-3" />
            جاري تحميل المستخدمين...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-bold">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            لا يوجد مستخدمون مطابقون للبحث
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-4">المستخدم</th>
                  <th className="px-5 py-4">الهاتف</th>
                  <th className="px-5 py-4">الدور</th>
                  <th className="px-5 py-4">الحالة</th>
                  <th className="px-5 py-4">انتهاء الاشتراك</th>
                  <th className="px-5 py-4">تاريخ التسجيل</th>
                  <th className="px-5 py-4">آخر دخول</th>
                  <th className="px-5 py-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((u) => {
                  const status = subStatus(u);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Name + email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black shrink-0">
                            {u.name?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white">{u.name || '—'}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{u.email?.replace('@arabkids.app', '') ?? ''}</p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{u.phone || '—'}</td>

                      {/* Role badge */}
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black ${
                          u.role === 'super_admin' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300' :
                          u.role === 'teacher'     ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' :
                          u.role === 'parent'      ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300' :
                                                     'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {u.role === 'super_admin' ? 'مدير' : u.role === 'teacher' ? 'معلم' : u.role === 'parent' ? 'ولي أمر' : 'طالب'}
                        </span>
                      </td>

                      {/* Subscription status */}
                      <td className="px-5 py-4">
                        {status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-black">
                            <Unlock className="w-3 h-3" /> نشط
                          </span>
                        )}
                        {status === 'expiring' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-black animate-pulse">
                            <Clock className="w-3 h-3" /> قارب الانتهاء
                          </span>
                        )}
                        {status === 'expired' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[11px] font-black">
                            <Lock className="w-3 h-3" /> منتهي
                          </span>
                        )}
                        {status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-black">
                            <AlertTriangle className="w-3 h-3" /> معلق
                          </span>
                        )}
                      </td>

                      {/* End date */}
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {u.subscriptionEnd ? new Date(u.subscriptionEnd).toLocaleDateString('ar-EG') : '—'}
                      </td>

                      {/* Created */}
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">{toDate(u.createdAt)}</td>

                      {/* Last login */}
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">{toDate(u.lastLoginAt)}</td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {u.approvalStatus === 'pending' && (
                            <button onClick={() => handleApprove(u)} disabled={actionId === u.id}
                              className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                              title="قبول وتفعيل اشتراك شهر">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => openRenew(u)} disabled={actionId === u.id}
                            className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-200 transition-colors disabled:opacity-50"
                            title="تجديد / تعديل الاشتراك">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          {u.approved && (
                            <button onClick={() => handleRevoke(u)} disabled={actionId === u.id}
                              className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 transition-colors disabled:opacity-50"
                              title="سحب الاشتراك">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
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

      {/* ── Renew Modal ───────────────────────────────────────────────────── */}
      {renewUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">تجديد اشتراك: {renewUser.name}</h3>
              <p className="text-xs text-slate-500 mt-1">حدد فترة الاشتراك الجديدة</p>
            </div>
            <form onSubmit={handleSaveRenew} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">تاريخ البداية</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">تاريخ الانتهاء</label>
                <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
              </div>
              <div className="flex gap-2">
                {[30, 90, 365].map((d) => (
                  <button key={d} type="button" onClick={() => addDays(d)}
                    className="flex-1 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors">
                    +{d === 365 ? 'سنة' : d === 90 ? '3 أشهر' : 'شهر'}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setRenewUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  إلغاء
                </button>
                <button type="submit" disabled={actionId === renewUser.id}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs transition-colors disabled:opacity-50">
                  {actionId === renewUser.id ? 'جاري الحفظ...' : 'حفظ التجديد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add user modal (manual entry by admin) ────────────────────────── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">ملاحظة</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              لإضافة مستخدم جديد، اطلب منه التسجيل عبر الموقع مباشرة في صفحة <strong>/login</strong>، ثم يظهر في هذه القائمة تلقائياً ويمكنك قبوله من هنا.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              (بدون Cloud Functions لا يمكن إنشاء حسابات Firebase Auth من جانب الـ admin مباشرة — هذا قيد Spark plan)
            </p>
            <button onClick={() => setShowAdd(false)}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm transition-colors">
              فهمت ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
