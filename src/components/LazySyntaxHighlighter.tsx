import React, { Suspense, useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import createElement from 'react-syntax-highlighter/dist/esm/create-element';
import { PlainCode } from './PlainCode';

// Lazy load the styles
const loadStyles = () =>
    import('react-syntax-highlighter/dist/esm/styles/prism').then((module) => ({
        vs: module.vs,
        atomDark: module.atomDark,
    }));

interface LazySyntaxHighlighterProps {
    code: string;
    theme: 'light' | 'dark';
    language?: 'sql' | 'json' | 'xml';
}

export function LazySyntaxHighlighter({ code, theme, language = 'sql' }: LazySyntaxHighlighterProps) {
    return (
        <Suspense fallback={<PlainCode code={code} />}>
            <DynamicSyntaxHighlighter code={code} theme={theme} language={language} />
        </Suspense>
    );
}


function DynamicSyntaxHighlighter({ code, theme, language = 'sql' }: LazySyntaxHighlighterProps) {
    const [styles, setStyles] = useState<any>(null);

    useEffect(() => {
        loadStyles().then((loadedStyles) => {
            setStyles(loadedStyles);
        });
    }, []);

    // Styles arrive in a separate chunk; show the code unstyled until they do.
    if (!styles) return <PlainCode code={code} />;

    const customRenderer = ({ rows, stylesheet, useInlineStyles }: any) => {
        rows.forEach((row: any) => {
            if (row.children) {
                row.children.forEach((child: any) => {
                    if (child.children && child.children[0] && child.children[0].value) {
                        const text = child.children[0].value.trim();
                        if (text.toUpperCase() === 'AND') {
                            if (child.properties && child.properties.className && child.properties.className.includes('operator')) {
                                child.properties.className = child.properties.className.map((c: string) => c === 'operator' ? 'keyword' : c);
                            }
                        }
                    }
                });
            }
        });

        return rows.map((node: any, i: number) => {
            return createElement({
                node,
                stylesheet,
                useInlineStyles,
                key: `code-segment-${i}`,
            });
        });
    };

    return (
        <SyntaxHighlighter
            language={language}
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
            renderer={language === 'sql' ? customRenderer : undefined}
        >
            {code}
        </SyntaxHighlighter>
    );
}
