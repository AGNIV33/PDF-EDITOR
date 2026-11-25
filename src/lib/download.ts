/** Saves one file to the user's disk. The file only goes from memory to disk, never over the network. */
export function downloadBlob(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Frees the memory. Waits a moment so the browser can start the download first.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
