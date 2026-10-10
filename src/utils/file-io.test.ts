import { describe, it, expect } from 'vitest';
import { FileTooLargeError, isRunShortcut, MAX_FILE_BYTES, readTextFile } from './file-io';

describe('file-io', () => {
    it('reads a file as UTF-8 text', async () => {
        expect(await readTextFile(new Blob(['select 1; -- olá']))).toBe('select 1; -- olá');
    });

    it('refuses files above the size limit', async () => {
        await expect(readTextFile(new Blob([new Uint8Array(MAX_FILE_BYTES + 1)]))).rejects.toBeInstanceOf(FileTooLargeError);
    });

    it('treats Ctrl+Enter and Cmd+Enter as the run shortcut, and nothing else', () => {
        expect(isRunShortcut({ key: 'Enter', ctrlKey: true, metaKey: false })).toBe(true);
        expect(isRunShortcut({ key: 'Enter', ctrlKey: false, metaKey: true })).toBe(true);
        expect(isRunShortcut({ key: 'Enter', ctrlKey: false, metaKey: false })).toBe(false);
        expect(isRunShortcut({ key: 'a', ctrlKey: true, metaKey: false })).toBe(false);
    });
});
