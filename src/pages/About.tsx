
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function About() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background">
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
                            That's a deliberate constraint, not just a privacy talking point: it means the tools behave the same whether you paste a two-line config file or a query with production table and column names in it, because there's nothing in transit to intercept — nothing is transmitted in the first place.
                        </p>
                    </section>

                    {/* Story */}
                    <section className="prose prose-slate dark:prose-invert max-w-none">
                        <h2 className="text-2xl font-bold mb-4">{t('aboutStoryTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('aboutStoryContent')}
                        </p>
                        <p>
                            The source is public on <a href="https://github.com/PuraIA/sql-charm-curator" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub</a>, so which dialects are supported, how the TypeScript converter infers types, or what exactly Compact Mode strips from your XML is something you can check in the code — not just take on faith from this page.
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
                                <h3 className="font-bold text-primary mb-2">No Server Round Trip</h3>
                                <p className="text-sm text-muted-foreground">Formatting happens the instant you type, in your browser's own engine — there's no request to wait on and no server load to be affected by.</p>
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
                            Bug reports and dialect requests are welcome on the{' '}
                            <a
                                href="https://github.com/PuraIA/sql-charm-curator/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                GitHub issue tracker
                            </a>
                            {' '}— or reach out directly from the{' '}
                            <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.
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
