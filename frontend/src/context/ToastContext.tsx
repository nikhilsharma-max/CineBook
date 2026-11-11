import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import Toast from '../components/common/Toast';

export type ToastKind = 'success' | 'error' | 'info';

type ToastMessage = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  notify: (kind: ToastKind, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);

  const notify = useCallback((kind: ToastKind, message: string) => {
    const text = message.trim();
    if (!text) return;

    const id = ++nextId.current;
    setToasts((current) => {
      if (current.some((toast) => toast.kind === kind && toast.message === text)) {
        return current;
      }
      return [...current, { id, kind, message: text }];
    });
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[110] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            kind={toast.kind}
            message={toast.message}
            onClose={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider');
  }
  return context;
}
