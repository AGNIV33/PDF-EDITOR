import { CheckCircle2, Download } from 'lucide-react';
import { describeSizeChange, formatBytes } from '@/lib/format';

interface ResultCardProps {
  /** Output files, as returned by the tool. */
  results: { name: string; size: number }[];
  /** Total size of the files the user added. Gives the "before → after" line. */
  sizeBefore?: number;
  /** Real download (single file or ZIP) is built in task R1.6. */
  onDownload: () => void;
  onStartOver: () => void;
}

export function ResultCard({ results, sizeBefore, onDownload, onStartOver }: ResultCardProps) {
  const sizeAfter = results.reduce((sum, r) => sum + r.size, 0);
  const many = results.length > 1;

  return (
    <section
      aria-label="Result"
      className="border-success/40 bg-surface rounded-card flex flex-col gap-4 border p-4"
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 size={24} aria-hidden="true" className="text-success mt-0.5 shrink-0" />
        <div className="min-w-0">
          <h2 className="text-text text-lg font-semibold">Done!</h2>
          <p className="text-muted text-sm">
            {many ? `${results.length} files ready` : results[0]?.name}
          </p>
          <p className="text-text mt-1 text-sm font-medium">
            {sizeBefore !== undefined
              ? describeSizeChange(sizeBefore, sizeAfter)
              : formatBytes(sizeAfter)}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onDownload}
          className="bg-primary hover:bg-primary-hover rounded-control focus-visible:outline-primary inline-flex h-11 items-center gap-2 px-5 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Download size={20} aria-hidden="true" />
          {many ? 'Download all (ZIP)' : 'Download'}
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="text-text border-border hover:bg-bg rounded-control focus-visible:outline-primary h-11 border px-5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Start over
        </button>
      </div>
    </section>
  );
}
