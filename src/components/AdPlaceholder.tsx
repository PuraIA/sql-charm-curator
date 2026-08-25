import { useEffect } from 'react';

declare global {
    interface Window {
        adsbygoogle: unknown[];
    }
}

interface AdBannerProps {
    className?: string;
}

/**
 * Real Google AdSense banner component.
 * Slot: 5322374741 / Publisher: ca-pub-4026555335042993
 * The adsbygoogle.js script is loaded in index.html <head>.
 */
export const AdPlaceholder: React.FC<AdBannerProps> = ({ className = '' }) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
            // Silently fail if AdSense is not loaded (e.g. dev, ad blockers)
        }
    }, []);

    return (
        <div className={`my-6 overflow-hidden w-full ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-4026555335042993"
                data-ad-slot="5322374741"
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
};
