
import { Database, Github, ExternalLink, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="relative z-10 mt-12 pt-8 border-t border-border/50 text-muted-foreground bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Coluna 1: Sobre */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <Database className="w-6 h-6 text-primary" />
                            <span className="font-bold text-foreground">Pretty Format</span>
                        </Link>
                        <p className="text-sm">
                            {t('footerDesc')}
                        </p>
                    </div>

                    {/* Coluna 2: Resources */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-foreground">{t('databaseDocs')}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="https://www.postgresql.org/docs/" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    {t('postgresqlDocs')}
                                </a>
                            </li>
                            <li>
                                <a href="https://dev.mysql.com/doc/" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    {t('mysqlDocs')}
                                </a>
                            </li>
                            <li>
                                <a href="https://www.json.org/" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    {t('jsonDocs')}
                                </a>
                            </li>
                            <li>
                                <a href="https://www.w3.org/XML/" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    {t('xmlDocs')}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Coluna 3: Links Úteis */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-foreground">{t('usefulLinks')}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="https://github.com/PuraIA/sql-charm-curator" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-2">
                                    <Github className="w-4 h-4" />
                                    {t('sourceCode')}
                                </a>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-primary flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    {t('about')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="hover:text-primary flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    {t('terms')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-primary flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    {t('contact')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="hover:text-primary flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    {t('privacy')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="text-center text-xs pb-8 border-t border-border/30 pt-8">
                    <p>© {new Date().getFullYear()} Pretty Format. {t('madeWith')}</p>
                </div>
            </div>
        </footer>
    );
};
