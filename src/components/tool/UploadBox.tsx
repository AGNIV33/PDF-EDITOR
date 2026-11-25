'use client';

import { UploadCloud } from 'lucide-react';
import { useId, useState } from 'react';
import {
  describeAccepts,
  toInputAccept,
  validateFiles,
  type FileRules,
  type RejectedFile,
} from '@/lib/accept';
import { Alert } from './Alert';

interface UploadBoxProps extends FileRules {
  /** Called with the files that passed the checks. */
  onFiles: (files: File[]) => void;
  /** How many files are already added, so the limit is counted correctly. */
  currentCount?: number;
  disabled?: boolean;
}

export function UploadBox({
  accepts,
  multiple,
  maxFiles,
  onFiles,
  currentCount = 0,
  disabled = false,
}: UploadBoxProps) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<RejectedFile[]>([]);

  function handle(list: FileList | null) {
    if (!list || list.length === 0) return;
    const result = validateFiles(Array.from(list), { accepts, multiple, maxFiles }, currentCount);
    setRejected(result.rejected);
    if (result.valid.length > 0) onFiles(result.valid);
  }

  const hint = [
    accepts.length > 0 ? describeAccepts(accepts) : null,
    multiple ? 'You can choose more than one file' : null,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <div className="flex flex-col gap-3">
      {/* The real file input is hidden but still works with keyboard and screen readers. */}
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handle(e.dataTransfer.files);
        }}
        className={`rounded-panel has-[:focus-visible]:outline-primary flex min-h-48 flex-col items-center justify-center gap-2 border-2 border-dashed p-6 text-center transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${
          dragging
            ? 'border-primary bg-primary-soft'
            : 'border-border bg-surface hover:border-primary'
        } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <UploadCloud size={32} aria-hidden="true" className="text-primary" />
        <span className="text-text font-semibold">Drop files here or choose files</span>
        {hint && <span className="text-muted text-sm">{hint}</span>}
        <input
          id={inputId}
          type="file"
          className="sr-only"
          accept={toInputAccept(accepts)}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            handle(e.target.files);
            // Lets the user pick the same file again after removing it.
            e.target.value = '';
          }}
        />
      </label>

      {rejected.length > 0 && (
        <Alert variant="warning">
          <ul className="flex flex-col gap-1">
            {rejected.map((r, i) => (
              <li key={`${r.name}-${i}`}>
                <strong className="break-all">{r.name}</strong>: {r.reason}
              </li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  );
}
