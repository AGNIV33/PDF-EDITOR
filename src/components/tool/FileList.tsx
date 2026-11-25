'use client';

import { ArrowDown, ArrowUp, FileText, X } from 'lucide-react';
import { formatBytes } from '@/lib/format';

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
  /** Give this to allow changing the order (e.g. Merge). direction: -1 = up, 1 = down. */
  onMove?: (index: number, direction: -1 | 1) => void;
  disabled?: boolean;
}

const buttonClass =
  'text-muted hover:bg-surface hover:text-text rounded-control focus-visible:outline-primary inline-flex h-11 w-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 disabled:hover:bg-transparent';

// Up and down buttons keep reordering usable with a keyboard and on phones.
export function FileList({ files, onRemove, onMove, disabled = false }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2" aria-label="Chosen files">
      {files.map((file, i) => (
        <li
          key={`${file.name}-${file.size}-${i}`}
          className="border-border bg-surface rounded-card flex items-center gap-3 border p-2 pl-3"
        >
          <FileText size={20} aria-hidden="true" className="text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-text truncate text-sm font-medium">{file.name}</p>
            <p className="text-muted text-xs">{formatBytes(file.size)}</p>
          </div>
          {onMove && (
            <>
              <button
                type="button"
                className={buttonClass}
                aria-label={`Move ${file.name} up`}
                disabled={disabled || i === 0}
                onClick={() => onMove(i, -1)}
              >
                <ArrowUp size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={buttonClass}
                aria-label={`Move ${file.name} down`}
                disabled={disabled || i === files.length - 1}
                onClick={() => onMove(i, 1)}
              >
                <ArrowDown size={20} aria-hidden="true" />
              </button>
            </>
          )}
          <button
            type="button"
            className={buttonClass}
            aria-label={`Remove ${file.name}`}
            disabled={disabled}
            onClick={() => onRemove(i)}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
