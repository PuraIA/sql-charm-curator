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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Copy,
    Check,
    Trash2,
    FileCode,
    FileCheck,
    Settings2,
    Braces,
    ChevronRight,
    ChevronDown,
    Table as TableIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { useTheme } from './theme-provider';
import { ToolLayout } from './ToolLayout';
import { AdPlaceholder } from './AdPlaceholder';
import { SEO } from './SEO';

// Lazy load components
const LazySyntaxHighlighter = lazy(() => import('./LazySyntaxHighlighter').then(module => ({ default: module.LazySyntaxHighlighter })));

type FormatStyle = 'pretty' | 'compact' | 'sorted' | 'minified' | 'table' | 'tree';
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
    table: 'Tabela',
    tree: 'Árvore Interativa',
};

export const formatStyleIcons: Record<FormatStyle, string> = {
    pretty: '📄',
    compact: '📋',
    sorted: '🔤',
    minified: '🗜️',
    table: '📊',
    tree: '🌲',
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

function JSONTableView({ data }: { data: any }) {
    if (!data) return null;

    if (Array.isArray(data)) {
        if (data.length === 0) return <div className="p-4 text-muted-foreground italic">Array vazio</div>;

        const firstItem = data[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
            const headers = Array.from(new Set(data.flatMap(item => Object.keys(item))));
            return (
                <div className="overflow-auto max-h-[450px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 bg-muted/50 sticky top-0 z-10">#</TableHead>
                                {headers.map(header => (
                                    <TableHead key={header} className="bg-muted/50 sticky top-0 z-10">{header}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                                    {headers.map(header => (
                                        <TableCell key={header}>
                                            {typeof row[header] === 'object' && row[header] !== null ? (
                                                <span className="text-xs text-muted-foreground italic font-mono">
                                                    {Array.isArray(row[header]) ? '[...]' : '{...}'}
                                                </span>
                                            ) : (
                                                String(row[header] ?? '')
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            );
        } else {
            return (
                <div className="overflow-auto max-h-[450px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 bg-muted/50 sticky top-0 z-10">#</TableHead>
                                <TableHead className="bg-muted/50 sticky top-0 z-10">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                                    <TableCell>{String(item)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            );
        }
    } else if (typeof data === 'object' && data !== null) {
        const entries = Object.entries(data);
        return (
            <div className="overflow-auto max-h-[450px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="bg-muted/50 sticky top-0 z-10">Chave</TableHead>
                            <TableHead className="bg-muted/50 sticky top-0 z-10">Valor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.map(([key, value]) => (
                            <TableRow key={key}>
                                <TableCell className="font-medium">{key}</TableCell>
                                <TableCell>
                                    {typeof value === 'object' && value !== null ? (
                                        <span className="text-xs text-muted-foreground italic font-mono">
                                            {Array.isArray(value) ? '[...]' : '{...}'}
                                        </span>
                                    ) : (
                                        String(value ?? '')
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    return <div className="p-4 text-muted-foreground italic">Dado primitivo: {String(data)}</div>;
}

function JSONTreeNode({ label, value, depth = 0 }: { label?: string; value: any; depth?: number }) {
    const [isExpanded, setIsExpanded] = useState(depth < 2);

    const isObject = value !== null && typeof value === 'object';
    const isEmpty = isObject && (Array.isArray(value) ? value.length === 0 : Object.keys(value).length === 0);

    const toggle = (e: React.MouseEvent) => {
        if (isObject && !isEmpty) {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
        }
    };

    const renderValue = () => {
        if (value === null) return <span className="text-gray-500 italic">null</span>;
        if (typeof value === 'string') return <span className="text-green-600 dark:text-green-400">"{value}"</span>;
        if (typeof value === 'number') return <span className="text-amber-600 dark:text-amber-400">{value}</span>;
        if (typeof value === 'boolean') return <span className="text-blue-600 dark:text-blue-400">{value.toString()}</span>;

        if (Array.isArray(value)) {
            if (isEmpty) return <span className="text-muted-foreground">[]</span>;
            return <span className="text-muted-foreground">{`Array [${value.length}]`}</span>;
        }

        if (typeof value === 'object') {
            if (isEmpty) return <span className="text-muted-foreground">{"{}"}</span>;
            return <span className="text-muted-foreground">{`Object {${Object.keys(value).length}}`}</span>;
        }

        return String(value);
    };

    return (
        <div className="select-none py-0.5">
            <div
                className={`flex items-start gap-1 p-1 rounded-md transition-colors ${isObject && !isEmpty ? 'cursor-pointer hover:bg-secondary/50' : ''}`}
                onClick={toggle}
                style={{ paddingLeft: `${depth === 0 ? 0.25 : 0.5}rem` }}
            >
                {isObject && !isEmpty ? (
                    <span className="mt-1">
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </span>
                ) : (
                    <span className="w-3 h-3" />
                )}

                <div className="flex flex-wrap items-baseline gap-2 font-mono text-sm">
                    {label && <span className="font-semibold text-primary/80">{label}:</span>}
                    {renderValue()}
                </div>
            </div>

            {isExpanded && isObject && !isEmpty && (
                <div className="ml-4 border-l border-border/50 pl-2">
                    {Array.isArray(value) ? (
                        value.map((item, i) => (
                            <JSONTreeNode key={i} label={i.toString()} value={item} depth={depth + 1} />
                        ))
                    ) : (
                        Object.entries(value).map(([key, val]) => (
                            <JSONTreeNode key={key} label={key} value={val} depth={depth + 1} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function JSONTreeView({ data }: { data: any }) {
    if (data === null || data === undefined) return <div className="p-4 text-muted-foreground italic">Nenhum dado</div>;

    return (
        <div className="p-4 overflow-auto max-h-[450px] bg-secondary/10 rounded-lg">
            <JSONTreeNode value={data} />
        </div>
    );
}

export function JSONFormatter() {
    const { t } = useTranslation();
    const [inputJSON, setInputJSON] = useState('');
    const [outputJSON, setOutputJSON] = useState('');
    const [parsedData, setParsedData] = useState<any>(null);
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
            setParsedData(parsed);

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
                case 'pretty':
                case 'table':
                case 'tree':
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
                    <SEO title={t('jsonSeoTitle')} description={t('jsonSeoDescription')} />
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
                                options.formatStyle === 'table' ? (
                                    <JSONTableView data={parsedData} />
                                ) : options.formatStyle === 'tree' ? (
                                    <JSONTreeView data={parsedData} />
                                ) : (
                                    <Suspense fallback={
                                        <div className="p-6 font-mono text-sm bg-secondary/50 rounded-lg border border-border/50 min-h-[450px] flex items-center justify-center animate-pulse">
                                            <div className="text-muted-foreground">{t('formatting', 'Formatando...')}</div>
                                        </div>
                                    }>
                                        <LazySyntaxHighlighter code={outputJSON} theme={theme === 'dark' ? 'dark' : 'light'} language="json" />
                                    </Suspense>
                                )
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
