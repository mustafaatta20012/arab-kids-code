import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, FolderKanban, Star, ShieldCheck, LogOut, Code2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { Seo } from '../../components/common/Seo';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    fetchApi('/auth/me')
      .then((res) => {
        if (res.success && res.data) {
          const role = res.data.role;
          if (role === 'teacher' || role === 'super_admin') {
            setAuthorized(true);
          } else {
            navigate('/login');
          }
        } else {
          navigate('/login');
        }
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  const navItems = [
    { path: '/admin', label: 'التحليلات العامة', icon: LayoutDashboard },
    { path: '/admin/approvals', label: 'طلبات الوصول والموافقات', icon: UserCheck },
    { path: '/admin/students', label: 'إدارة الطلاب والعائلات', icon: Users },
    { path: '/admin/submissions', label: 'تصحيح المشروعات', icon: FolderKanban },
    { path: '/admin/reviews', label: 'طابور مراجعة التقييمات', icon: Star },
    { path: '/admin/audit', label: 'سجل تدقيق النظام', icon: ShieldCheck },
  ];

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
        جاري التحقق من صلاحيات المعلم...
      </div>
    );
  }

  return (
    <>
      <Seo
        title="لوحة تحكم المعلم"
        description="لوحة تحكم وإدارة الطلاب والاشتراكات"
        noIndex={true}
      />

      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 p-6 space-y-8 flex flex-col justify-between shrink-0 border-l border-slate-800">
        <div className="space-y-8">
          {/* Admin Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-black text-white block">لوحة تحكم المعلم</span>
              <span className="text-xs text-sky-400 font-bold">م. مصطفى عطا</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <Link
            to="/login"
            className="flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج من الإدارة</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin View Container */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
    </>
  );
};
