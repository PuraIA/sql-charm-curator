import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Github, Twitter } from 'lucide-react';

import { SEO } from '@/components/SEO';

const Contact = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <SEO
                title={`${t('contactTitle')} - SQL Formatter`}
                description={t('contactSubtitle')}
                keywords={t('contactKeywords')}
            />
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="flex flex-col items-center p-6 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 transition-colors">
                            <Mail className="w-8 h-8 mb-4 text-primary" />
                            <h3 className="font-semibold mb-2">{t('contactEmail')}</h3>
                            <a href="mailto:contato@pura.ia.br" className="text-sm text-primary hover:underline">
                                contato@pura.ia.br
                            </a>
                        </div>

                        <div className="flex flex-col items-center p-6 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 transition-colors">
                            <Github className="w-8 h-8 mb-4 text-primary" />
                            <h3 className="font-semibold mb-2">{t('contactGithub')}</h3>
                            <a href="https://github.com/PuraIA/sql-charm-curator/issues" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                View Issues
                            </a>
                        </div>

                        <div className="flex flex-col items-center p-6 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 transition-colors">
                            <Twitter className="w-8 h-8 mb-4 text-primary" />
                            <h3 className="font-semibold mb-2">{t('contactTwitter')}</h3>
                            <a href="https://twitter.com/PuraIA" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                @PuraIA
                            </a>
                        </div>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none text-left border-t border-border/50 pt-8">
                        <h3>Frequently Asked Contact Questions</h3>
                        <p>
                            We value every piece of feedback we receive. Whether you have found a bug in one of our formatting engines, have a suggestion for a new feature, or want to discuss a potential partnership, we are here to listen.
                        </p>
                        <p>
                            <strong>For Bug Reports:</strong> Please use our GitHub Issues page. When reporting a bug, try to include the input code that caused the issue and the expected output. This helps our engineering team reproduce and fix the problem much faster.
                        </p>
                        <p>
                            <strong>For Feature Requests:</strong> We are always looking to expand our support for more languages and dialects. If you need a specific formatter that we don't currently offer, let us know!
                        </p>
                        <p>
                            <strong>Press and Media:</strong> For media inquiries or requests to feature Pretty Format in your publication, please contact us via email. We are happy to provide high-resolution assets and background information about our mission and technology.
                        </p>
                        <p className="text-sm text-muted-foreground italic">
                            Response time: We typically respond to email inquiries within 48 business hours. For faster technical support, GitHub is usually the best place to reach us.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
