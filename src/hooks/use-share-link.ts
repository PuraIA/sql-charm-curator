import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
    buildShareUrl,
    decodeShareState,
    encodeShareState,
    readShareToken,
    ShareTooLargeError,
} from '@/utils/share-state';

/**
 * Loads a tool's state from a #s=... share link once, on mount, and returns a function
 * that creates such a link for the current state.
 *
 * After loading, the fragment is removed from the address bar, so editing the content and
 * reloading does not silently bring the shared version back.
 */
export function useShareLink<T>(tool: string, apply: (state: T) => void): (state: T) => Promise<void> {
    const { t } = useTranslation();
    const applyRef = useRef(apply);
    applyRef.current = apply;
    const tRef = useRef(t);
    tRef.current = t;

    useEffect(() => {
        const token = readShareToken(window.location.hash);
        if (!token) return;
        let cancelled = false;
        decodeShareState<T>(tool, token).then(state => {
            if (cancelled) return;
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            if (state === null) {
                toast.error(tRef.current('toolShareInvalid'));
                return;
            }
            applyRef.current(state);
            toast.success(tRef.current('toolShareLoaded'));
        });
        return () => {
            cancelled = true;
        };
    }, [tool]);

    return useCallback(
        async (state: T) => {
            let token: string;
            try {
                token = await encodeShareState(tool, state);
            } catch (error) {
                toast.error(tRef.current(error instanceof ShareTooLargeError ? 'toolShareTooLarge' : 'toolShareFailed'));
                return;
            }
            const url = buildShareUrl(window.location.origin, window.location.pathname, token);
            window.history.replaceState(null, '', url);
            try {
                await navigator.clipboard.writeText(url);
                toast.success(tRef.current('toolShareCopied'));
            } catch {
                toast.info(tRef.current('toolShareInAddressBar'));
            }
        },
        [tool]
    );
}
