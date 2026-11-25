import { PDFDocument } from 'pdf-lib';
import { ToolError } from '../errors';

/** Stops a running tool when the user presses Cancel. Call it between steps. */
export function throwIfCancelled(signal?: AbortSignal): void {
  if (signal?.aborted) throw new ToolError('CANCELLED', 'Stopped. Nothing was changed.');
}

/** Opens a PDF and turns pdf-lib errors into simple messages for the user. */
export async function loadPdf(file: File): Promise<PDFDocument> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    return await PDFDocument.load(bytes);
  } catch (e) {
    // Matched by message: pdf-lib's error class does not survive bundling reliably.
    if (e instanceof Error && /encrypted/i.test(e.message)) {
      throw new ToolError('ENCRYPTED', `"${file.name}" is password protected. Unlock it first.`);
    }
    throw new ToolError('CORRUPT', `"${file.name}" is damaged or is not a PDF file.`);
  }
}

/** Wraps saved PDF bytes as a result file. */
export function pdfResult(name: string, bytes: Uint8Array) {
  return { name, blob: new Blob([bytes as BlobPart], { type: 'application/pdf' }) };
}
