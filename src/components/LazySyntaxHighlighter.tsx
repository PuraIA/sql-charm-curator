import React, { Suspense, useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

// Lazy load the styles
const loadStyles = () =>
    import('react-syntax-highlighter/dist/esm/styles/prism').then((module) => ({
        vs: module.vs,
        atomDark: module.atomDark,
    }));

interface LazySyntaxHighlighterProps {
    code: string;
    theme: 'light' | 'dark';
}

export function LazySyntaxHighlighter({ code, theme }: LazySyntaxHighlighterProps) {
    return (
        <Suspense
            fallback={
                <div className="p-6 font-mono text-sm bg-secondary/50 rounded-lg border border-border/50 min-h-[450px] flex items-center justify-center">
                    <div className="text-muted-foreground">Loading syntax highlighter...</div>
                </div>
            }
        >
            <DynamicSyntaxHighlighter code={code} theme={theme} />
        </Suspense>
    );
}

function DynamicSyntaxHighlighter({ code, theme }: LazySyntaxHighlighterProps) {
    const [styles, setStyles] = useState<any>(null);

    useEffect(() => {
        loadStyles().then((loadedStyles) => {
            setStyles(loadedStyles);
        });
    }, []);

    if (!styles) {
        return (
            <div className="p-6 font-mono text-sm bg-secondary/50 rounded-lg border border-border/50 min-h-[450px] flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <SyntaxHighlighter
            language="sql"
            style={theme === 'dark' ? styles.atomDark : styles.vs}
            customStyle={{
                margin: 0,
                padding: '1.5rem',
                background: 'transparent',
                fontSize: '1.2em',
                lineHeight: '1.5',
                minHeight: '450px',
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            }}
            wrapLines={true}
            wrapLongLines={true}
        >
            {code}
        </SyntaxHighlighter>
    );
}
