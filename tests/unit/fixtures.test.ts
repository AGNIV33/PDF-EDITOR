import { readFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';

// Checks that each sample file in tests/fixtures/ is what its name says,
// so later tool tests can trust them.
const read = (name: string) => new Uint8Array(readFileSync(`tests/fixtures/${name}`));

describe('sample PDFs', () => {
  it('normal.pdf has 5 pages', async () => {
    const doc = await PDFDocument.load(read('normal.pdf'));
    expect(doc.getPageCount()).toBe(5);
  });

  it('large-150.pdf has 150 pages', async () => {
    const doc = await PDFDocument.load(read('large-150.pdf'));
    expect(doc.getPageCount()).toBe(150);
  });

  it('scanned.pdf has 3 pages and no text fonts', async () => {
    const bytes = read('scanned.pdf');
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(3);
    expect(Buffer.from(bytes).includes('/Font')).toBe(false);
  });

  it('locked.pdf needs a password', async () => {
    await expect(PDFDocument.load(read('locked.pdf'))).rejects.toThrow(/encrypted/i);
  });

  it('corrupt.pdf cannot be opened', async () => {
    await expect(PDFDocument.load(read('corrupt.pdf'))).rejects.toThrow();
  });
});
