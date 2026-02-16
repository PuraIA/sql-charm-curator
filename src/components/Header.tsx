
import { Database, Globe, Braces, Code2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ModeToggle } from './ModeToggle';
import { useTranslation } from 'react-i18next';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export const Header = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();

    return (
        <header className="relative z-10 container mx-auto px-4 py-6 max-w-7xl animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                {/* Brand and Nav */}
                <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Database className="w-6 h-6 text-primary" />
                        <span className="font-bold text-xl tracking-tight">Pretty Format</span>
                    </Link>

                    <nav className="flex gap-2 flex-wrap justify-center">
                        <Link
                            to="/sql"
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${location.pathname === '/sql' || (location.pathname === '/' && false)
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-secondary/50 border-border/50 hover:bg-secondary hover:border-border'
                                }`}
                        >
                            <span className="text-sm font-medium">SQL</span>
                        </Link>
                        <Link
                            to="/json"
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${location.pathname === '/json'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-secondary/50 border-border/50 hover:bg-secondary hover:border-border'
                                }`}
                        >
                            <span className="text-sm font-medium">JSON</span>
                        </Link>
                        <Link
                            to="/xml"
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${location.pathname === '/xml'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-secondary/50 border-border/50 hover:bg-secondary hover:border-border'
                                }`}
                        >
                            <span className="text-sm font-medium">XML</span>
                        </Link>
                    </nav>
                </div>

                {/* Theme and Language Toggles - Right Side */}
                <div className="flex gap-2">
                    <ModeToggle />
                    <div className="flex items-center gap-2 bg-secondary/50 px-3 h-10 rounded-lg border border-border/50">
                        <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Select
                            value={i18n.language?.split('-')[0]}
                            onValueChange={(value) => i18n.changeLanguage(value)}
                        >
                            <SelectTrigger
                                aria-label={t('selectLanguage', 'Select Language')}
                                className="h-full w-[100px] md:w-[140px] border-none bg-transparent focus:ring-0 shadow-none text-xs p-0"
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
            </div>
        </header>
    );
};
