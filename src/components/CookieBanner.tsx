import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Cookie, X, Settings, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ConsentStatus = 'accepted' | 'declined' | null;

const CONSENT_KEY = 'pf_cookie_consent';

export function getConsentStatus(): ConsentStatus {
    try {
        return (localStorage.getItem(CONSENT_KEY) as ConsentStatus) ?? null;
    } catch {
        return null;
    }
}

export function CookieBanner() {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const stored = getConsentStatus();
        if (stored === null) {
            // Small delay so it doesn't flash on first render
            const timer = setTimeout(() => setVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        setVisible(false);
        // Reload adsbygoogle for the newly accepted session
        try {
            (window as any).adsbygoogle = (window as any).adsbygoogle || [];
            (window as any).adsbygoogle.push({});
        } catch {
            //
        }
    };

    const handleDecline = () => {
        localStorage.setItem(CONSENT_KEY, 'declined');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-label={t('cookieBannerTitle')}
            aria-modal="false"
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom-4 duration-500"
        >
            <div className="max-w-4xl mx-auto bg-background border border-border shadow-2xl rounded-2xl overflow-hidden">
                {/* Main banner */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-5 md:p-6">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Cookie className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="font-semibold text-base">{t('cookieBannerTitle')}</h2>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                        {t('cookieBannerText')}{' '}
                        <a href="/privacy" className="text-primary underline hover:text-primary/80 whitespace-nowrap">
                            {t('privacyPolicyTitle')}
                        </a>
                        .
                    </p>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDetails(d => !d)}
                            className="gap-1.5 text-muted-foreground hover:text-foreground text-xs"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            {t('cookieManage')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDecline}
                            className="text-xs"
                        >
                            {t('cookieDecline')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleAccept}
                            className="gap-1.5 text-xs"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t('cookieAccept')}
                        </Button>
                    </div>
                </div>

                {/* Expandable details */}
                {showDetails && (
                    <div className="border-t border-border bg-secondary/20 px-5 md:px-6 py-4 grid md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                            <p className="font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                {t('cookieTypeEssentialTitle')}
                            </p>
                            <p className="text-muted-foreground text-xs">{t('cookieTypeEssentialDesc')}</p>
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">{t('cookieAlwaysActive')}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold flex items-center gap-1.5">
                                <Cookie className="w-4 h-4 text-blue-500" />
                                {t('cookieTypeAnalyticsTitle')}
                            </p>
                            <p className="text-muted-foreground text-xs">{t('cookieTypeAnalyticsDesc')}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold flex items-center gap-1.5">
                                <Cookie className="w-4 h-4 text-orange-500" />
                                {t('cookieTypeAdsTitle')}
                            </p>
                            <p className="text-muted-foreground text-xs">{t('cookieTypeAdsDesc')}</p>
                            <a
                                href="https://www.google.com/settings/ads"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary underline hover:text-primary/80"
                            >
                                {t('cookieOptOut')}
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
