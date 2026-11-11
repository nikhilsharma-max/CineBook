import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type SpinnerProps = {
  className?: string;
  label?: string;
  useCurrentColor?: boolean;
};

export function Spinner({ className = '', label = 'Loading', useCurrentColor = false }: SpinnerProps) {
  return (
    <LoaderCircle
      className={`animate-spin ${useCurrentColor ? '' : 'text-violet-600'} ${className}`}
      role="status"
      aria-label={label}
    />
  );
}

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
};

export function ActionButton({
  loading = false,
  loadingLabel = 'Loading...',
  disabled,
  children,
  className = '',
  ...props
}: ActionButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      {loading && <Spinner className="h-[18px] w-[18px]" label={loadingLabel} useCurrentColor />}
      {loading ? loadingLabel : children}
    </button>
  );
}
