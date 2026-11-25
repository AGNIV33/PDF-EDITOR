import { Lock } from 'lucide-react';

export function PrivacyBadge() {
  return (
    <p
      className="text-success border-success/30 bg-success/10 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
      // Hover text explains how to check the promise (DESIGN.md: tooltip explains how to verify).
      title="Open your browser's Network tab (F12) while using this tool. You will see no file being sent."
    >
      <Lock size={14} aria-hidden="true" />
      Your file never leaves this device
    </p>
  );
}
