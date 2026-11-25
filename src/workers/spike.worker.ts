// Spike (task 0.9): prove pdf-lib and pdfjs-dist both run inside a Web Worker
// in a static export. Throwaway code: delete once the real tool-runner exists.
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

// Inside a worker, pdf.js would fall back to a "fake worker" on this same thread
// and hijack our message channel. So we give it its own real inner worker instead.
function createPdfjsWorker() {
  const port = new Worker(new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url), {
    type: 'module',
  });
  return pdfjs.PDFWorker.create({ port });
}

self.onmessage = async (e: MessageEvent) => {
  if (e.data !== 'go') return;
  try {
    // 1. pdf-lib: create a 3-page PDF in memory.
    const doc = await PDFDocument.create();
    for (let i = 0; i < 3; i++) doc.addPage([200, 200]);
    const bytes = await doc.save();
    // pdf.js takes over the buffer, so read the size first.
    const size = bytes.length;

    // 2. pdf.js: read it back and count the pages.
    const pdf = await pdfjs.getDocument({ data: bytes, worker: createPdfjsWorker() }).promise;
    self.postMessage({ ok: true, pdfLibBytes: size, pdfjsPages: pdf.numPages });
  } catch (e) {
    self.postMessage({ ok: false, error: String(e) });
  }
};
