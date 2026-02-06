
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Database, Globe, ExternalLink, Github, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ModeToggle } from './ModeToggle';
import { useTranslation } from 'react-i18next';
import { AdPlaceholder } from './AdPlaceholder';
import { ScrollToTop } from './ScrollToTop';

interface ToolLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    toolContent: ReactNode; // The text content (FAQ, Guide, Info)
}

export const ToolLayout = ({ children, title, subtitle, toolContent }: ToolLayoutProps) => {
    const { t, i18n } = useTranslation();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Background gradient effect */}
            <div className="fixed inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl flex-grow">
                {/* Header */}
                <header className="text-center mb-10 animate-fade-in will-change-opacity">
                    <div className="flex justify-end mb-4 gap-2">
                        <ModeToggle />
                        <div className="flex items-center gap-2 bg-secondary/50 px-3 h-10 rounded-lg border border-border/50">
                            <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                            <Select
                                value={i18n.language?.split('-')[0]}
                                onValueChange={(value) => i18n.changeLanguage(value)}
                            >
                                <SelectTrigger
                                    aria-label={t('selectLanguage', 'Select Language')}
                                    className="h-full w-[140px] border-none bg-transparent focus:ring-0 shadow-none text-xs p-0"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English (US)</SelectItem>
                                    <SelectItem value="pt">Português (BR)</SelectItem>
                                    <SelectItem value="de">Deutsch</SelectItem>
                                    <SelectItem value="fr">Français</SelectItem>
                                    <SelectItem value="zh">中文</SelectItem>
                                    <SelectItem value="ja">日本語</SelectItem>
                                    <SelectItem value="es">Español</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-3 mb-4">
                        <Database className="w-10 h-10 text-primary" />
                        <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                            {title}
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                        {subtitle}
                    </p>
                </header>

                <main id="main-content">
                    {/* Tool Area */}
                    {children}

                    {/* Ad between Tool and Content */}
                    <AdPlaceholder slotId="tool-bottom" />

                    {/* Content Area (Guide, FAQ, Context) */}
                    <div className="mt-16">
                        {toolContent}
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="relative z-10 mt-12 pt-8 border-t border-border/50 text-muted-foreground bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* Coluna 1: Sobre */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Database className="w-6 h-6 text-primary" />
                                <span className="font-bold text-foreground">Pretty Format</span>
                            </div>
                            <p className="text-sm">
                                {t('seoDescription')}
                            </p>
                        </div>

                        {/* Coluna 2: Resources - Can be customized via props usually, but keeping static for now */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-foreground">{t('databaseDocs')}</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="https://www.postgresql.org/docs/" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        {t('postgresqlDocs')}
                                    </a>
                                </li>
                                {/* ... other docs ... */}
                            </ul>
                        </div>

                        {/* Coluna 3: Links Úteis */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-foreground">Links</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="https://github.com/jfnandopr/sql-charm-curator" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-2">
                                        <Github className="w-4 h-4" />
                                        {t('sourceCode')}
                                    </a>
                                </li>
                                <li>
                                    <Link to="/about" className="hover:text-primary flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        About
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

                    <div className="text-center text-xs pb-8">
                        <p>© {new Date().getFullYear()} Pretty Format. Made with ❤️ for developers.</p>
                    </div>
                </div>
            </footer >
            <ScrollToTop />
        </div>
    );
};
