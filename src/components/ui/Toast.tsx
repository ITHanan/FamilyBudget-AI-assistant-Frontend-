import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneIcon = {
  success: CheckCircle2,
  error: XCircle,
  info: Info
};

const toneClass = {
  success: 'text-[var(--success)]',
  error: 'text-[var(--danger)]',
  info: 'text-[var(--accent)]'
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = crypto.randomUUID();
      setToasts((items) => [...items.slice(-2), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-3 top-3 z-[80] grid w-[calc(100vw-1.5rem)] max-w-sm gap-2 sm:right-5 sm:top-5" role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = toneIcon[toast.tone];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.98 }}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-[var(--text)] shadow-[var(--shadow)]"
              >
                <div className="flex gap-3">
                  <Icon className={toneClass[toast.tone]} size={20} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{toast.title}</p>
                    {toast.message && <p className="mt-0.5 text-sm text-[var(--muted)]">{toast.message}</p>}
                  </div>
                  <button className="rounded-md p-1 text-[var(--muted)] hover:bg-[var(--surface-muted)]" aria-label="Dismiss notification" onClick={() => dismiss(toast.id)}>
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}
