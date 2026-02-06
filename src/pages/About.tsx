
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { SEO } from '@/components/SEO';

export default function About() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background">
            <SEO title={`${t('aboutTitle')} - SQL Formatter`} description={t('aboutIntroContent')} />
            {/* Background gradient effect */}
            <div className="fixed inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <header className="mb-8 animate-fade-in">
                    <Link to="/">
                        <Button variant="ghost" className="mb-6 gap-2 hover:bg-primary/10">
                            <ArrowLeft className="w-4 h-4" />
                            {t('backToHome')}
                        </Button>
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <Users className="w-10 h-10 text-primary" />
                        <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                            {t('aboutTitle')}
                        </h1>
                    </div>
                </header>

                {/* Content */}
                <div className="glass-card p-8 animate-slide-up space-y-8">
                    {/* Mission */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-6 h-6 text-yellow-500" />
                            <h2 className="text-2xl font-bold">{t('aboutIntroTitle')}</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('aboutIntroContent')}
                        </p>
                    </section>

                    {/* Story */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">{t('aboutStoryTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('aboutStoryContent')}
                        </p>
                    </section>

                    {/* Team */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Heart className="w-6 h-6 text-red-500" />
                            <h2 className="text-2xl font-bold">{t('aboutTeamTitle')}</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('aboutTeamContent')}
                        </p>
                    </section>
                </div>

                {/* Back to Home Button */}
                <div className="mt-8 text-center">
                    <Link to="/">
                        <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/10">
                            <ArrowLeft className="w-4 h-4" />
                            {t('backToHome')}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
