/** Reading pasted-in files and saving tool output, entirely in the browser. */

/** Largest file the tools will load. Formatting runs on the main thread. */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export class FileTooLargeError extends Error {}

/** Reads a file as UTF-8 text. Throws FileTooLargeError above MAX_FILE_BYTES. */
export async function readTextFile(file: Blob): Promise<string> {
    if (file.size > MAX_FILE_BYTES) throw new FileTooLargeError();
    return file.text();
}

/** Saves text as a file through a temporary object URL — nothing leaves the browser. */
export function downloadText(filename: string, text: string, mimeType = 'text/plain'): void {
    const url = URL.createObjectURL(new Blob([text], { type: `${mimeType};charset=utf-8` }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Ctrl+Enter, or Cmd+Enter on macOS. */
export function isRunShortcut(event: { key: string; ctrlKey: boolean; metaKey: boolean }): boolean {
    return event.key === 'Enter' && (event.ctrlKey || event.metaKey);
}
