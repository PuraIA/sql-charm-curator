import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Github, Twitter } from 'lucide-react';

import { SEO } from '@/components/SEO';

const Contact = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <SEO title={`${t('contactTitle')} - SQL Formatter`} description={t('contactSubtitle')} />
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link to="/">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            {t('backToHome')}
                        </Button>
                    </Link>
                </div>

                <div className="glass-card p-8 md:p-12 animate-fade-in text-center">
                    <h1 className="text-3xl font-bold mb-4">{t('contactTitle')}</h1>
                    <p className="text-muted-foreground mb-12">
                        {t('contactSubtitle')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center p-6 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 transition-colors">
                            <Mail className="w-8 h-8 mb-4 text-primary" />
                            <h3 className="font-semibold mb-2">{t('contactEmail')}</h3>
                            <a href="mailto:contato@jfmaia.site" className="text-sm text-primary hover:underline">
                                contato@jfmaia.site
                            </a>
                        </div>

                        <div className="flex flex-col items-center p-6 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 transition-colors">
                            <Github className="w-8 h-8 mb-4 text-primary" />
                            <h3 className="font-semibold mb-2">{t('contactGithub')}</h3>
                            <a href="https://github.com/jfnandopr/sql-charm-curator/issues" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                View Issues
                            </a>
                        </div>

                        <div className="flex flex-col items-center p-6 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 transition-colors">
                            <Twitter className="w-8 h-8 mb-4 text-primary" />
                            <h3 className="font-semibold mb-2">{t('contactTwitter')}</h3>
                            <a href="https://twitter.com/jfnandopr" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                @jfnandopr
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
