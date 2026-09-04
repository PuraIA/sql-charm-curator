import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import { useTranslation } from 'react-i18next';
import { Database, Braces, Code2, ArrowRight, ShieldCheck, Zap, Sparkles, MousePointerClick, Clock, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Home = () => {
    const { t } = useTranslation();

    const tools = [
        {
            title: t('sqlCardTitle'),
            description: t('sqlCardDesc'),
            icon: <Database className="w-10 h-10 text-primary" />,
            link: '/sql',
            color: 'from-blue-500/20 to-cyan-500/20'
        },
        {
            title: t('jsonCardTitle'),
            description: t('jsonCardDesc'),
            icon: <Braces className="w-10 h-10 text-primary" />,
            link: '/json',
            color: 'from-amber-500/20 to-orange-500/20'
        },
        {
            title: t('xmlCardTitle'),
            description: t('xmlCardDesc'),
            icon: <Code2 className="w-10 h-10 text-primary" />,
            link: '/xml',
            color: 'from-emerald-500/20 to-teal-500/20'
        }
    ];

    const highlights = [
        {
            title: t('highlight1Title'),
            icon: <ShieldCheck className="w-6 h-6 text-primary" />,
            desc: t('highlight1Desc')
        },
        {
            title: t('highlight2Title'),
            icon: <Zap className="w-6 h-6 text-primary" />,
            desc: t('highlight2Desc')
        },
        {
            title: t('highlight3Title'),
            icon: <Sparkles className="w-6 h-6 text-primary" />,
            desc: t('highlight3Desc')
        }
    ];

    const steps = [
        {
            number: '01',
            icon: <MousePointerClick className="w-6 h-6 text-primary" />,
            title: t('howStep1Title'),
            desc: t('howStep1Desc'),
        },
        {
            number: '02',
            icon: <Zap className="w-6 h-6 text-primary" />,
            title: t('howStep2Title'),
            desc: t('howStep2Desc'),
        },
        {
            number: '03',
            icon: <Clock className="w-6 h-6 text-primary" />,
            title: t('howStep3Title'),
            desc: t('howStep3Desc'),
        },
        {
            number: '04',
            icon: <Lock className="w-6 h-6 text-primary" />,
            title: t('howStep4Title'),
            desc: t('howStep4Desc'),
        },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SEO
                title={t('homeSeoTitle')}
                description={t('homeSeoDescription')}
                keywords={t('homeSeoKeywords')}
                ogTitle={t('homeOgTitle')}
                ogDescription={t('homeOgDescription')}
                twitterTitle={t('homeTwitterTitle')}
                twitterDescription={t('homeTwitterDescription')}
            />

            {/* Background gradient effect */}
            <div className="fixed inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />

            <Header />

            <main className="relative z-10 flex-grow container mx-auto px-4 py-12 max-w-7xl">
                {/* Hero Section */}
                <section className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-5xl md:text-7xl font-bold text-gradient mb-6 tracking-tight">
                        {t('homeTitle')}
                    </h1>
                    <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
                        {t('homeSubtitle')}
                    </p>
                </section>

                {/* Tools Grid */}
                <section aria-label="Available formatting tools" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {tools.map((tool, index) => (
                        <Link
                            key={index}
                            to={tool.link}
                            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-secondary/30 p-8 transition-all hover:scale-[1.02] hover:bg-secondary/50 hover:border-primary/50"
                        >
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${tool.color}`} />
                            <div className="relative z-10">
                                <div className="mb-6 p-3 bg-background/50 rounded-xl w-fit border border-border/50 shadow-sm group-hover:border-primary/50 transition-colors">
                                    {tool.icon}
                                </div>
                                <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                                    {tool.title}
                                </h2>
                                <p className="text-muted-foreground mb-8 leading-relaxed">
                                    {tool.description}
                                </p>
                                <Button variant="ghost" className="group/btn p-0 hover:bg-transparent text-primary font-semibold">
                                    {t('openTool')}
                                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                </Button>
                            </div>
                        </Link>
                    ))}
                </section>

                {/* Ad between Tools Grid and Why Section */}
                <div className="mb-12">
                    <AdPlaceholder />
                </div>

                {/* How It Works */}
                <section aria-label="How Pretty Format works" className="mb-20">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t('howTitle')}</h2>
                    <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12 leading-relaxed">
                        {t('howSubtitle')}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {steps.map((step, i) => (
                            <div key={i} className="relative flex flex-col items-start gap-4 rounded-2xl border border-border/40 bg-secondary/20 p-6 hover:border-primary/40 transition-colors">
                                <span className="text-5xl font-black text-primary/10 select-none leading-none">{step.number}</span>
                                <div className="p-2 bg-primary/10 rounded-lg">{step.icon}</div>
                                <h3 className="font-bold text-lg">{step.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Why Section */}
                <section aria-label="Why choose Pretty Format" className="bg-secondary/20 rounded-3xl border border-border/40 p-12 md:p-16 mb-20">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">{t('whyTitle')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {highlights.map((item, index) => (
                            <div key={index} className="space-y-4">
                                <div className="p-2 bg-primary/10 rounded-lg w-fit">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Editorial Content Section */}
                <section aria-label="Developer resources" className="mb-20 prose prose-slate dark:prose-invert max-w-none">
                    <h2 className="text-3xl font-bold mb-6 not-prose">{t('editorialTitle')}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t('editorialP1')}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        {t('editorialP2')}
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 not-prose mt-8">
                        <div className="bg-secondary/20 rounded-xl p-6 border border-border/50">
                            <h3 className="font-bold text-primary mb-2">{t('editorialCard1Title')}</h3>
                            <p className="text-sm text-muted-foreground">{t('editorialCard1Desc')}</p>
                        </div>
                        <div className="bg-secondary/20 rounded-xl p-6 border border-border/50">
                            <h3 className="font-bold text-primary mb-2">{t('editorialCard2Title')}</h3>
                            <p className="text-sm text-muted-foreground">{t('editorialCard2Desc')}</p>
                        </div>
                        <div className="bg-secondary/20 rounded-xl p-6 border border-border/50">
                            <h3 className="font-bold text-primary mb-2">{t('editorialCard3Title')}</h3>
                            <p className="text-sm text-muted-foreground">{t('editorialCard3Desc')}</p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Home;
