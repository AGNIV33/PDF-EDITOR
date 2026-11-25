import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToolShell } from '@/components/tool/ToolShell';
import { ToolError } from '@/tools/errors';
import type { ToolDefinition } from '@/tools/types';

afterEach(cleanup);

const pdf = (name: string, size = 1000) =>
  new File([new Uint8Array(size)], name, { type: 'application/pdf' });

function makeTool(overrides: Partial<ToolDefinition> = {}): ToolDefinition {
  return {
    id: 'fake',
    name: 'Fake PDF',
    description: 'A fake tool for tests.',
    icon: 'file',
    category: 'other',
    platform: 'web',
    accepts: ['application/pdf'],
    multiple: true,
    enabled: true,
    run: async (files, _options, onProgress) => {
      onProgress(100);
      return [{ name: 'out.pdf', blob: new Blob([new Uint8Array(250)]) }];
    },
    ...overrides,
  };
}

function addFiles(files: File[]) {
  const input = document.querySelector('input[type=file]') as HTMLInputElement;
  fireEvent.change(input, { target: { files } });
}

describe('ToolShell', () => {
  it('shows the title, description and privacy badge', () => {
    render(<ToolShell tool={makeTool()} />);

    expect(screen.getByRole('heading', { name: 'Fake PDF' })).toBeTruthy();
    expect(screen.getByText('A fake tool for tests.')).toBeTruthy();
    expect(screen.getByText('Your file never leaves this device')).toBeTruthy();
  });

  it('has no action button until a file is added', () => {
    render(<ToolShell tool={makeTool()} />);
    expect(screen.queryByRole('button', { name: 'Fake PDF' })).toBeNull();

    addFiles([pdf('a.pdf')]);
    expect(screen.getByRole('button', { name: 'Fake PDF' })).toBeTruthy();
  });

  it('runs the tool and shows the result with the size change', async () => {
    const onRunComplete = vi.fn();
    render(<ToolShell tool={makeTool()} onRunComplete={onRunComplete} />);

    addFiles([pdf('a.pdf', 1000)]);
    fireEvent.click(screen.getByRole('button', { name: 'Fake PDF' }));

    await waitFor(() => expect(screen.getByText('Done!')).toBeTruthy());
    expect(screen.getByText(/75% smaller/)).toBeTruthy();
    expect(onRunComplete).toHaveBeenCalledOnce();
  });

  it('shows the simple message from a ToolError', async () => {
    const tool = makeTool({
      run: async () => {
        throw new ToolError('ENCRYPTED', 'This PDF is password protected. Please unlock it first.');
      },
    });
    render(<ToolShell tool={tool} />);

    addFiles([pdf('a.pdf')]);
    fireEvent.click(screen.getByRole('button', { name: 'Fake PDF' }));

    expect((await screen.findByRole('alert')).textContent).toContain('password protected');
  });

  it('hides raw errors behind a friendly message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const tool = makeTool({
      run: async () => {
        throw new Error('TypeError at parse() line 42');
      },
    });
    render(<ToolShell tool={tool} />);

    addFiles([pdf('a.pdf')]);
    fireEvent.click(screen.getByRole('button', { name: 'Fake PDF' }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).not.toContain('parse()');
    expect(alert.textContent).toContain('Please try again');
  });

  it('cancels a running tool without showing an error', async () => {
    const tool = makeTool({
      run: (_files, _options, _progress, signal) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => reject(new ToolError('CANCELLED', 'Cancelled.')));
        }),
    });
    render(<ToolShell tool={tool} />);

    addFiles([pdf('a.pdf')]);
    fireEvent.click(screen.getByRole('button', { name: 'Fake PDF' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('progressbar')).toBeNull());
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('button', { name: 'Fake PDF' })).toBeTruthy();
  });

  it('only allows one file for single-file tools', () => {
    render(<ToolShell tool={makeTool({ multiple: false })} />);

    addFiles([pdf('a.pdf')]);

    // The upload box goes away because the one file is already added.
    expect(screen.queryByText(/Drop files here/)).toBeNull();
  });

  it('shows "paused" and no upload box when the tool is switched off', () => {
    render(<ToolShell tool={makeTool({ enabled: false })} />);

    expect(screen.getByText(/paused/i)).toBeTruthy();
    expect(screen.queryByText(/Drop files here/)).toBeNull();
  });

  it('starts over with an empty list', async () => {
    render(<ToolShell tool={makeTool()} />);

    addFiles([pdf('a.pdf')]);
    fireEvent.click(screen.getByRole('button', { name: 'Fake PDF' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Start over' }));

    expect(screen.queryByText('a.pdf')).toBeNull();
    expect(screen.getByText(/Drop files here/)).toBeTruthy();
  });
});
