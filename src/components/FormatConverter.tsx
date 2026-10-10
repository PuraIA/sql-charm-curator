import { useState, useMemo, useCallback, lazy, Suspense, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Copy, Check, Trash2, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useTheme } from './theme-provider';
import { ToolLayout } from './ToolLayout';
import { AdPlaceholder } from './AdPlaceholder';
import { PlainCode } from './PlainCode';
import { DownloadButton, OpenFileButton, ShareButton } from './ToolIOButtons';
import { useShareLink } from '@/hooks/use-share-link';
import { useFileDrop } from '@/hooks/use-file-drop';
import { convert, DATA_FORMAT_LABELS, type DataFormat } from '@/utils/format-convert';
import { SAMPLE_CONFIG_JSON, SAMPLE_CONFIG_XML, SAMPLE_CONFIG_YAML } from '@/content/converter-samples';
// Genuinely deferrable: only reachable once there's a result to display.
const LazySyntaxHighlighter = lazy(() => import('./LazySyntaxHighlighter').then(module => ({ default: module.LazySyntaxHighlighter })));

const FORMATS: DataFormat[] = ['json', 'xml', 'yaml'];

const FILE_TYPES: Record<DataFormat, { accept: string; ext: string; mime: string }> = {
    json: { accept: '.json,.txt,application/json,text/plain', ext: 'json', mime: 'application/json' },
    xml: { accept: '.xml,.txt,application/xml,text/xml,text/plain', ext: 'xml', mime: 'application/xml' },
    yaml: { accept: '.yaml,.yml,.txt,text/plain', ext: 'yaml', mime: 'application/yaml' },
};

/** What a share link carries for this tool. */
interface ConverterShareState {
    from: DataFormat;
    to: DataFormat;
    input: string;
}

const SAMPLES: Record<DataFormat, string> = {
    json: SAMPLE_CONFIG_JSON,
    xml: SAMPLE_CONFIG_XML,
    yaml: SAMPLE_CONFIG_YAML,
};

export interface FormatConverterProps {
    initialFromFormat?: DataFormat;
    initialToFormat?: DataFormat;
    /** Text loaded into the source editor on first render. */
    initialInput?: string;
    title?: string;
    subtitle?: string;
    content?: ReactNode;
}

