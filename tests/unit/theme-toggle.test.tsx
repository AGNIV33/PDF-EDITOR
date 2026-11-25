import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThemeToggle } from '@/components/ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });
  afterEach(cleanup);

  it('switches to dark mode and remembers it', () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button', { name: /light and dark/i }));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('switches back to light mode', () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button', { name: /light and dark/i }));

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
