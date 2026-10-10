/**
 * Share links that carry a tool's state inside the URL fragment (#s=...).
 *
 * The fragment is never sent to the server — not in the request line, not in a Referer
 * header — so sharing keeps the site's "nothing you paste is uploaded" property: the
 * content travels only inside the link itself, to whoever the user gives it to.
 *
 * Token format: one marker character, then base64url.
 *   'z' — UTF-8 JSON compressed with deflate-raw (CompressionStream, when available)
 *   'p' — plain UTF-8 JSON (fallback for environments without CompressionStream)
 */

export const SHARE_PARAM = 's';

/** Longest token we put in a link. Longer content should be downloaded, not linked. */
export const MAX_SHARE_TOKEN_LENGTH = 32_000;

interface SharePayload<T> {
    v: 1;
    tool: string;
    state: T;
}

export class ShareTooLargeError extends Error {}

function toBase64Url(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array {
    const base64 = text.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
    const output = new Blob([bytes]).stream().pipeThrough(stream);
    return new Uint8Array(await new Response(output).arrayBuffer());
}

/** Encodes a tool's state into a URL-safe token. Throws ShareTooLargeError past the limit. */
export async function encodeShareState<T>(tool: string, state: T): Promise<string> {
    const payload: SharePayload<T> = { v: 1, tool, state };
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    const token =
        typeof CompressionStream === 'function'
            ? 'z' + toBase64Url(await pipe(bytes, new CompressionStream('deflate-raw')))
            : 'p' + toBase64Url(bytes);
    if (token.length > MAX_SHARE_TOKEN_LENGTH) throw new ShareTooLargeError();
    return token;
}

/**
 * Decodes a token produced by encodeShareState for the same tool. Returns null for a
 * damaged token, a token from another tool, or an unknown version — never throws.
 */
export async function decodeShareState<T>(tool: string, token: string): Promise<T | null> {
    try {
        const marker = token[0];
        const raw = fromBase64Url(token.slice(1));
        let bytes: Uint8Array;
        if (marker === 'z') {
            if (typeof DecompressionStream !== 'function') return null;
            bytes = await pipe(raw, new DecompressionStream('deflate-raw'));
        } else if (marker === 'p') {
            bytes = raw;
        } else {
            return null;
        }
        const payload = JSON.parse(new TextDecoder().decode(bytes)) as Partial<SharePayload<T>>;
        if (payload.v !== 1 || payload.tool !== tool || payload.state === undefined) return null;
        return payload.state as T;
    } catch {
        return null;
    }
}

/** The share token in a location.hash value ("#s=..."), or null. */
export function readShareToken(hash: string): string | null {
    if (!hash || hash.length < 2) return null;
    return new URLSearchParams(hash.slice(1)).get(SHARE_PARAM);
}

/** The page URL with the token as its fragment, and no query string or other fragment. */
export function buildShareUrl(origin: string, pathname: string, token: string): string {
    return `${origin}${pathname}#${SHARE_PARAM}=${token}`;
}
