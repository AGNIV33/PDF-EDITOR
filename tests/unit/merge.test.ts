import { readFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { ToolError } from '@/tools/errors';
import { runMerge } from '@/tools/merge/run';

const sample = (name: string) =>
  new File([readFileSync(`tests/fixtures/${name}`)], name, { type: 'application/pdf' });
const pageCount = async (blob: Blob) =>
  (await PDFDocument.load(new Uint8Array(await blob.arrayBuffer()))).getPageCount();
const noop = () => {};

describe('merge tool', () => {
  it('joins files and keeps the page order', async () => {
    const [out] = await runMerge([sample('normal.pdf'), sample('scanned.pdf')], {}, noop);
    expect(out.name).toBe('merged.pdf');
    expect(await pageCount(out.blob)).toBe(5 + 3);
  });

  it('handles a 150-page file', async () => {
    const [out] = await runMerge([sample('large-150.pdf'), sample('normal.pdf')], {}, noop);
    expect(await pageCount(out.blob)).toBe(155);
  });

  it('reports progress up to 100', async () => {
    const seen: number[] = [];
    await runMerge([sample('normal.pdf'), sample('normal.pdf')], {}, (p) => seen.push(p));
    expect(seen.at(-1)).toBe(100);
  });

  it('needs at least 2 files', async () => {
    await expect(runMerge([sample('normal.pdf')], {}, noop)).rejects.toMatchObject({
      code: 'UNSUPPORTED',
    });
  });

  it('says so when a file is locked', async () => {
    await expect(
      runMerge([sample('normal.pdf'), sample('locked.pdf')], {}, noop),
    ).rejects.toMatchObject({ code: 'ENCRYPTED' });
  });

  it('says so when a file is broken', async () => {
    await expect(
      runMerge([sample('normal.pdf'), sample('corrupt.pdf')], {}, noop),
    ).rejects.toBeInstanceOf(ToolError);
  });

  it('stops when cancelled', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      runMerge([sample('normal.pdf'), sample('normal.pdf')], {}, noop, controller.signal),
    ).rejects.toMatchObject({ code: 'CANCELLED' });
  });
});
