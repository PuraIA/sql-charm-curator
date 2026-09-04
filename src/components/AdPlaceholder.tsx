import { useEffect, useState } from 'react';
import { getConsentStatus } from './CookieBanner';

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
 * Respects LGPD/GDPR cookie consent stored in localStorage ('pf_cookie_consent').
 * - 'accepted'  → personalized ads (default AdSense behavior)
 * - 'declined'  → non-personalized ads (data-adsbygoogle-npa="1")
 * - null        → waits for user consent before pushing
 */
export const AdPlaceholder: React.FC<AdBannerProps> = ({ className = '' }) => {
    const [consent, setConsent] = useState<'accepted' | 'declined' | null>(getConsentStatus);

    // Re-check consent whenever localStorage changes (e.g. after user interacts with banner)
    useEffect(() => {
        const onStorage = () => setConsent(getConsentStatus());
        window.addEventListener('storage', onStorage);

        // Also poll briefly so same-tab banner interaction is caught
        const interval = setInterval(() => {
            const current = getConsentStatus();
            setConsent(prev => (prev !== current ? current : prev));
        }, 500);

        return () => {
            window.removeEventListener('storage', onStorage);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (consent === null) return; // Wait for consent
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
            // Silently fail (dev, ad blockers, etc.)
        }
    }, [consent]);

    if (consent === null) return null; // Don't render until user decides

    return (
        <div className={`my-6 overflow-hidden w-full ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-4026555335042993"
                data-ad-slot="5322374741"
                data-ad-format="auto"
                data-full-width-responsive="true"
                {...(consent === 'declined' ? { 'data-adsbygoogle-npa': '1' } : {})}
            />
        </div>
    );
};
