import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Copy, Check, Trash2, FileCode, FileCheck, Settings2, Braces } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { useTheme } from './theme-provider';
import { ToolLayout } from './ToolLayout';
import { AdPlaceholder } from './AdPlaceholder';

// Lazy load components
const LazySyntaxHighlighter = lazy(() => import('./LazySyntaxHighlighter').then(module => ({ default: module.LazySyntaxHighlighter })));

type FormatStyle = 'pretty' | 'compact' | 'sorted' | 'minified';
type IndentSize = 2 | 4 | 8;

export interface JSONFormatterOptions {
    formatStyle: FormatStyle;
    indentSize: IndentSize;
    sortKeys: boolean;
    removeWhitespace: boolean;
    escapeUnicode: boolean;
}

export const formatStyleLabels: Record<FormatStyle, string> = {
    pretty: 'Pretty (Expandido)',
    compact: 'Compacto',
    sorted: 'Ordenado',
    minified: 'Minificado',
};

export const formatStyleIcons: Record<FormatStyle, string> = {
    pretty: '📄',
    compact: '📋',
    sorted: '🔤',
    minified: '🗜️',
};

const sampleJSON = {
    "user": {
        "id": 12345,
        "name": "João Silva",
        "email": "joao@example.com",
        "active": true,
        "roles": ["admin", "developer"],
        "metadata": {
            "created_at": "2024-01-15T10:30:00Z",
            "last_login": "2024-02-16T15:45:30Z",
            "preferences": {
                "theme": "dark",
                "notifications": true,
                "language": "pt-BR"
            }
        }
    },
    "orders": [
        { "id": 1, "total": 299.99, "status": "completed" },
        { "id": 2, "total": 149.50, "status": "pending" },
        { "id": 3, "total": 599.00, "status": "shipped" }
    ]
};

