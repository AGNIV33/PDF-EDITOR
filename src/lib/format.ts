/** 2457600 -> "2.3 MB". Uses 1024, like most file managers show. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  // One decimal for small numbers (2.3 MB), none for big ones (680 KB).
  return `${value >= 100 ? Math.round(value) : Math.round(value * 10) / 10} ${units[unit]}`;
}

/** Text for the result card, e.g. "2.4 MB → 680 KB (72% smaller)". */
export function describeSizeChange(before: number, after: number): string {
  const arrow = `${formatBytes(before)} → ${formatBytes(after)}`;
  if (before <= 0) return arrow;

  const percent = Math.round((Math.abs(before - after) / before) * 100);
  if (after < before && percent > 0) return `${arrow} (${percent}% smaller)`;
  if (after > before && percent > 0) return `${arrow} (${percent}% bigger)`;
  return arrow;
}
