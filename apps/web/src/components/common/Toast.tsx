/**
 * In-app toast notification system (no external library).
 * Supports Arabic RTL, multiple types, auto-dismiss.
 * Usage: import { toast } from './Toast'; toast.success('تم بنجاح');
 */
import React, { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id:      string;
  type:    ToastType;
  message: string;
  sub?:    string;
}

interface ToastContextValue {
  show: (type: ToastType, message: string, sub?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((type: ToastType, message: string, sub?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, message, sub }]);
    setTimeout(() => remove(id), 4500);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* Toast container — bottom-right for LTR, bottom-left for RTL */}
      <div
        aria-live="assertive"
        className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ICONS: Record<ToastType, React.FC<{ className?: string }>> = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100',
  error:   'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100',
  warning: 'bg-amber-50 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100',
  info:    'bg-sky-50 dark:bg-sky-950/90 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-100',
};

const ICON_COLORS: Record<ToastType, string> = {
  success: 'text-emerald-600 dark:text-emerald-400',
  error:   'text-rose-600 dark:text-rose-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info:    'text-sky-600 dark:text-sky-400',
};

const ToastCard: React.FC<{ toast: ToastItem; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const Icon = ICONS[toast.type];
  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-xl
        backdrop-blur-sm animate-fade-in ${STYLES[toast.type]}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${ICON_COLORS[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-sm leading-snug">{toast.message}</p>
        {toast.sub && <p className="text-xs opacity-75 mt-0.5">{toast.sub}</p>}
      </div>
      <button onClick={() => onRemove(toast.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/** Imperative toast API — call anywhere after wrapping with ToastProvider. */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>');
  const { show } = ctx;
  return {
    success: (msg: string, sub?: string) => show('success', msg, sub),
    error:   (msg: string, sub?: string) => show('error',   msg, sub),
    warning: (msg: string, sub?: string) => show('warning', msg, sub),
    info:    (msg: string, sub?: string) => show('info',    msg, sub),
  };
};
