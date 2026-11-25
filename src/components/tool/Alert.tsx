import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

type Variant = 'error' | 'warning' | 'info' | 'success';

const styles: Record<Variant, { box: string; Icon: typeof Info }> = {
  error: { box: 'border-danger/40 bg-danger/10 text-danger', Icon: XCircle },
  warning: { box: 'border-warning/40 bg-warning/10 text-warning', Icon: AlertTriangle },
  info: { box: 'border-primary/40 bg-primary-soft text-primary', Icon: Info },
  success: { box: 'border-success/40 bg-success/10 text-success', Icon: CheckCircle2 },
};

interface AlertProps {
  variant: Variant;
  children: ReactNode;
  /** Optional extra, e.g. a "Report this" link (task R2.4). */
  action?: ReactNode;
}

// The icon means colour is never the only signal (DESIGN.md section 13).
export function Alert({ variant, children, action }: AlertProps) {
  const { box, Icon } = styles[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`rounded-control flex items-start gap-3 border p-3 text-sm ${box}`}
    >
      <Icon size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
      <div className="text-text min-w-0 flex-1">{children}</div>
      {action}
    </div>
  );
}
