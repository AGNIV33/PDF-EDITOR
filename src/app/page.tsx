import { Lock } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">PDF Tools</h1>
      <p className="text-muted flex items-center gap-2">
        <Lock size={20} aria-hidden="true" className="text-success" />
        Your file never leaves this device.
      </p>
    </main>
  );
}
