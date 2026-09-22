/** A labelled block of preformatted code, used for before/after and inline examples. */
export function CodePanel({
    code,
    label,
    tone,
}: {
    code: string;
    label?: string;
    tone: 'muted' | 'primary';
}) {
    const border = tone === 'primary' ? 'border-primary/30' : 'border-border/50';
    const background = tone === 'primary' ? 'bg-primary/5' : 'bg-secondary/20';

    return (
        <div className={`not-prose rounded-xl border ${border} ${background} overflow-hidden`}>
            {label && (
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border/50">
                    {label}
                </div>
            )}
            <pre className="p-4 overflow-x-auto text-xs leading-relaxed">
                <code className="font-mono">{code}</code>
            </pre>
        </div>
    );
}
