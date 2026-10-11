import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';


export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/admin/audit-logs')
      .then((res) => {
        if (res.success && res.data) {
          setLogs(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">سجل تدقيق أمان النظام</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">تتبع إجراءات التعديل والتفعيل والعمليات المنفذة في النظام</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-bold">جاري تحميل سجل التدقيق...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-bold">لا توجد سجلات تدقيق حتى الآن.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 uppercase">
                <tr>
                  <th className="px-6 py-4">الإجراء</th>
                  <th className="px-6 py-4">المستهدف</th>
                  <th className="px-6 py-4">المنفذ</th>
                  <th className="px-6 py-4">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {logs.map((log) => (
                  <tr key={log._id || log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-sky-700 dark:text-sky-400">{log.action}</td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{log.entity} ({log.entityId})</td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{log.actorId?.name || 'النظام'}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                      {new Date(log.createdAt).toLocaleString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
