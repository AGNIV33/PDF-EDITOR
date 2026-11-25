import { PDFDocument } from 'pdf-lib';
import { ToolError } from '../errors';
import { loadPdf, pdfResult, throwIfCancelled } from '../shared/pdf-utils';
import type { ToolResult } from '../types';

/** Joins the PDFs into one file, keeping the order they were given in. */
export async function runMerge(
  files: File[],
  _options: Record<string, unknown>,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<ToolResult[]> {
  if (files.length < 2) {
    throw new ToolError('UNSUPPORTED', 'Please add at least 2 PDF files to merge.');
  }

  const merged = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    throwIfCancelled(signal);
    const source = await loadPdf(files[i]);
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
    onProgress(Math.round(((i + 1) / files.length) * 95));
  }

  throwIfCancelled(signal);
  const bytes = await merged.save();
  onProgress(100);
  return [pdfResult('merged.pdf', bytes)];
}
