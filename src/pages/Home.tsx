
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { useTranslation } from 'react-i18next';
import { Database, Braces, Code2, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
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

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SEO title={t('homeSeoTitle')} description={t('homeSeoDescription')} />

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
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
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
                                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                                    {tool.title}
                                </h3>
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

                {/* Why Section */}
                <section className="bg-secondary/20 rounded-3xl border border-border/40 p-12 md:p-16 mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {highlights.map((item, index) => (
                            <div key={index} className="space-y-4">
                                <div className="p-2 bg-primary/10 rounded-lg w-fit">
                                    {item.icon}
                                </div>
                                <h4 className="text-xl font-bold">{item.title}</h4>
                                <p className="text-muted-foreground leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Home;
