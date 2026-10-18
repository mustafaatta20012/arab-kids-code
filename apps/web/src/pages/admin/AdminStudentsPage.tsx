/**
 * AdminStudentsPage — real-time users list with Approve / Suspend actions.
 *
 * Features:
 * - onSnapshot for live updates (new registrations appear instantly)
 * - Status tabs: All / Pending / Active / Suspended + pending badge
 * - Per-row: status badge, Approve button, Suspend button, Renew subscription
 * - Bulk approve for selected pending users
 * - Arabic toasts on success / failure
 * - Single updateDoc write: { status, approved, approvalStatus, approvedAt, approvedBy }
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  collection, query, orderBy, limit,
  onSnapshot, doc, updateDoc, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import {
  Search, UserPlus, RefreshCw, Lock, Unlock,
  Clock, Users, CheckCircle2, XCircle,
  Download, Wifi, ShieldAlert,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────

type AccountStatus = 'pending' | 'active' | 'suspended';

interface UserRow {
  id:               string;
  name:             string;
  phone:            string;
  email:            string;
  role:             string;
  status:           AccountStatus;
  approved:         boolean;
  approvalStatus:   string;
  subscriptionStart: string | null;
  subscriptionEnd:   string | null;
  createdAt:        any;
  lastLoginAt:      any;
  approvedAt?:      any;
}

// ── Helpers ───────────────────────────────────────────────────────────────

const toDate = (val: any): string => {
  if (!val) return '—';
  if (typeof val?.toDate === 'function') return val.toDate().toLocaleDateString('ar-EG');
  if (typeof val === 'string') return new Date(val).toLocaleDateString('ar-EG');
  return '—';
};

const deriveStatus = (u: any): AccountStatus => {
  if (u.status) return u.status;
  if (u.approved === true || u.approvalStatus === 'approved') return 'active';
  if (u.approvalStatus === 'rejected') return 'suspended';
  return 'pending';
};

// ── Component ─────────────────────────────────────────────────────────────

export const AdminStudentsPage: React.FC = () => {
  const { user: adminUser } = useAuth();
  const toast = useToast();

  const [users, setUsers]            = useState<UserRow[]>([]);
  const [loading, setLoading]        = useState(true);
  const [liveConnected, setLive]     = useState(false);
  const [searchQuery, setSearch]     = useState('');
  const [tabFilter, setTab]          = useState<'all' | AccountStatus>('all');
  const [roleFilter, setRoleFilter]  = useState<string>('all');
  const [actionId, setActionId]      = useState<string | null>(null);
  const [selected, setSelected]      = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading]= useState(false);

  // Renewal modal
  const [renewUser, setRenewUser]    = useState<UserRow | null>(null);
  const [startDate, setStartDate]    = useState('');
  const [endDate, setEndDate]        = useState('');

  const [showAdd, setShowAdd]        = useState(false);

  // ── Real-time listener ─────────────────────────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(500),
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows: UserRow[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name:             data.name ?? '',
          phone:            data.phone ?? '',
          email:            data.email ?? '',
          role:             data.role ?? 'parent',
          status:           deriveStatus(data),
          approved:         data.approved ?? false,
          approvalStatus:   data.approvalStatus ?? 'pending',
          subscriptionStart: data.subscriptionStart ?? null,
          subscriptionEnd:   data.subscriptionEnd ?? null,
          createdAt:        data.createdAt,
          lastLoginAt:      data.lastLoginAt,
          approvedAt:       data.approvedAt,
        };
      });
      setUsers(rows);
      setLoading(false);
      setLive(true);
    }, (err) => {
      console.error('Firestore users listener:', err);
      setLoading(false);
      setLive(false);
    });

    return unsub;
  }, []);

  // ── Filtered list ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = users;
    if (tabFilter !== 'all') list = list.filter((u) => u.status === tabFilter);
    if (roleFilter !== 'all') list = list.filter((u) => u.role === roleFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) => u.name?.toLowerCase().includes(q) ||
               u.phone?.includes(searchQuery) ||
               u.email?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [users, tabFilter, roleFilter, searchQuery]);

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     users.length,
    active:    users.filter((u) => u.status === 'active').length,
    pending:   users.filter((u) => u.status === 'pending').length,
    suspended: users.filter((u) => u.status === 'suspended').length,
  }), [users]);

  // ── Approve single user ────────────────────────────────────────────────
  const handleApprove = async (u: UserRow) => {
    setActionId(u.id);
    try {
      const today = new Date();
      const oneMonth = new Date(today.getTime() + 30 * 86400000);
      await updateDoc(doc(db, 'users', u.id), {
        status:            'active',
        approved:          true,
        approvalStatus:    'approved',
        approvedAt:        serverTimestamp(),
        approvedBy:        adminUser?.uid ?? 'admin',
        subscriptionStart: u.subscriptionStart ?? today.toISOString(),
        subscriptionEnd:   u.subscriptionEnd   ?? oneMonth.toISOString(),
      });
      toast.success(`✅ تم تفعيل حساب ${u.name}`, 'Account activated — lessons unlocked');
    } catch (err: any) {
      toast.error(`فشل التفعيل: ${err.message}`, 'Activation failed');
    } finally {
      setActionId(null);
    }
  };

  // ── Suspend single user ────────────────────────────────────────────────
  const handleSuspend = async (u: UserRow) => {
    if (!window.confirm(`تعليق حساب ${u.name}؟\nسيتم قفل جميع الدروس فوراً.`)) return;
    setActionId(u.id);
    try {
      await updateDoc(doc(db, 'users', u.id), {
        status:         'suspended',
        approved:       false,
        approvalStatus: 'rejected',
      });
      toast.warning(`⏸ تم تعليق حساب ${u.name}`, 'Account suspended');
    } catch (err: any) {
      toast.error(`فشل التعليق: ${err.message}`);
    } finally {
      setActionId(null);
    }
  };

  // ── Restore suspended → pending ────────────────────────────────────────
  const handleRestore = async (u: UserRow) => {
    setActionId(u.id);
    try {
      await updateDoc(doc(db, 'users', u.id), {
        status:         'pending',
        approved:       false,
        approvalStatus: 'pending',
      });
      toast.info(`↩ تم إعادة ${u.name} إلى قائمة الانتظار`);
    } catch (err: any) {
      toast.error(`فشل الاستعادة: ${err.message}`);
    } finally {
      setActionId(null);
    }
  };

  // ── Bulk approve ───────────────────────────────────────────────────────
  const handleBulkApprove = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`تفعيل ${selected.size} حساب؟`)) return;
    setBulkLoading(true);
    try {
      const batch = writeBatch(db);
      const today = new Date();
      const oneMonth = new Date(today.getTime() + 30 * 86400000);
      selected.forEach((uid) => {
        batch.update(doc(db, 'users', uid), {
          status:            'active',
          approved:          true,
          approvalStatus:    'approved',
          approvedAt:        serverTimestamp(),
          approvedBy:        adminUser?.uid ?? 'admin',
          subscriptionStart: today.toISOString(),
          subscriptionEnd:   oneMonth.toISOString(),
        });
      });
      await batch.commit();
      toast.success(`✅ تم تفعيل ${selected.size} حساب دفعةً واحدة`);
      setSelected(new Set());
    } catch (err: any) {
      toast.error(`فشل التفعيل الجماعي: ${err.message}`);
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Renew subscription ────────────────────────────────────────────────
  const openRenew = (u: UserRow) => {
    const today = new Date().toISOString().split('T')[0];
    const oneMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    setRenewUser(u);
    setStartDate(u.subscriptionStart?.split('T')[0] ?? today);
    setEndDate(u.subscriptionEnd?.split('T')[0] ?? oneMonth);
  };

  const handleSaveRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewUser) return;
    setActionId(renewUser.id);
    try {
      await updateDoc(doc(db, 'users', renewUser.id), {
        approved:          true,
        approvalStatus:    'approved',
        status:            'active',
        subscriptionStart: startDate,
        subscriptionEnd:   endDate,
        approvedBy:        adminUser?.uid ?? 'admin',
      });
      toast.success(`✅ تم تجديد اشتراك ${renewUser.name}`);
      setRenewUser(null);
    } catch (err: any) {
      toast.error(`فشل التجديد: ${err.message}`);
    } finally {
      setActionId(null);
    }
  };

  const addDays = (days: number) => {
    const base = startDate ? new Date(startDate) : new Date();
    setEndDate(new Date(base.getTime() + days * 86400000).toISOString().split('T')[0]);
  };

  // ── CSV export ────────────────────────────────────────────────────────
  const handleExportCsv = () => {
    const rows = [
      ['الاسم', 'الهاتف', 'الدور', 'الحالة', 'تاريخ التسجيل', 'آخر دخول', 'تاريخ التفعيل'],
      ...users.map((u) => [
        u.name, u.phone, u.role, u.status,
        toDate(u.createdAt), toDate(u.lastLoginAt), toDate(u.approvedAt),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ── Toggle row selection ──────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllPending = () => {
    const pendingIds = filtered
      .filter((u) => u.status === 'pending')
      .map((u) => u.id);
    setSelected(new Set(pendingIds));
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';

  // ── Status badge ──────────────────────────────────────────────────────
  const StatusBadge: React.FC<{ status: AccountStatus }> = ({ status }) => {
    if (status === 'active') return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-black">
        <Unlock className="w-3 h-3" /> نشط
      </span>
    );
    if (status === 'suspended') return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[11px] font-black">
        <ShieldAlert className="w-3 h-3" /> موقوف
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-black animate-pulse">
        <Clock className="w-3 h-3" /> معلق
      </span>
    );
  };

  const TABS: { key: 'all' | AccountStatus; label: string }[] = [
    { key: 'all',       label: 'الكل' },
    { key: 'pending',   label: 'انتظار' },
    { key: 'active',    label: 'نشط' },
    { key: 'suspended', label: 'موقوف' },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────────────── */}
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
            يتحدث تلقائياً — تفعيل الحسابات يفتح الدروس فوراً للطالب
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition-colors">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md transition-colors">
            <UserPlus className="w-4 h-4" /> معلومات الإضافة
          </button>
        </div>
      </div>

      {/* ── Stats cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي',    value: stats.total,     icon: Users,        color: 'sky',     tab: 'all' },
          { label: 'طلبات معلقة', value: stats.pending,  icon: Clock,        color: 'amber',   tab: 'pending' },
          { label: 'نشطون',    value: stats.active,    icon: CheckCircle2, color: 'emerald', tab: 'active' },
          { label: 'موقوفون',   value: stats.suspended, icon: ShieldAlert,  color: 'rose',    tab: 'suspended' },
        ].map((s) => (
          <button key={s.label} onClick={() => setTab(s.tab as any)}
            className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm text-right transition-all hover:shadow-md
              ${tabFilter === s.tab ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200 dark:border-slate-800'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{s.label}</span>
              <s.icon className={`w-4 h-4 text-${s.color}-500`} />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {s.value}
              {s.tab === 'pending' && s.value > 0 && (
                <span className="mr-2 text-sm font-black text-amber-600 animate-bounce">🔔</span>
              )}
            </p>
          </button>
        ))}
      </div>

      {/* ── Bulk approve bar ──────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl px-5 py-3">
          <span className="text-sm font-extrabold text-sky-800 dark:text-sky-200">
            {selected.size} مستخدم محدد
          </span>
          <div className="flex gap-2">
            <button onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              إلغاء التحديد
            </button>
            <button onClick={handleBulkApprove} disabled={bulkLoading}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors disabled:opacity-50">
              {bulkLoading ? 'جاري التفعيل...' : `✅ تفعيل ${selected.size} دفعةً`}
            </button>
          </div>
        </div>
      )}

      {/* ── Filters row ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                tabFilter === t.key
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}>
              {t.label}
              {t.key === 'pending' && stats.pending > 0 && (
                <span className="mr-1.5 bg-amber-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-black">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <input type="text" value={searchQuery} onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الهاتف..."
            className="w-full px-4 py-2.5 pr-9 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Role filter */}
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold">
          <option value="all">جميع الأدوار</option>
          <option value="parent">ولي أمر</option>
          <option value="student">طالب</option>
          <option value="teacher">معلم</option>
        </select>

        {/* Select all pending shortcut */}
        {stats.pending > 0 && (
          <button onClick={selectAllPending}
            className="px-3 py-2.5 rounded-2xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-extrabold hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors whitespace-nowrap">
            تحديد كل المعلقين
          </button>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-sky-500 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-slate-400 font-bold text-sm">جاري التحميل...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold">لا يوجد مستخدمون في هذه الفئة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input type="checkbox" className="rounded"
                      checked={selected.size === filtered.filter(u => u.status === 'pending').length && selected.size > 0}
                      onChange={() => selected.size > 0 ? setSelected(new Set()) : selectAllPending()} />
                  </th>
                  <th className="px-4 py-3">المستخدم</th>
                  <th className="px-4 py-3">الهاتف</th>
                  <th className="px-4 py-3">الدور</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3">انتهاء الاشتراك</th>
                  <th className="px-4 py-3">التسجيل</th>
                  <th className="px-4 py-3">آخر دخول</th>
                  <th className="px-4 py-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((u) => (
                  <tr key={u.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      selected.has(u.id) ? 'bg-sky-50/60 dark:bg-sky-950/20' : ''
                    }`}>
                    <td className="px-4 py-3">
                      {u.status === 'pending' && (
                        <input type="checkbox" className="rounded"
                          checked={selected.has(u.id)}
                          onChange={() => toggleSelect(u.id)} />
                      )}
                    </td>

                    {/* Avatar + name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white leading-tight">{u.name || '—'}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email?.replace('@arabkids.app', '')}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{u.phone || '—'}</td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[11px] font-black ${
                        u.role === 'super_admin' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300' :
                        u.role === 'teacher'     ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' :
                        'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
                      }`}>
                        {u.role === 'super_admin' ? 'مدير' : u.role === 'teacher' ? 'معلم' : 'ولي أمر'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3"><StatusBadge status={u.status} /></td>

                    {/* Sub end */}
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {u.subscriptionEnd ? new Date(u.subscriptionEnd).toLocaleDateString('ar-EG') : '—'}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-400">{toDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{toDate(u.lastLoginAt)}</td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Approve */}
                        {u.status !== 'active' && (
                          <button onClick={() => handleApprove(u)} disabled={actionId === u.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 transition-colors text-xs font-extrabold disabled:opacity-50"
                            title="تفعيل الحساب وفتح الدروس">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{actionId === u.id ? '...' : 'تفعيل'}</span>
                          </button>
                        )}

                        {/* Renew sub */}
                        <button onClick={() => openRenew(u)} disabled={actionId === u.id}
                          className="p-1.5 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-200 transition-colors disabled:opacity-50"
                          title="تجديد / تعديل الاشتراك">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Suspend */}
                        {u.status === 'active' && u.role !== 'super_admin' && u.role !== 'teacher' && (
                          <button onClick={() => handleSuspend(u)} disabled={actionId === u.id}
                            className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 transition-colors disabled:opacity-50"
                            title="تعليق الحساب وقفل الدروس">
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Restore suspended → pending */}
                        {u.status === 'suspended' && (
                          <button onClick={() => handleRestore(u)} disabled={actionId === u.id}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors disabled:opacity-50"
                            title="إعادة إلى قائمة الانتظار">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Renew modal ───────────────────────────────────────────────── */}
      {renewUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">تجديد اشتراك: {renewUser.name}</h3>
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
                    className="flex-1 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-xs font-bold transition-colors">
                    +{d === 365 ? 'سنة' : d === 90 ? '3 أشهر' : 'شهر'}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setRenewUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors">
                  إلغاء
                </button>
                <button type="submit" disabled={actionId === renewUser.id}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs transition-colors disabled:opacity-50">
                  {actionId === renewUser.id ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Info modal ───────────────────────────────────────────────── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">كيف تُضاف الحسابات؟</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              يسجّل المستخدم من صفحة <strong>/login</strong> ويظهر في هذه القائمة تلقائياً بحالة <strong>معلق</strong>.
              اضغط <strong>تفعيل</strong> لفتح جميع الدروس له فوراً بدون إعادة تسجيل دخول.
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
