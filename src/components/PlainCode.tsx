interface PlainCodeProps {
    code: string;
    className?: string;
}

/**
 * Unstyled, dependency-free rendering of a code block.
 *
 * Used wherever the syntax highlighter is still loading. Showing the code itself beats
 * showing a "loading" placeholder — the user can already read and select it — and it
 * means the formatted output is present in the prerendered HTML, where the highlighter
 * (a lazy chunk) would only ever contribute its fallback.
 */
export const PlainCode = ({ code, className = '' }: PlainCodeProps) => (
    <pre
        className={`p-6 m-0 font-mono text-sm leading-relaxed min-h-[450px] overflow-x-auto whitespace-pre-wrap break-words ${className}`}
    >
        <code>{code}</code>
    </pre>
);
