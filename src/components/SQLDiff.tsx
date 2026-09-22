import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Copy, Check, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { ToolLayout } from './ToolLayout';
import { AdPlaceholder } from './AdPlaceholder';
import { dialectLabels, dialectIcons, type Dialect } from './SQLFormatter';
import { formatSqlWithFallback, type SqlFormatOptions } from '@/utils/sql-utils';
import { diffLines, type DiffOp } from '@/utils/line-diff';

const FORMAT_OPTIONS: Omit<SqlFormatOptions, 'dialect'> = {
    keywordCase: 'upper',
    dataTypeCase: 'upper',
    functionCase: 'upper',
    identifierCase: 'preserve',
    indentStyle: 'standard',
    logicalOperatorNewline: 'before',
    tabWidth: 2,
    useTabs: false,
    expressionWidth: 120,
    linesBetweenQueries: 2,
    denseOperators: false,
    newlineBeforeSemicolon: false,
};

export interface SQLDiffProps {
    initialDialect?: Dialect;
    initialBefore?: string;
    initialAfter?: string;
    /** Precomputed sql-formatter output for initialBefore/initialAfter, for the prerendered HTML. */
    initialFormattedBefore?: string;
    initialFormattedAfter?: string;
    title?: string;
    subtitle?: string;
    content?: ReactNode;
}

