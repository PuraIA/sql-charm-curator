import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    buildShareUrl,
    decodeShareState,
    encodeShareState,
    MAX_SHARE_TOKEN_LENGTH,
    readShareToken,
    ShareTooLargeError,
} from './share-state';

afterEach(() => vi.unstubAllGlobals());

const STATE = { input: "select 'olá — ünïcödé 🚀' as x;", options: { dialect: 'postgresql', tabWidth: 2 }, compactMode: false };

describe('share links', () => {
    it('round-trips a state, including non-ASCII text, through a compressed token', async () => {
        const token = await encodeShareState('sql', STATE);
        expect(token[0]).toBe('z');
        expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
        expect(await decodeShareState('sql', token)).toEqual(STATE);
    });

    it('compresses repetitive content well below its raw size', async () => {
        const input = 'SELECT id, name, email FROM users WHERE active = true;\n'.repeat(200);
        const token = await encodeShareState('sql', { input });
        expect(token.length).toBeLessThan(input.length / 10);
    });

    it('falls back to an uncompressed token where CompressionStream is missing, and still decodes', async () => {
        vi.stubGlobal('CompressionStream', undefined);
        const token = await encodeShareState('json', STATE);
        expect(token[0]).toBe('p');
        expect(await decodeShareState('json', token)).toEqual(STATE);
    });

    it('rejects a token made for a different tool', async () => {
        const token = await encodeShareState('sql', STATE);
        expect(await decodeShareState('xml', token)).toBeNull();
    });

    it('returns null for damaged or unknown tokens instead of throwing', async () => {
        const token = await encodeShareState('sql', STATE);
        expect(await decodeShareState('sql', token.slice(0, -12))).toBeNull();
        expect(await decodeShareState('sql', 'x' + token.slice(1))).toBeNull();
        expect(await decodeShareState('sql', '')).toBeNull();
        expect(await decodeShareState('sql', 'p!!!')).toBeNull();
    });

    it('refuses content that would make an unreasonably long link', async () => {
        // Random bytes, mapped to printable characters, do not compress.
        const bytes = crypto.getRandomValues(new Uint8Array(MAX_SHARE_TOKEN_LENGTH));
        const noise = Array.from(bytes, b => String.fromCharCode(33 + (b % 90))).join('');
        await expect(encodeShareState('sql', { input: noise })).rejects.toBeInstanceOf(ShareTooLargeError);
    });

    it('reads the token from the fragment and builds a fragment-only URL', () => {
        expect(readShareToken('#s=zABC_-1')).toBe('zABC_-1');
        expect(readShareToken('#other=1')).toBeNull();
        expect(readShareToken('')).toBeNull();
        expect(buildShareUrl('https://www.prettyformat.com', '/sql', 'zABC')).toBe('https://www.prettyformat.com/sql#s=zABC');
    });
});
