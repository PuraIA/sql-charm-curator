import { useEffect, useState } from 'react';
import { getConsentStatus } from './CookieBanner';
import { AD_CLIENT, AD_SLOTS, type AdPlacement } from '@/config/ads';

declare global {
    interface Window {
        adsbygoogle: unknown[];
    }
}

interface AdBannerProps {
    /** Which placement this unit represents. */
    slotId?: AdPlacement;
    className?: string;
    slotId?: string;
}

/**
 * Google AdSense banner.
 * Respects LGPD/GDPR cookie consent stored in localStorage ('pf_cookie_consent').
 * - 'accepted'  → personalized ads (default AdSense behavior)
 * - 'declined'  → non-personalized ads (data-adsbygoogle-npa="1")
 * - null        → waits for user consent before pushing
 */
<<<<<<< Updated upstream
export const AdPlaceholder: React.FC<AdBannerProps> = ({ slotId = 'content-top', className = '' }) => {
=======
export const AdPlaceholder: React.FC<AdBannerProps> = ({ className = '', slotId }) => {
>>>>>>> Stashed changes
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
        <div className={`my-6 overflow-hidden w-full ${className}`} data-ad-placement={slotId}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={AD_CLIENT}
                data-ad-slot={AD_SLOTS[slotId]}
                data-ad-format="auto"
                data-full-width-responsive="true"
                {...(consent === 'declined' ? { 'data-adsbygoogle-npa': '1' } : {})}
            />
        </div>
    );
};
