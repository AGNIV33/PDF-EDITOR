export interface FileRules {
  /** MIME types or extensions from ToolDefinition.accepts, e.g. 'application/pdf', '.pdf', 'image/*'. */
  accepts: string[];
  multiple: boolean;
  maxFiles?: number;
}

export interface RejectedFile {
  name: string;
  /** Simple words, safe to show to the user. */
  reason: string;
}

export function isAccepted(file: File, accepts: string[]): boolean {
  if (accepts.length === 0) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return accepts.some((rule) => {
    const r = rule.trim().toLowerCase();
    if (r.startsWith('.')) return name.endsWith(r);
    if (r.endsWith('/*')) return type.startsWith(r.slice(0, -1));
    return type === r;
  });
}

/** Value for <input accept="...">. */
export function toInputAccept(accepts: string[]): string {
  return accepts.join(',');
}

/** Short text such as "PDF" or "JPG, PNG" for the upload box hint. */
export function describeAccepts(accepts: string[]): string {
  const labels = accepts.map((rule) => {
    const r = rule.trim().toLowerCase();
    if (r.startsWith('.')) return r.slice(1).toUpperCase();
    if (r.endsWith('/*')) return r.slice(0, -2) + ' files';
    return (r.split('/')[1] ?? r).toUpperCase();
  });
  return [...new Set(labels)].join(', ');
}

/**
 * Splits new files into the ones we can use and the ones we cannot.
 * `currentCount` is how many files are already in the list.
 */
export function validateFiles(
  incoming: File[],
  rules: FileRules,
  currentCount = 0,
): { valid: File[]; rejected: RejectedFile[] } {
  const valid: File[] = [];
  const rejected: RejectedFile[] = [];
  const limit = rules.multiple ? (rules.maxFiles ?? Infinity) : 1;

  for (const file of incoming) {
    if (!isAccepted(file, rules.accepts)) {
      rejected.push({
        name: file.name,
        reason: `We can't use this type of file. Please choose ${describeAccepts(rules.accepts)}.`,
      });
    } else if (currentCount + valid.length >= limit) {
      rejected.push({
        name: file.name,
        reason:
          limit === 1
            ? 'This tool works with one file at a time.'
            : `You can add up to ${limit} files here.`,
      });
    } else {
      valid.push(file);
    }
  }

  return { valid, rejected };
}