export function FormatConverter({
    initialFromFormat = 'json',
    initialToFormat = 'xml',
    initialInput = '',
    title,
    subtitle,
    content,
}: FormatConverterProps = {}) {
    const [fromFormat, setFromFormat] = useState<DataFormat>(initialFromFormat);
    const [toFormat, setToFormat] = useState<DataFormat>(initialToFormat);
    const [input, setInput] = useState(initialInput);
    const [copied, setCopied] = useState(false);
    const { theme } = useTheme();
    const { t } = useTranslation();

    // convert() is pure and synchronous, so this is correct on the very first render —
    // both in the browser and during the build-time prerender — with no separate
    // precomputed prop that could drift from what the function actually does.
    const result = useMemo(() => convert(input, fromFormat, toFormat), [input, fromFormat, toFormat]);

    // Converting a format to itself is a valid, supported combination (JSON.parse then
    // JSON.stringify re-indents; XML through the parser then back out re-serializes) —
    // not something to prevent, so both selectors are plain, independent setters.
    const swap = useCallback(() => {
        setFromFormat(toFormat);
        setToFormat(fromFormat);
        if (result.output) setInput(result.output);
    }, [fromFormat, toFormat, result.output]);

    const loadSample = useCallback(() => {
        setInput(SAMPLES[fromFormat]);
    }, [fromFormat]);

    const clearAll = useCallback(() => {
        setInput('');
    }, []);

    const share = useShareLink<ConverterShareState>('convert', state => {
        if (FORMATS.includes(state.from)) setFromFormat(state.from);
        if (FORMATS.includes(state.to)) setToFormat(state.to);
        setInput(state.input ?? '');
    });

    const { isDragging, dropProps } = useFileDrop(setInput);

    const copyToClipboard = useCallback(async () => {
        if (!result.output) return;
        try {
            await navigator.clipboard.writeText(result.output);
            setCopied(true);
            toast.success(t('toastCopied'));
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(t('toastCopyError'));
        }
    }, [result.output, t]);

    const fromLabel = DATA_FORMAT_LABELS[fromFormat];
    const toLabel = DATA_FORMAT_LABELS[toFormat];

    return (
        <ToolLayout
            title={title ?? 'JSON, XML & YAML Converter'}
            subtitle={subtitle ?? 'Convert between JSON, XML and YAML. Runs entirely in your browser.'}
            toolContent={content ?? DEFAULT_CONTENT}
        >
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6 animate-fade-in">
                <FormatSelect value={fromFormat} onChange={setFromFormat} label={t('converterFrom')} />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={swap}
                    className="border-primary/20 hover:bg-primary/10 shrink-0"
                    aria-label={t('converterSwap')}
                    title={t('converterSwap')}
                >
                    <ArrowLeftRight className="w-4 h-4" />
                </Button>
                <FormatSelect value={toFormat} onChange={setToFormat} label={t('converterTo')} />
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
                <Button variant="outline" onClick={loadSample} className="gap-2 border-primary/20 hover:bg-primary/10">
                    {t('loadExample')}
                </Button>
                <Button
                    variant="outline"
                    onClick={clearAll}
                    className="gap-2 border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                >
                    <Trash2 className="w-4 h-4" />
                    {t('clear')}
                </Button>
                <OpenFileButton accept={FILE_TYPES[fromFormat].accept} onText={setInput} />
                <ShareButton onShare={() => share({ from: fromFormat, to: toFormat, input })} disabled={!input.trim()} />
            </div>

            <div className="glass-card p-5 animate-slide-up mb-12">
                <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">{t('converterInputLabel', { format: fromLabel })}</span>
                            <span className="text-xs text-muted-foreground">{input.length} {t('characters')}</span>
                        </div>
                        <Textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            {...dropProps}
                            placeholder={t('converterPastePlaceholder', { format: fromLabel })}
                            className={`min-h-[420px] font-mono text-sm bg-secondary/50 border-border resize-none scrollbar-thin focus:ring-2 focus:ring-primary/50 ${isDragging ? 'ring-2 ring-primary' : ''}`}
                            aria-label={t('converterInputLabel', { format: fromLabel })}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">{t('converterResultLabel', { format: toLabel })}</span>
                            <div className="flex items-center gap-1">
                                <DownloadButton
                                    filename={`converted.${FILE_TYPES[toFormat].ext}`}
                                    text={result.output ?? ''}
                                    mimeType={FILE_TYPES[toFormat].mime}
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    disabled={!result.output}
                                    className="hover:bg-primary/20 hover:text-primary disabled:opacity-50"
                                >
                                    {copied ? <Check className="w-4 h-4 mr-1 text-success" /> : <Copy className="w-4 h-4 mr-1" />}
                                    {copied ? t('copied') : t('copy')}
                                </Button>
                            </div>
                        </div>

                        <div className="min-h-[420px] code-editor overflow-hidden rounded-md border border-input bg-muted/30">
                            {result.error ? (
                                <div className="p-6 min-h-[420px] flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                                    <p className="text-sm text-destructive">{result.error}</p>
                                </div>
                            ) : result.output ? (
                                <Suspense fallback={<PlainCode code={result.output} />}>
                                    <LazySyntaxHighlighter
                                        code={result.output}
                                        theme={theme === 'dark' ? 'dark' : 'light'}
                                        language={toFormat}
                                    />
                                </Suspense>
                            ) : (
                                <div className="p-6 text-muted-foreground italic min-h-[420px]">
                                    {t('converterEmpty', { format: fromLabel })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}

const DEFAULT_CONTENT = (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold">How the JSON &harr; XML mapping works</h2>
        <p>
            JSON and XML don't share a data model — XML has attributes and mixed content,
            JSON has none — so this converter picks an explicit convention: an XML attribute
            becomes a JSON key prefixed with <code>@</code>, text content becomes{' '}
            <code>#text</code>, and sibling elements sharing a tag name become a JSON array.
            YAML, on the other hand, is the same data model as JSON with different syntax, so
            that direction has no such convention to make up.
        </p>
    </div>
);

function FormatSelect({ value, onChange, label }: { value: DataFormat; onChange: (f: DataFormat) => void; label: string }) {
    return (
        <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-lg border border-border/50">
            <span className="text-xs text-muted-foreground pl-2">{label}</span>
            <Select value={value} onValueChange={v => onChange(v as DataFormat)}>
                <SelectTrigger aria-label={`${label} format`} className="h-9 w-[110px] border-none bg-transparent focus:ring-0 shadow-none">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {FORMATS.map(format => (
                        <SelectItem key={format} value={format}>{DATA_FORMAT_LABELS[format]}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
