import Link from 'next/link';

const linkClass =
  'hover:text-text rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

// Feedback and Download app links are added later (tasks R2.4 and R3.6).
export function Footer() {
  return (
    <footer className="border-border bg-surface text-muted border-t text-sm">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 sm:px-6">
        <p className="mr-auto">Free PDF tools. Processed on your device.</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/privacy" className={linkClass}>
            Privacy
          </Link>
          <Link href="/about" className={linkClass}>
            About
          </Link>
          <a
            href="https://github.com/AGNIV33/PDF-EDITOR"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
