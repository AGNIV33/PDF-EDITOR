interface ProgressBarProps {
  /** 0 to 100. */
  percent: number;
  /** Friendly step text, e.g. "Reading page 3 of 20". */
  stepText?: string;
  onCancel?: () => void;
}

export function ProgressBar({ percent, stepText, onCancel }: ProgressBarProps) {
  const value = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div className="border-border bg-surface rounded-card flex flex-col gap-3 border p-4">
      <div className="flex items-center justify-between gap-3 text-sm">
        {/* aria-live="polite" lets screen readers hear the step without being interrupted. */}
        <p aria-live="polite" className="text-text">
          {stepText ?? 'Working on your file…'}
        </p>
        <span className="text-muted tabular-nums">{value}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label="Progress"
        className="bg-border h-2 overflow-hidden rounded-full"
      >
        <div
          className="bg-primary h-full transition-[width] duration-200"
          style={{ width: `${value}%` }}
        />
      </div>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-text border-border hover:bg-bg rounded-control focus-visible:outline-primary h-11 self-start border px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
