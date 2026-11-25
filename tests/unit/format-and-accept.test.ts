import { describe, expect, it } from 'vitest';
import { describeAccepts, isAccepted, validateFiles } from '@/lib/accept';
import { describeSizeChange, formatBytes } from '@/lib/format';

const pdf = (name = 'a.pdf') => new File(['x'], name, { type: 'application/pdf' });
const png = (name = 'a.png') => new File(['x'], name, { type: 'image/png' });

describe('formatBytes', () => {
  it('writes sizes in simple units', () => {
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB');
    expect(formatBytes(680 * 1024)).toBe('680 KB');
  });
});

describe('describeSizeChange', () => {
  it('shows how much smaller the file got', () => {
    expect(describeSizeChange(1000 * 1024, 250 * 1024)).toBe('1000 KB → 250 KB (75% smaller)');
  });
  it('says bigger when the file grew', () => {
    expect(describeSizeChange(100 * 1024, 150 * 1024)).toContain('50% bigger');
  });
  it('shows no percent when nothing changed', () => {
    expect(describeSizeChange(1024, 1024)).toBe('1 KB → 1 KB');
  });
});

describe('isAccepted', () => {
  it('matches by MIME type, extension and wildcard', () => {
    expect(isAccepted(pdf(), ['application/pdf'])).toBe(true);
    expect(isAccepted(pdf('SCAN.PDF'), ['.pdf'])).toBe(true);
    expect(isAccepted(png(), ['image/*'])).toBe(true);
    expect(isAccepted(png(), ['application/pdf', '.pdf'])).toBe(false);
  });
  it('accepts anything when the list is empty', () => {
    expect(isAccepted(png(), [])).toBe(true);
  });
});

describe('describeAccepts', () => {
  it('makes a short readable list', () => {
    expect(describeAccepts(['application/pdf', '.pdf'])).toBe('PDF');
    expect(describeAccepts(['image/jpeg', 'image/png'])).toBe('JPEG, PNG');
  });
});

describe('validateFiles', () => {
  const rules = { accepts: ['application/pdf'], multiple: true, maxFiles: 2 };

  it('keeps good files and explains the rejected ones in simple words', () => {
    const { valid, rejected } = validateFiles([pdf('a.pdf'), png('b.png')], rules);
    expect(valid.map((f) => f.name)).toEqual(['a.pdf']);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].name).toBe('b.png');
    expect(rejected[0].reason).toMatch(/PDF/);
  });

  it('respects maxFiles, counting files already added', () => {
    const { valid, rejected } = validateFiles([pdf('a.pdf'), pdf('b.pdf')], rules, 1);
    expect(valid).toHaveLength(1);
    expect(rejected[0].reason).toMatch(/up to 2/);
  });

  it('allows only one file when multiple is false', () => {
    const { valid, rejected } = validateFiles([pdf('a.pdf'), pdf('b.pdf')], {
      accepts: ['application/pdf'],
      multiple: false,
    });
    expect(valid).toHaveLength(1);
    expect(rejected[0].reason).toMatch(/one file/);
  });
});
