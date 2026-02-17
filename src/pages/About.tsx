
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { SEO } from '@/components/SEO';

export default function About() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title={`${t('aboutTitle')} - SQL Formatter`}
                description={t('aboutIntroContent')}
                keywords={t('aboutKeywords')}
            />
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
                <div className="glass-card p-10 animate-slide-up space-y-12">
                    {/* Mission */}
                    <section className="prose prose-slate dark:prose-invert max-w-none">
                        <div className="flex items-center gap-2 mb-4 not-prose">
                            <Zap className="w-6 h-6 text-yellow-500" />
                            <h2 className="text-2xl font-bold m-0">{t('aboutIntroTitle')}</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('aboutIntroContent')}
                        </p>
                        <p>
                            At Pretty Format, we believe that the beauty of code lies in its structure. In an era where data is the lifeblood of every digital experience, the tools we use to understand and manipulate that data must be as elegant as they are functional. Our mission is to provide developers, data scientists, and students with a world-class suite of formatting tools that prioritize speed, privacy, and user experience.
                        </p>
                        <p>
                            We understand that every extra second spent de-obfuscating a minified JSON response or a messy SQL query is a second taken away from real innovation. That's why we've built our platform on the philosophy of "Instant Clarity." No logins, no paywalls, just pure productivity.
                        </p>
                    </section>

                    {/* Story */}
                    <section className="prose prose-slate dark:prose-invert max-w-none">
                        <h2 className="text-2xl font-bold mb-4">{t('aboutStoryTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('aboutStoryContent')}
                        </p>
                        <p>
                            Pretty Format started in 2024 as a internal utility for a small team of backend engineers who were tired of using slow, ad-heavy websites that often compromised their data's privacy by sending it to remote servers. We realized that the developer community deserved better: a modern, browser-based solution that respects the sanctity of your code.
                        </p>
                        <p>
                            What began as a simple SQL beautifier has rapidly evolved. Today, Pretty Format supports multiple languages and dialects, used by professionals at top tech companies and independent developers alike. We are constantly iterating, adding support for new dialects and advanced features based on the feedback we receive from our community.
                        </p>
                    </section>

                    {/* Values */}
                    <section className="prose prose-slate dark:prose-invert max-w-none">
                        <h2 className="text-2xl font-bold mb-4">Our Core Values</h2>
                        <div className="grid md:grid-cols-2 gap-6 not-prose">
                            <div className="bg-secondary/20 p-6 rounded-xl border border-border/50">
                                <h3 className="font-bold text-primary mb-2">Privacy by Default</h3>
                                <p className="text-sm text-muted-foreground">We never see your data. 100% of the formatting logic runs in your browser, ensuring your secrets stay secrets.</p>
                            </div>
                            <div className="bg-secondary/20 p-6 rounded-xl border border-border/50">
                                <h3 className="font-bold text-primary mb-2">Minimalist Design</h3>
                                <p className="text-sm text-muted-foreground">Focus on what matters. Our interface is clean, distraction-free, and optimized for professional workflows.</p>
                            </div>
                            <div className="bg-secondary/20 p-6 rounded-xl border border-border/50">
                                <h3 className="font-bold text-primary mb-2">Accessibility</h3>
                                <p className="text-sm text-muted-foreground">The best tools should be available to everyone, regardless of their location or budget. Pretty Format will always be free.</p>
                            </div>
                            <div className="bg-secondary/20 p-6 rounded-xl border border-border/50">
                                <h3 className="font-bold text-primary mb-2">Performance</h3>
                                <p className="text-sm text-muted-foreground">Built with modern web technologies, our tools are lightning-fast and responsive on any device.</p>
                            </div>
                        </div>
                    </section>

                    {/* Team */}
                    <section className="prose prose-slate dark:prose-invert max-w-none">
                        <div className="flex items-center gap-2 mb-4 not-prose">
                            <Heart className="w-6 h-6 text-red-500" />
                            <h2 className="text-2xl font-bold m-0">{t('aboutTeamTitle')}</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('aboutTeamContent')}
                        </p>
                        <p>
                            The project is currently maintained by Pura IA, a collective of passionate software architects and designers who believe in the power of open-source and free community tools. We are remote-first and driven by the desire to build the utilities we wish we had when we were starting out.
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
