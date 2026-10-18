import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserApproval, renewSubscription, revokeSubscription } from '../../services/adminService';
import {
  UserCheck,
  UserX,
  Clock,
  Search,
  RefreshCw,
  CheckCircle2,
  Lock,
  Unlock,
  Users,
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  username?: string;
  approved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  subscriptionStart?: string;
  subscriptionEnd?: string;
  subscriptionStatusBadge?: 'active' | 'expiring_soon' | 'expired' | 'none';
  createdAt: string;
  lastLoginAt?: string;
}

export const AdminApprovalsPage: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Renewal / Edit Dates Modal State
  const [selectedUserForDates, setSelectedUserForDates] = useState<UserItem | null>(null);
  const [modalStartDate, setModalStartDate] = useState('');
  const [modalEndDate, setModalEndDate] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      // Map uid to id for backward compat with existing JSX
      setUsers(data.map((u) => ({ ...u, id: u.uid })) as any);
    } catch (_err) {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Show auto-dismiss toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1-Click Approval / Rejection / Revocation
  const handleUpdateApproval = async (
    userId: string,
    status: 'approved' | 'rejected' | 'pending',
    subscriptionStart?: string,
    subscriptionEnd?: string,
  ) => {
    setActionLoadingId(userId);
    try {
      await updateUserApproval(userId, status, subscriptionStart, subscriptionEnd);
      fetchUsers();
      const statusLabel =
        status === 'approved'
          ? 'تم اعتماد وتفعيل وصول الطالب للدروس بنجاح'
          : status === 'rejected'
          ? 'تم سحب وإلغاء صلاحية الطالب وقفل الدروس'
          : 'تم إعادة حالة الحساب إلى قيد المراجعة';
      triggerToast(statusLabel);
    } catch (err: any) {
      alert(err.message || 'فشل تحديث حالة الصلاحية');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Renew Subscription Action
  const handleRenew = (user: UserItem) => {
    const today = new Date().toISOString().split('T')[0];
    const defaultEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setSelectedUserForDates(user);
    setModalStartDate(user.subscriptionStart ? user.subscriptionStart.split('T')[0] : today);
    setModalEndDate(user.subscriptionEnd ? user.subscriptionEnd.split('T')[0] : defaultEnd);
  };

  const handleSaveRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForDates) return;
    setActionLoadingId(selectedUserForDates.id);
    try {
      await renewSubscription(selectedUserForDates.id, modalEndDate);
      setSelectedUserForDates(null);
      fetchUsers();
      triggerToast(`تم تجديد اشتراك الطالب ${selectedUserForDates.name} بنجاح حتى ${modalEndDate}`);
    } catch (err: any) {
      alert(err.message || 'فشل تجديد الاشتراك');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Revoke Subscription Action
  const handleRevoke = async (userId: string, userName: string) => {
    if (!window.confirm(`هل أنت متأكد من سحب وإلغاء اشتراك الطالب (${userName}) وقفل كافة الدروس فوراً؟`)) return;
    setActionLoadingId(userId);
    try {
      await revokeSubscription(userId);
      fetchUsers();
      triggerToast(`تم سحب وإلغاء اشتراك الطالب ${userName} وقفل الدروس`);
    } catch (err: any) {
      alert(err.message || 'فشل سحب الاشتراك');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick End Date Calculator
  const addDaysToStartDate = (days: number) => {
    const base = modalStartDate ? new Date(modalStartDate) : new Date();
    const newDate = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    setModalEndDate(newDate.toISOString().split('T')[0]);
  };

  // Filtered users calculation
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').includes(searchQuery) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || u.approvalStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = users.filter((u) => u.approvalStatus === 'pending').length;
  const approvedCount = users.filter((u) => u.approvalStatus === 'approved').length;
  const rejectedCount = users.filter((u) => u.approvalStatus === 'rejected').length;

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">إدارة صلاحيات واشتراكات الطلاب</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            اعتماد وتجديد وسحب الاشتراكات ومتابعة تواريخ البدء والانتهاء وحالة التفعيل بنقرة واحدة
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs shadow-sm transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث القائمة</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('pending')}
          className={`cursor-pointer p-6 rounded-3xl border transition-all ${
            statusFilter === 'pending'
              ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500 shadow-md ring-2 ring-amber-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-700 dark:text-amber-400">بانتظار الموافقة (Pending)</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{pendingCount}</p>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 font-bold">حسابات تنتظر تفعيل المعلم</p>
        </div>

        <div
          onClick={() => setStatusFilter('approved')}
          className={`cursor-pointer p-6 rounded-3xl border transition-all ${
            statusFilter === 'approved'
              ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">معتمد ومفعل (Approved)</span>
            <Unlock className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{approvedCount}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1 font-bold">اشتراكات مفعلة لفتح الدروس</p>
        </div>

        <div
          onClick={() => setStatusFilter('rejected')}
          className={`cursor-pointer p-6 rounded-3xl border transition-all ${
            statusFilter === 'rejected'
              ? 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500 shadow-md ring-2 ring-rose-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-700 dark:text-rose-400">مرفوض / مسحوب (Revoked)</span>
            <Lock className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{rejectedCount}</p>
          <p className="text-xs text-rose-600 dark:text-rose-500 mt-1 font-bold">اشتراكات مغلقة أو ملغاة</p>
        </div>

        <div
          onClick={() => setStatusFilter('all')}
          className={`cursor-pointer p-6 rounded-3xl border transition-all ${
            statusFilter === 'all'
              ? 'bg-sky-500/10 dark:bg-sky-950/40 border-sky-500 shadow-md ring-2 ring-sky-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-sky-700 dark:text-sky-400">إجمالي الحسابات</span>
            <Users className="w-5 h-5 text-sky-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{users.length}</p>
          <p className="text-xs text-sky-600 dark:text-sky-500 mt-1 font-bold">جميع مستخدمي المنصة</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-sky-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الكل ({users.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'pending'
                ? 'bg-white dark:bg-slate-700 text-amber-900 dark:text-amber-300 shadow-sm'
                : 'text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300'
            }`}
          >
            بانتظار الموافقة ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'approved'
                ? 'bg-white dark:bg-slate-700 text-emerald-900 dark:text-emerald-300 shadow-sm'
                : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300'
            }`}
          >
            المفعلة ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              statusFilter === 'rejected'
                ? 'bg-white dark:bg-slate-700 text-rose-900 dark:text-rose-300 shadow-sm'
                : 'text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300'
            }`}
          >
            المرفوضة ({rejectedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف أو البريد..."
            className="w-full px-4 py-2.5 pr-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-bold">جاري تحميل قائمة المستخدمين...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400 space-y-3">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="font-bold">لا يوجد مستخدمين يطابقون هذا الفلتر</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 uppercase">
                <tr>
                  <th className="px-6 py-4">المستخدم</th>
                  <th className="px-6 py-4">الدور</th>
                  <th className="px-6 py-4">بيانات التواصل</th>
                  <th className="px-6 py-4">فترة الاشتراك</th>
                  <th className="px-6 py-4">حالة الاشتراك</th>
                  <th className="px-6 py-4 text-center">إجراءات المعلم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((user) => {
                  const isPending = user.approvalStatus === 'pending';
                  const isApproved = user.approvalStatus === 'approved';
                  const isRejected = user.approvalStatus === 'rejected';
                  const isActionLoading = actionLoadingId === user.id;

                  const badge = user.subscriptionStatusBadge;
                  const isExpired = badge === 'expired';
                  const isExpiringSoon = badge === 'expiring_soon';
                  const isActive = badge === 'active' || isApproved;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Name & Username */}
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white block text-sm">{user.name}</span>
                          {user.username && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">@{user.username}</span>
                          )}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black border ${
                            user.role === 'teacher'
                              ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                              : user.role === 'parent'
                              ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {user.role === 'teacher'
                            ? 'معلم (Teacher)'
                            : user.role === 'parent'
                            ? 'ولي أمر (Parent)'
                            : 'طالب (Student)'}
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                        <div>{user.phone || '—'}</div>
                        {user.email && <div className="text-slate-400 dark:text-slate-500">{user.email}</div>}
                      </td>

                      {/* Subscription Dates */}
                      <td className="px-6 py-4 text-xs">
                        {user.subscriptionEnd ? (
                          <div className="space-y-0.5">
                            <span className="text-slate-700 dark:text-slate-300 font-bold block">
                              حتى: {new Date(user.subscriptionEnd).toLocaleDateString('ar-EG')}
                            </span>
                            {user.subscriptionStart && (
                              <span className="text-slate-400 dark:text-slate-500 text-[11px] block">
                                من: {new Date(user.subscriptionStart).toLocaleDateString('ar-EG')}
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
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                            قيد المراجعة
                          </span>
                        )}
                      </td>

                      {/* Teacher Action Buttons */}
                      <td className="px-6 py-4 text-center">
                        {user.role === 'teacher' ? (
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">حساب معلم رئيسي</span>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            {/* Approve / Re-approve Button */}
                            {!isApproved && (
                              <button
                                onClick={() => handleUpdateApproval(user.id, 'approved')}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
                                title="موافقة وتفعيل وصول الطالب للدروس"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>{isRejected ? 'إعادة التفعيل' : 'موافقة وتفعيل'}</span>
                              </button>
                            )}

                            {/* Renew Button */}
                            <button
                              onClick={() => handleRenew(user)}
                              disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
                              title="تجديد مدة الاشتراك وتعديل تاريخ الانتهاء"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>تجديد (Renew)</span>
                            </button>

                            {/* Revoke Button */}
                            {isApproved && (
                              <button
                                onClick={() => handleRevoke(user.id, user.name)}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/70 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 font-black text-xs transition-all active:scale-95 disabled:opacity-50 border border-rose-200 dark:border-rose-800"
                                title="سحب صلاحية الوصول وقفل الدروس فوراً"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>سحب (Revoke)</span>
                              </button>
                            )}

                            {/* Reject Button for pending */}
                            {isPending && (
                              <button
                                onClick={() => handleUpdateApproval(user.id, 'rejected')}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
                                title="رفض طلب الحساب"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>رفض</span>
                              </button>
                            )}
                          </div>
                        )}
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
      {selectedUserForDates && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                تجديد وتعديل اشتراك: {selectedUserForDates.name}
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
                  value={modalStartDate}
                  onChange={(e) => setModalStartDate(e.target.value)}
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
                  value={modalEndDate}
                  onChange={(e) => setModalEndDate(e.target.value)}
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
                  onClick={() => setSelectedUserForDates(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === selectedUserForDates.id}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md transition-colors disabled:opacity-50"
                >
                  {actionLoadingId === selectedUserForDates.id ? 'جاري الحفظ...' : 'حفظ وتفعيل التجديد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
