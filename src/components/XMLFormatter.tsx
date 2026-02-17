import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Copy,
    Check,
    Trash2,
    FileCode,
    FileCheck,
    Code2
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useTheme } from './theme-provider';
import { ToolLayout } from './ToolLayout';
import { AdPlaceholder } from './AdPlaceholder';
import { SEO } from './SEO';

// Lazy load components
const LazySyntaxHighlighter = lazy(() => import('./LazySyntaxHighlighter').then(module => ({ default: module.LazySyntaxHighlighter })));
import { XMLContent } from './XMLContent';

const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="cooking">
    <title lang="en">Everyday Italian</title>
    <author>Giada De Laurentiis</author>
    <year>2005</year>
    <price>30.00</price>
  </book>
  <book category="children">
    <title lang="en">Harry Potter</title>
    <author>J K. Rowling</author>
    <year>2005</year>
    <price>29.99</price>
  </book>
  <book category="web">
    <title lang="en">Learning XML</title>
    <author>Erik T. Ray</author>
    <year>2003</year>
    <price>39.95</price>
  </book>
</bookstore>`;

export function XMLFormatter() {
    const { t } = useTranslation();
    const [inputXML, setInputXML] = useState('');
    const [outputXML, setOutputXML] = useState('');
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('original');
    const [isValid, setIsValid] = useState(true);
    const { theme } = useTheme();

    const formatXMLString = (xml: string) => {
        let formatted = '';
        let indent = '';
        const tab = '  ';
        xml.split(/>\s*</).forEach((node) => {
            if (node.match(/^\/\w/)) {
                indent = indent.substring(tab.length);
            }
            formatted += indent + '<' + node + '>\r\n';
            if (node.match(/^<?\w[^>]*[^\/]$/)) {
                indent += tab;
            }
        });
        return formatted.substring(1, formatted.length - 3);
    };

    const formatXML = useCallback(() => {
        if (!inputXML.trim()) {
            setOutputXML('');
            setIsValid(true);
            return;
        }

        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(inputXML, "text/xml");

            // Check for parsing errors
            const parserError = xmlDoc.getElementsByTagName("parsererror");
            if (parserError.length > 0) {
                throw new Error(parserError[0].textContent || "Erro de sintaxe XML");
            }

            setIsValid(true);

            // Simple robust formatting logic
            let formatted = '';
            let pad = 0;
            const PADDING = '  ';

            // Clean the XML first
            const cleanXml = inputXML.replace(/>\s*</g, '><').trim();

            // Add newlines
            const reg = /(>)(<)(\/*)/g;
            const xmlWithNewlines = cleanXml.replace(reg, '$1\r\n$2$3');

            const lines = xmlWithNewlines.split('\r\n');

            lines.forEach((node) => {
                let indent = 0;
                if (node.match(/.+<\/\w[^>]*>$/)) {
                    indent = 0;
                } else if (node.match(/^<\/\w/)) {
                    if (pad !== 0) pad -= 1;
                } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                    indent = 1;
                } else {
                    indent = 0;
                }

                formatted += PADDING.repeat(pad) + node + '\r\n';
                pad += indent;
            });

            setOutputXML(formatted.trim());
            toast.success(t('xmlToastSuccess', 'XML formatado com sucesso!'));
        } catch (error) {
            setIsValid(false);
            setOutputXML('');
            if (error instanceof Error) {
                toast.error(t('xmlToastError', 'XML inválido') + ': ' + error.message);
            }
        }
    }, [inputXML, t]);

    useEffect(() => {
        if (activeTab === 'formatted' && inputXML.trim()) {
            formatXML();
        }
    }, [activeTab, formatXML, inputXML]);

    const copyToClipboard = useCallback(async () => {
        if (!outputXML) return;

        try {
            await navigator.clipboard.writeText(outputXML);
            setCopied(true);
            toast.success(t('toastCopied', 'Copiado para a área de transferência!'));
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Erro ao copiar');
        }
    }, [outputXML, t]);

    const clearAll = useCallback(() => {
        setInputXML('');
        setOutputXML('');
        setIsValid(true);
    }, []);

    const loadSample = useCallback(() => {
        setInputXML(sampleXML);
        setOutputXML('');
        setIsValid(true);
    }, []);

    return (
        <ToolLayout
            title={t('xmlTitle', 'XML Formatter')}
            subtitle={t('xmlSubtitle', 'Formate, valide e organize seus arquivos XML de forma elegante.')}
            toolContent={
                <div className="space-y-12">
                    <SEO
                        title={t('xmlSeoTitle')}
                        description={t('xmlSeoDescription')}
                        keywords={t('xmlSeoKeywords')}
                        ogTitle={t('xmlOgTitle')}
                        ogDescription={t('xmlOgDescription')}
                        twitterTitle={t('xmlTwitterTitle')}
                        twitterDescription={t('xmlTwitterDescription')}
                    />

                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Code2 className="w-6 h-6 text-primary" />
                            {t('xmlWhatIs', 'O que é XML?')}
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            {t('xmlWhatIsDesc', 'XML (Extensible Markup Language) é uma linguagem de marcação que define um conjunto de regras para codificar documentos de forma legível.')}
                        </p>
                    </div>

                    <div className="my-12 py-8 border-y border-border/50">
                        <AdPlaceholder slotId="content-middle" />
                    </div>

                    <XMLContent />

                    <div className="my-12 py-8 border-y border-border/50">
                        <AdPlaceholder slotId="content-bottom" />
                    </div>
                </div>
            }
        >
            <div className="flex justify-center gap-2 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <Button
                    variant="outline"
                    onClick={loadSample}
                    className="gap-2 border-primary/20 hover:bg-primary/10"
                >
                    <FileCode className="w-4 h-4" />
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

            <div className="glass-card p-5 animate-slide-up transition-opacity duration-300 opacity-100 mb-12" style={{ animationDelay: '0.1s' }}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="original" className="flex items-center gap-2">
                            <FileCode className="w-4 h-4" />
                            <h2 className="text-sm font-medium">{t('xmlOriginal', 'XML Original')}</h2>
                        </TabsTrigger>
                        <TabsTrigger value="formatted" className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4" />
                            <h2 className="text-sm font-medium">{t('xmlFormatted', 'XML Formatado')}</h2>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="original" className="mt-0">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-muted-foreground">
                                {inputXML.length} {t('characters', 'caracteres')}
                                {!isValid && (
                                    <span className="ml-2 text-destructive font-medium">
                                        ⚠️ {t('xmlInvalid', 'XML inválido')}
                                    </span>
                                )}
                                {isValid && inputXML.trim() && (
                                    <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                                        ✓ {t('xmlValid', 'XML válido')}
                                    </span>
                                )}
                            </span>
                        </div>
                        <Textarea
                            value={inputXML}
                            onChange={(e) => setInputXML(e.target.value)}
                            placeholder={t('xmlPastePlaceholder', 'Cole seu XML aqui...')}
                            className={`min-h-[450px] font-mono text-sm bg-secondary/50 border-border resize-none scrollbar-thin focus:ring-2 focus:ring-primary/50 ${!isValid ? 'border-destructive focus:ring-destructive/50' : ''
                                }`}
                            aria-label={t('xmlOriginal', 'XML Original')}
                        />
                    </TabsContent>

                    <TabsContent value="formatted" className="mt-0">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-muted-foreground">
                                {outputXML.length} {t('characters', 'caracteres')}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyToClipboard}
                                disabled={!outputXML}
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

                        <div className="min-h-[450px] code-editor overflow-hidden rounded-md border border-input bg-muted/30">
                            {outputXML ? (
                                <Suspense fallback={
                                    <div className="p-6 font-mono text-sm bg-secondary/50 rounded-lg border border-border/50 min-h-[450px] flex items-center justify-center animate-pulse">
                                        <div className="text-muted-foreground">{t('formatting', 'Formatando...')}</div>
                                    </div>
                                }>
                                    <LazySyntaxHighlighter code={outputXML} theme={theme === 'dark' ? 'dark' : 'light'} language="xml" />
                                </Suspense>
                            ) : (
                                <div className="p-6 text-muted-foreground italic min-h-[450px]">
                                    {inputXML.trim() ? t('formatting', 'Formatando...') : t('xmlEmptyPlaceholder', 'Insira um XML na aba "XML Original"')}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </ToolLayout>
    );
}
