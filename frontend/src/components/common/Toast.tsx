import { AlertCircle, CircleCheck, Info, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ToastKind } from '../../context/ToastContext';

type ToastProps = {
  kind: ToastKind;
  message: string;
  onClose: () => void;
};

function Toast({ kind, message, onClose }: ToastProps) {
  const [exiting, setExiting] = useState(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const beginExit = window.setTimeout(() => setExiting(true), 3500);
    const dismiss = window.setTimeout(() => onCloseRef.current(), 3800);
    return () => {
      window.clearTimeout(beginExit);
      window.clearTimeout(dismiss);
    };
  }, [message]);

  const styles = {
    success: {
      icon: CircleCheck,
      color: 'text-emerald-600',
      border: 'border-emerald-200',
    },
    error: {
      icon: AlertCircle,
      color: 'text-rose-600',
      border: 'border-rose-200',
    },
    info: {
      icon: Info,
      color: 'text-violet-600',
      border: 'border-violet-200',
    },
  }[kind];
  const Icon = styles.icon;

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-2xl border ${styles.border} bg-white px-4 py-3 text-sm text-slate-800 shadow-xl shadow-slate-900/10 ${exiting ? 'toast-exit' : 'toast-enter'}`}
      role={kind === 'error' ? 'alert' : 'status'}
      aria-live={kind === 'error' ? 'assertive' : 'polite'}
    >
      <Icon size={20} className={`shrink-0 ${styles.color}`} aria-hidden="true" />
      <span className="flex-1 font-medium">{message}</span>
      <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Dismiss notification">
        <X size={16} />
      </button>
    </div>
  );
}

export default Toast;
