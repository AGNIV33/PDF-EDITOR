import { describe, expect, it } from 'vitest';
import { ToolError } from '@/tools/errors';

describe('ToolError', () => {
  it('keeps the code and the simple message for the user', () => {
    const err = new ToolError('CORRUPT', 'This PDF looks broken.');

    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe('CORRUPT');
    expect(err.userMessage).toBe('This PDF looks broken.');
  });
});