export function SQLDiff({
    initialDialect = 'postgresql',
    initialBefore = '',
    initialAfter = '',
    initialFormattedBefore = '',
    initialFormattedAfter = '',
    title,
    subtitle,
    content,
}: SQLDiffProps = {}) {
    const [dialect, setDialect] = useState<Dialect>(initialDialect);
    const [beforeSql, setBeforeSql] = useState(initialBefore);
    const [afterSql, setAfterSql] = useState(initialAfter);
    const [formattedBefore, setFormattedBefore] = useState(initialFormattedBefore);
    const [formattedAfter, setFormattedAfter] = useState(initialFormattedAfter);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Formatting itself is async (sql-formatter is dynamically imported), so it can
    // only run client-side, in this effect — the same reason SQLFormatter.tsx re-runs
    // its own formatting from a useEffect rather than a lazy useState initializer.
    useEffect(() => {
        let cancelled = false;
        if (!beforeSql.trim() && !afterSql.trim()) {
            setFormattedBefore('');
            setFormattedAfter('');
            setError(null);
            return;
        }
        (async () => {
            try {
                const options: SqlFormatOptions = { dialect, ...FORMAT_OPTIONS };
                const [before, after] = await Promise.all([
                    beforeSql.trim() ? formatSqlWithFallback(beforeSql, options) : Promise.resolve({ formatted: '' }),
                    afterSql.trim() ? formatSqlWithFallback(afterSql, options) : Promise.resolve({ formatted: '' }),
                ]);
                if (cancelled) return;
                setFormattedBefore(before.formatted);
                setFormattedAfter(after.formatted);
                setError(null);
            } catch (err) {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : String(err));
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [beforeSql, afterSql, dialect]);

    // Pure and synchronous: correct on the very first render (including during the
    // build-time prerender) from whatever formattedBefore/formattedAfter already hold.
    const diff = useMemo<DiffOp[]>(
        () => diffLines(formattedBefore ? formattedBefore.split('\n') : [], formattedAfter ? formattedAfter.split('\n') : []),
        [formattedBefore, formattedAfter]
    );

    const added = diff.filter(op => op.type === 'add').length;
    const removed = diff.filter(op => op.type === 'remove').length;

    const loadSample = useCallback(() => {
        setBeforeSql(
            `select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id group by u.id, u.name;`
        );
        setAfterSql(
            `select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.status = 'active' group by u.id, u.name order by orders desc limit 20;`
        );
    }, []);

    const clearAll = useCallback(() => {
        setBeforeSql('');
        setAfterSql('');
    }, []);

    const copyDiff = useCallback(async () => {
        if (diff.length === 0) return;
        const text = diff.map(op => `${op.type === 'add' ? '+' : op.type === 'remove' ? '-' : ' '} ${op.value}`).join('\n');
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Diff copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy');
        }
    }, [diff]);

    return (
        <ToolLayout
            title={title ?? 'SQL Diff'}
            subtitle={subtitle ?? 'Compare two SQL queries after formatting both the same way, so only real changes show.'}
            toolContent={content ?? DEFAULT_CONTENT}
        >
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6 animate-fade-in">
                <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-lg border border-border/50">
                    <Select value={dialect} onValueChange={v => setDialect(v as Dialect)}>
                        <SelectTrigger aria-label="Dialect" className="h-9 w-[180px] border-none bg-transparent focus:ring-0 shadow-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(dialectLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                    <span className="flex items-center gap-2">
                                        <span>{dialectIcons[key as Dialect]}</span>
                                        <span>{label}</span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-center gap-2 mb-8">
                <Button variant="outline" onClick={loadSample} className="gap-2 border-primary/20 hover:bg-primary/10">
                    Load Example
                </Button>
                <Button
                    variant="outline"
                    onClick={clearAll}
                    className="gap-2 border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                >
                    <Trash2 className="w-4 h-4" />
                    Clear
                </Button>
            </div>

            <div className="glass-card p-5 animate-slide-up mb-8">
                <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                        <span className="text-sm font-medium mb-3 block">Before</span>
                        <Textarea
                            value={beforeSql}
                            onChange={e => setBeforeSql(e.target.value)}
                            placeholder="Paste the original query..."
                            className="min-h-[220px] font-mono text-sm bg-secondary/50 border-border resize-none scrollbar-thin focus:ring-2 focus:ring-primary/50"
                            aria-label="Before SQL"
                        />
                    </div>
                    <div>
                        <span className="text-sm font-medium mb-3 block">After</span>
                        <Textarea
                            value={afterSql}
                            onChange={e => setAfterSql(e.target.value)}
                            placeholder="Paste the changed query..."
                            className="min-h-[220px] font-mono text-sm bg-secondary/50 border-border resize-none scrollbar-thin focus:ring-2 focus:ring-primary/50"
                            aria-label="After SQL"
                        />
                    </div>
                </div>
            </div>

            <div className="glass-card p-5 animate-slide-up mb-12">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">
                        Diff
                        {(added > 0 || removed > 0) && (
                            <span className="ml-3 text-xs font-mono">
                                <span className="text-green-600 dark:text-green-400">+{added}</span>{' '}
                                <span className="text-destructive">-{removed}</span>
                            </span>
                        )}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyDiff}
                        disabled={diff.length === 0}
                        className="hover:bg-primary/20 hover:text-primary disabled:opacity-50"
                    >
                        {copied ? <Check className="w-4 h-4 mr-1 text-success" /> : <Copy className="w-4 h-4 mr-1" />}
                        {copied ? 'Copied!' : 'Copy diff'}
                    </Button>
                </div>

                <div className="min-h-[200px] rounded-md border border-input bg-muted/30 overflow-x-auto">
                    {error ? (
                        <div className="p-6 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">Couldn't format one of the queries: {error}</p>
                        </div>
                    ) : diff.length > 0 ? (
                        <pre className="p-4 text-xs font-mono leading-relaxed">
                            {diff.map((op, i) => (
                                <div
                                    key={i}
                                    className={
                                        op.type === 'add'
                                            ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                            : op.type === 'remove'
                                                ? 'bg-destructive/10 text-destructive'
                                                : 'text-foreground'
                                    }
                                >
                                    <span className="select-none opacity-60 mr-2">
                                        {op.type === 'add' ? '+' : op.type === 'remove' ? '-' : ' '}
                                    </span>
                                    {op.value || ' '}
                                </div>
                            ))}
                        </pre>
                    ) : (
                        <div className="p-6 text-muted-foreground italic">
                            Paste a query on each side to see what changed between them.
                        </div>
                    )}
                </div>
            </div>
        </ToolLayout>
    );
}

const DEFAULT_CONTENT = (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold">Why format before diffing</h2>
        <p>
            Comparing two queries as raw text means every reformatting — a keyword recapitalized,
            a line rewrapped — shows up as a change, burying the one that actually matters. Both
            sides are run through the same sql-formatter pass, with the same dialect and options,
            before the line-level diff runs, so what's left is the real difference.
        </p>
    </div>
);
