import Link from 'next/link';
import { FileText } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const linkClass =
  'text-muted hover:text-text rounded-control px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export function Navbar() {
  return (
    <header className="border-border bg-bg sticky top-0 z-10 border-b">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-[1200px] items-center gap-2 px-4 py-2 sm:px-6"
      >
        <Link
          href="/"
          className="text-text focus-visible:outline-primary rounded-control mr-auto inline-flex items-center gap-2 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <FileText size={24} aria-hidden="true" className="text-primary" />
          PDF Tools
        </Link>
        <Link href="/tools" className={linkClass}>
          Tools
        </Link>
        <Link href="/history" className={linkClass}>
          History
        </Link>
        <ThemeToggle />
        {/* Becomes the avatar menu when login is built (task R1.8). */}
        <Link
          href="/login"
          className="bg-primary hover:bg-primary-hover rounded-control focus-visible:outline-primary px-4 py-2 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Log in
        </Link>
      </nav>
    </header>
  );
}
