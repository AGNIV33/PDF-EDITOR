'use client';

import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'theme';

export function ThemeToggle() {
  function toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    // Only a "light" or "dark" word is stored on the device. Nothing else.
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }

  // Both icons are always rendered and CSS shows the right one. This avoids reading the theme in
  // React state, so server HTML and browser HTML always match.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark mode"
      className="text-muted hover:bg-surface hover:text-text focus-visible:outline-primary rounded-control inline-flex h-10 w-10 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <Moon size={20} aria-hidden="true" className="dark:hidden" />
      <Sun size={20} aria-hidden="true" className="hidden dark:block" />
    </button>
  );
}
