import { useState, useMemo, useCallback, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Trash2, AlertTriangle, Hash } from 'lucide-react';
import { ToolLayout } from './ToolLayout';
import { AdPlaceholder } from './AdPlaceholder';
import { evaluateXPath, type XPathMatch } from '@/utils/xpath-lite';

export interface XPathTesterProps {
    initialXml?: string;
    initialExpression?: string;
    title?: string;
    subtitle?: string;
    content?: ReactNode;
}

export function XPathTester({
    initialXml = '',
    initialExpression = '',
    title,
    subtitle,
    content,
}: XPathTesterProps = {}) {
    const [xml, setXml] = useState(initialXml);
    const [expression, setExpression] = useState(initialExpression);

    // evaluateXPath is pure and synchronous — this project's own parser and evaluator,
    // not a browser-only API — so this is correct on the very first render, including
    // during the build-time prerender, with no separately precomputed prop needed.
    const result = useMemo(() => {
        if (!xml.trim() || !expression.trim()) return null;
        try {
            return { ok: true as const, value: evaluateXPath(xml, expression) };
        } catch (err) {
            return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
        }
    }, [xml, expression]);

    const loadSample = useCallback(() => {
        setXml(SAMPLE_XML);
        setExpression("/bookstore/book[@category='children']/title");
    }, []);

    const clearAll = useCallback(() => {
        setXml('');
        setExpression('');
    }, []);

    return (
        <ToolLayout
            title={title ?? 'XPath Tester'}
            subtitle={subtitle ?? 'Evaluate an XPath expression against your XML and see every match, live.'}
            toolContent={content ?? DEFAULT_CONTENT}
        >
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
                <span className="text-sm font-medium mb-3 block">XML</span>
                <Textarea
                    value={xml}
                    onChange={e => setXml(e.target.value)}
                    placeholder="Paste your XML here..."
                    className="min-h-[280px] font-mono text-sm bg-secondary/50 border-border resize-none scrollbar-thin focus:ring-2 focus:ring-primary/50"
                    aria-label="XML input"
                />
            </div>

            <div className="glass-card p-5 animate-slide-up mb-12">
                <span className="text-sm font-medium mb-3 block">XPath expression</span>
                <Input
                    value={expression}
                    onChange={e => setExpression(e.target.value)}
                    placeholder="/bookstore/book[@category='children']/title"
                    className="font-mono text-sm bg-secondary/50 border-border mb-6 focus-visible:ring-2 focus-visible:ring-primary/50"
                    aria-label="XPath expression"
                />

                {!result ? (
                    <div className="p-6 text-muted-foreground italic min-h-[100px] rounded-md border border-input bg-muted/30">
                        Paste XML above and type an XPath expression to see what it matches.
                    </div>
                ) : !result.ok ? (
                    <div className="p-6 flex items-start gap-3 rounded-md border border-input bg-muted/30">
                        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">{result.error}</p>
                    </div>
                ) : result.value.kind === 'count' ? (
                    <div className="p-6 flex items-center gap-3 rounded-md border border-input bg-muted/30">
                        <Hash className="w-5 h-5 text-primary shrink-0" />
                        <p className="text-sm">
                            <span className="font-mono text-lg font-bold">{result.value.value}</span>{' '}
                            <span className="text-muted-foreground">match{result.value.value === 1 ? '' : 'es'}</span>
                        </p>
                    </div>
                ) : result.value.matches.length === 0 ? (
                    <div className="p-6 text-muted-foreground italic rounded-md border border-input bg-muted/30">
                        No matches.
                    </div>
                ) : (
                    <div className="rounded-md border border-input bg-muted/30 overflow-hidden">
                        <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border/50">
                            {result.value.matches.length} match{result.value.matches.length === 1 ? '' : 'es'}
                        </div>
                        <ul className="divide-y divide-border/50">
                            {result.value.matches.map((match, i) => (
                                <MatchRow key={i} match={match} />
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}

function MatchRow({ match }: { match: XPathMatch }) {
    if (match.kind === 'element') {
        return (
            <li className="px-4 py-3 flex items-start gap-3">
                <code className="font-mono text-sm text-primary shrink-0">{match.label}</code>
                <span className="text-sm text-muted-foreground truncate">{match.snippet}</span>
            </li>
        );
    }
    return (
        <li className="px-4 py-3 flex items-start gap-3">
            <code className="font-mono text-sm text-primary shrink-0">{match.label}</code>
            <span className="text-sm text-muted-foreground truncate">{match.value}</span>
        </li>
    );
}

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="cooking" id="b1">
    <title lang="en">Everyday Italian</title>
    <author>Giada De Laurentiis</author>
    <year>2005</year>
    <price>30.00</price>
  </book>
  <book category="children" id="b2">
    <title lang="en">Harry Potter</title>
    <author>J K. Rowling</author>
    <year>2005</year>
    <price>29.99</price>
  </book>
  <book category="web" id="b3">
    <title lang="en">Learning XML</title>
    <author>Erik T. Ray</author>
    <year>2003</year>
    <price>39.95</price>
  </book>
</bookstore>`;

const DEFAULT_CONTENT = (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold">What this tests, exactly</h2>
        <p>
            This evaluates a scoped subset of XPath 1.0 — paths, predicates like
            <code>[@id='x']</code> or <code>[1]</code>, and <code>text()</code> / <code>@name</code>{' '}
            node tests — over this site's own XML parser, not a full XPath engine or the
            browser's <code>document.evaluate()</code>. That subset covers what most people
            actually type when testing an expression; see /xml/xpath for exactly what it does
            and does not support.
        </p>
    </div>
);
