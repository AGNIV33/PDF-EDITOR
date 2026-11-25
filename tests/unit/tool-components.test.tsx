import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FileList } from '@/components/tool/FileList';
import { ProgressBar } from '@/components/tool/ProgressBar';
import { ResultCard } from '@/components/tool/ResultCard';
import { UploadBox } from '@/components/tool/UploadBox';

afterEach(cleanup);

const pdf = (name: string) => new File(['x'], name, { type: 'application/pdf' });

describe('UploadBox', () => {
  it('passes good files up and warns about bad ones', () => {
    const onFiles = vi.fn();
    const { container } = render(
      <UploadBox accepts={['application/pdf']} multiple onFiles={onFiles} />,
    );
    const input = container.querySelector('input[type=file]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [pdf('a.pdf'), new File(['x'], 'b.png', { type: 'image/png' })] },
    });

    expect(onFiles).toHaveBeenCalledOnce();
    expect(onFiles.mock.calls[0][0].map((f: File) => f.name)).toEqual(['a.pdf']);
    expect(screen.getByText('b.png')).toBeTruthy();
  });

  it('accepts dropped files', () => {
    const onFiles = vi.fn();
    render(<UploadBox accepts={['application/pdf']} multiple={false} onFiles={onFiles} />);

    fireEvent.drop(screen.getByText(/Drop files here/).closest('label')!, {
      dataTransfer: { files: [pdf('a.pdf')] },
    });

    expect(onFiles).toHaveBeenCalledOnce();
  });
});

describe('FileList', () => {
  it('removes and reorders files', () => {
    const onRemove = vi.fn();
    const onMove = vi.fn();
    render(<FileList files={[pdf('a.pdf'), pdf('b.pdf')]} onRemove={onRemove} onMove={onMove} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove b.pdf' }));
    fireEvent.click(screen.getByRole('button', { name: 'Move a.pdf down' }));

    expect(onRemove).toHaveBeenCalledWith(1);
    expect(onMove).toHaveBeenCalledWith(0, 1);
    expect(
      (screen.getByRole('button', { name: 'Move a.pdf up' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});

describe('ProgressBar', () => {
  it('shows progress and lets the user cancel', () => {
    const onCancel = vi.fn();
    render(<ProgressBar percent={42} stepText="Reading page 3 of 20" onCancel={onCancel} />);

    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('42');
    expect(screen.getByText('Reading page 3 of 20')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

describe('ResultCard', () => {
  it('shows before and after size with the saved percent', () => {
    const onDownload = vi.fn();
    render(
      <ResultCard
        results={[{ name: 'small.pdf', size: 250 * 1024 }]}
        sizeBefore={1000 * 1024}
        onDownload={onDownload}
        onStartOver={() => {}}
      />,
    );

    expect(screen.getByText(/75% smaller/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Download/ }));
    expect(onDownload).toHaveBeenCalledOnce();
  });

  it('offers a ZIP for many files', () => {
    render(
      <ResultCard
        results={[
          { name: 'a.pdf', size: 10 },
          { name: 'b.pdf', size: 10 },
        ]}
        onDownload={() => {}}
        onStartOver={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /ZIP/ })).toBeTruthy();
  });
});
