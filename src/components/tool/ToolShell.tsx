'use client';

import { useRef, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import { ToolError } from '@/tools/errors';
import type { ToolDefinition, ToolResult } from '@/tools/types';
import { Alert } from './Alert';
import { FileList } from './FileList';
import { PrivacyBadge } from './PrivacyBadge';
import { ProgressBar } from './ProgressBar';
import { ResultCard } from './ResultCard';
import { UploadBox } from './UploadBox';

/** Same shape as ToolDefinition.run. Task R1.3 will pass in a Web Worker version. */
export type ToolRunner = ToolDefinition['run'];

export interface RunSummary {
  tool: ToolDefinition;
  files: File[];
  results: ToolResult[];
}

interface ToolShellProps {
  tool: ToolDefinition;
  /** Defaults to calling tool.run directly on the main thread. */
  runner?: ToolRunner;
  /** Called after a successful run. History (task R1.9) hooks in here. Never receives file bytes to send. */
  onRunComplete?: (summary: RunSummary) => void;
}

type Status = 'idle' | 'running' | 'done';

export function ToolShell({ tool, runner, onRunComplete }: ToolShellProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Record<string, unknown>>(tool.defaultOptions ?? {});
  const [status, setStatus] = useState<Status>('idle');
  const [percent, setPercent] = useState(0);
  const [results, setResults] = useState<ToolResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const running = status === 'running';
  const OptionsPanel = tool.OptionsPanel;
  const canAddMore = tool.multiple && (tool.maxFiles === undefined || files.length < tool.maxFiles);
  const showUpload = files.length === 0 || (canAddMore && status !== 'done');

  function changeFiles(next: File[]) {
    setFiles(next);
    // Old results no longer match the new list.
    setResults([]);
    setError(null);
    setStatus('idle');
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= files.length) return;
    const next = [...files];
    [next[index], next[target]] = [next[target], next[index]];
    changeFiles(next);
  }

  async function run() {
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('running');
    setPercent(0);
    setError(null);
    setResults([]);

    try {
      const output = await (runner ?? tool.run)(
        files,
        options,
        (p) => setPercent(p),
        controller.signal,
      );
      setResults(output);
      setStatus('done');
      onRunComplete?.({ tool, files, results: output });
    } catch (e) {
      setStatus('idle');
      if (e instanceof ToolError) {
        // The user pressed Cancel: not an error, just go back.
        if (e.code !== 'CANCELLED') setError(e.userMessage);
      } else {
        // Never show raw errors to users (AGENTS.md). Details only in the console while developing.
        if (process.env.NODE_ENV !== 'production') console.error(e);
        setError("We couldn't finish this. Please try again, or try a different file.");
      }
    } finally {
      abortRef.current = null;
    }
  }

  function download() {
    // One file downloads directly. A single ZIP for many files comes in task R1.6.
    for (const r of results) downloadBlob(r.name, r.blob);
  }

  function startOver() {
    changeFiles([]);
    setOptions(tool.defaultOptions ?? {});
  }

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-text text-[28px] leading-9 font-bold sm:text-[32px] sm:leading-10">
          {tool.name}
        </h1>
        <p className="text-muted">{tool.description}</p>
        <div>
          <PrivacyBadge />
        </div>
      </header>

      {!tool.enabled ? (
        <Alert variant="info">This tool is paused for now. Please check back soon.</Alert>
      ) : (
        <div
          className={`grid gap-6 ${OptionsPanel && files.length > 0 ? 'lg:grid-cols-[1fr_320px]' : ''}`}
        >
          <div className="flex min-w-0 flex-col gap-4">
            {showUpload && (
              <UploadBox
                accepts={tool.accepts}
                multiple={tool.multiple}
                maxFiles={tool.maxFiles}
                currentCount={files.length}
                disabled={running}
                onFiles={(added) => changeFiles(tool.multiple ? [...files, ...added] : added)}
              />
            )}

            <FileList
              files={files}
              disabled={running}
              onRemove={(i) => changeFiles(files.filter((_, idx) => idx !== i))}
              onMove={tool.multiple && files.length > 1 ? move : undefined}
            />

            {error && <Alert variant="error">{error}</Alert>}

            {running && (
              <ProgressBar percent={percent} onCancel={() => abortRef.current?.abort()} />
            )}

            {status === 'done' && (
              <ResultCard
                results={results.map((r) => ({ name: r.name, size: r.blob.size }))}
                sizeBefore={files.reduce((sum, f) => sum + f.size, 0)}
                onDownload={download}
                onStartOver={startOver}
              />
            )}
          </div>

          {OptionsPanel && files.length > 0 && (
            <aside
              aria-label="Options"
              className="border-border bg-surface rounded-card h-fit border p-4"
            >
              <OptionsPanel value={options} onChange={setOptions} />
            </aside>
          )}
        </div>
      )}

      {tool.enabled && files.length > 0 && status !== 'done' && (
        // On phones the button sticks to the bottom of the screen (DESIGN.md section 9.3).
        <div className="bg-bg/95 border-border sticky bottom-0 -mx-4 border-t px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="bg-primary hover:bg-primary-hover rounded-control focus-visible:outline-primary h-12 w-full px-8 text-base font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 sm:w-auto"
          >
            {running ? 'Working…' : tool.name}
          </button>
        </div>
      )}
    </main>
  );
}
