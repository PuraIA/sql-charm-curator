
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <Button
            variant="outline"
            size="icon"
            className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-primary/10 animate-fade-in"
            onClick={scrollToTop}
            aria-label={t('scrollToTop', 'Scroll to top')}
        >
            <ArrowUp className="w-5 h-5 text-primary" />
        </Button>
    );
};