export function JSONFormatter() {
    const { t } = useTranslation();
    const [inputJSON, setInputJSON] = useState('');
    const [outputJSON, setOutputJSON] = useState('');
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('original');
    const [isValid, setIsValid] = useState(true);
    const { theme } = useTheme();

    const [options, setOptions] = useState<JSONFormatterOptions>({
        formatStyle: 'pretty',
        indentSize: 2,
        sortKeys: false,
        removeWhitespace: false,
        escapeUnicode: false,
    });

    useEffect(() => {
        document.title = t('jsonSeoTitle', 'JSON Formatter Online - Beautify and Validate JSON');
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', t('jsonSeoDescription', 'Free online JSON formatter and validator. Beautify, minify, sort and validate your JSON data instantly.'));
        }
    }, [t]);

    const sortObjectKeys = (obj: any): any => {
        if (Array.isArray(obj)) {
            return obj.map(sortObjectKeys);
        } else if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj)
                .sort()
                .reduce((sorted: any, key) => {
                    sorted[key] = sortObjectKeys(obj[key]);
                    return sorted;
                }, {});
        }
        return obj;
    };

    const formatJSON = useCallback(() => {
        if (!inputJSON.trim()) {
            setOutputJSON('');
            setIsValid(true);
            return;
        }

        try {
            let parsed = JSON.parse(inputJSON);
            setIsValid(true);

            // Apply sorting if enabled or if format style is 'sorted'
            if (options.sortKeys || options.formatStyle === 'sorted') {
                parsed = sortObjectKeys(parsed);
            }

            let formatted: string;

            switch (options.formatStyle) {
                case 'minified':
                    formatted = JSON.stringify(parsed);
                    break;
                case 'compact':
                    // Compact format with minimal spacing
                    formatted = JSON.stringify(parsed, null, 1);
                    break;
                case 'sorted':
                    // Pretty format with sorted keys
                    formatted = JSON.stringify(parsed, null, options.indentSize);
                    break;
                case 'pretty':
                default:
                    formatted = JSON.stringify(parsed, null, options.indentSize);
                    break;
            }

            // Apply unicode escaping if enabled
            if (options.escapeUnicode) {
                formatted = formatted.replace(/[\u007F-\uFFFF]/g, (char) => {
                    return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            setOutputJSON(formatted);
            toast.success(t('jsonToastSuccess', 'JSON formatado com sucesso!'));
        } catch (error) {
            setIsValid(false);
            setOutputJSON('');
            if (error instanceof Error) {
                toast.error(t('jsonToastError', 'JSON inválido') + ': ' + error.message);
            }
        }
    }, [inputJSON, options, t]);

    // Auto-format when switching to formatted tab or when options change while on formatted tab
    useEffect(() => {
        if (activeTab === 'formatted' && inputJSON.trim()) {
            formatJSON();
        }
    }, [activeTab, options, formatJSON, inputJSON]);

    const copyToClipboard = useCallback(async () => {
        if (!outputJSON) return;

        try {
            await navigator.clipboard.writeText(outputJSON);
            setCopied(true);
            toast.success(t('toastCopied', 'Copiado para a área de transferência!'));
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Erro ao copiar');
        }
    }, [outputJSON, t]);

    const clearAll = useCallback(() => {
        setInputJSON('');
        setOutputJSON('');
        setIsValid(true);
    }, []);

    const loadSample = useCallback(() => {
        setInputJSON(JSON.stringify(sampleJSON, null, 2));
        setOutputJSON('');
        setIsValid(true);
    }, []);

    return (
        <ToolLayout
            title={t('jsonTitle', 'JSON Formatter')}
            subtitle={t('jsonSubtitle', 'Formate, valide e organize seus dados JSON de forma elegante.')}
            toolContent={
                <div className="space-y-16">
                    <AdPlaceholder slotId="content-top" className="my-8" />

                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Braces className="w-6 h-6 text-primary" />
                            {t('jsonWhatIs', 'O que é JSON?')}
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            {t('jsonWhatIsDesc', 'JSON (JavaScript Object Notation) é um formato leve de troca de dados. É fácil para humanos lerem e escreverem, e fácil para máquinas parsearem e gerarem.')}
                        </p>
                    </div>

                    <AdPlaceholder slotId="content-bottom" className="my-8" />
                </div>
            }
        >
            <div className="flex flex-wrap justify-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {/* Format Style selector */}
                <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-lg border border-border/50">
                    <Select
                        value={options.formatStyle}
                        onValueChange={(value: FormatStyle) => setOptions(prev => ({ ...prev, formatStyle: value }))}
                    >
                        <SelectTrigger
                            aria-label={t('jsonFormatStyle', 'Estilo de Formatação')}
                            className="h-9 w-[180px] border-none bg-transparent focus:ring-0 shadow-none"
                        >
                            <SelectValue placeholder={t('jsonFormatStyle', 'Estilo de Formatação')} />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(formatStyleLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                    <span className="flex items-center gap-2">
                                        <span>{formatStyleIcons[key as FormatStyle]}</span>
                                        <span>{label}</span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Indent Size selector */}
                {options.formatStyle !== 'minified' && (
                    <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-lg border border-border/50">
                        <Select
                            value={options.indentSize.toString()}
                            onValueChange={(value) => setOptions(prev => ({ ...prev, indentSize: parseInt(value) as IndentSize }))}
                        >
                            <SelectTrigger
                                aria-label={t('jsonIndentSize', 'Tamanho da Indentação')}
                                className="h-9 w-[140px] border-none bg-transparent focus:ring-0 shadow-none"
                            >
                                <SelectValue placeholder={t('jsonIndentSize', 'Indentação')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2">2 espaços</SelectItem>
                                <SelectItem value="4">4 espaços</SelectItem>
                                <SelectItem value="8">8 espaços</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Sort keys switch */}
                {options.formatStyle !== 'sorted' && (
                    <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50 h-[50px]">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="sort-keys" className="text-sm cursor-pointer whitespace-nowrap">
                                {t('jsonSortKeys', 'Ordenar Chaves')}
                            </Label>
                            <Switch
                                id="sort-keys"
                                checked={options.sortKeys}
                                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, sortKeys: checked }))}
                            />
                        </div>
                    </div>
                )}

                {/* Escape Unicode switch */}
                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50 h-[50px]">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="escape-unicode" className="text-sm cursor-pointer whitespace-nowrap">
                            {t('jsonEscapeUnicode', 'Escapar Unicode')}
                        </Label>
                        <Switch
                            id="escape-unicode"
                            checked={options.escapeUnicode}
                            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, escapeUnicode: checked }))}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-2 mb-8">
                <Button
                    variant="outline"
                    onClick={loadSample}
                    className="gap-2 border-primary/20 hover:bg-primary/10"
                >
                    <Braces className="w-4 h-4" />
                    {t('loadExample', 'Carregar Exemplo')}
                </Button>
                <Button
                    variant="outline"
                    onClick={clearAll}
                    className="gap-2 border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                >
                    <Trash2 className="w-4 h-4" />
                    {t('clear', 'Limpar')}
                </Button>
            </div>

            {/* Main Formatter area */}
            <div className="glass-card p-5 animate-slide-up transition-opacity duration-300 opacity-100 mb-12" style={{ animationDelay: '0.1s' }}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="original" className="flex items-center gap-2">
                            <FileCode className="w-4 h-4" />
                            <h2 className="text-sm font-medium">{t('jsonOriginal', 'JSON Original')}</h2>
                        </TabsTrigger>
                        <TabsTrigger value="formatted" className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4" />
                            <h2 className="text-sm font-medium">{t('jsonFormatted', 'JSON Formatado')}</h2>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="original" className="mt-0">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-muted-foreground">
                                {inputJSON.length} {t('characters', 'caracteres')}
                                {!isValid && (
                                    <span className="ml-2 text-destructive font-medium">
                                        ⚠️ {t('jsonInvalid', 'JSON inválido')}
                                    </span>
                                )}
                                {isValid && inputJSON.trim() && (
                                    <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                                        ✓ {t('jsonValid', 'JSON válido')}
                                    </span>
                                )}
                            </span>
                        </div>
                        <Textarea
                            value={inputJSON}
                            onChange={(e) => setInputJSON(e.target.value)}
                            placeholder={t('jsonPastePlaceholder', 'Cole seu JSON aqui...')}
                            className={`min-h-[450px] font-mono text-sm bg-secondary/50 border-border resize-none scrollbar-thin focus:ring-2 focus:ring-primary/50 ${!isValid ? 'border-destructive focus:ring-destructive/50' : ''
                                }`}
                            aria-label={t('jsonOriginal', 'JSON Original')}
                        />
                    </TabsContent>

                    <TabsContent value="formatted" className="mt-0">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-muted-foreground">
                                {outputJSON.length} {t('characters', 'caracteres')}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyToClipboard}
                                disabled={!outputJSON}
                                className="hover:bg-primary/20 hover:text-primary disabled:opacity-50"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 mr-1 text-success" />
                                ) : (
                                    <Copy className="w-4 h-4 mr-1" />
                                )}
                                {copied ? t('copied', 'Copiado!') : t('copy', 'Copiar')}
                            </Button>
                        </div>

                        {/* Formatted Output */}
                        <div className="min-h-[450px] code-editor overflow-hidden rounded-md border border-input bg-muted/30">
                            {outputJSON ? (
                                <Suspense fallback={
                                    <div className="p-6 font-mono text-sm bg-secondary/50 rounded-lg border border-border/50 min-h-[450px] flex items-center justify-center animate-pulse">
                                        <div className="text-muted-foreground">{t('formatting', 'Formatando...')}</div>
                                    </div>
                                }>
                                    <LazySyntaxHighlighter code={outputJSON} theme={theme === 'dark' ? 'dark' : 'light'} language="json" />
                                </Suspense>
                            ) : (
                                <div className="p-6 text-muted-foreground italic min-h-[450px]">
                                    {inputJSON.trim() ? t('formatting', 'Formatando...') : t('jsonEmptyPlaceholder', 'Insira um JSON na aba "JSON Original"')}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </ToolLayout>
    );
}
