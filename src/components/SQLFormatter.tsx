import { useState, useCallback, useEffect, lazy, Suspense, type ReactNode } from 'react';
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
import { Copy, Check, Trash2, Database, FileCode, FileCheck, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { superCompactSQL, formatSqlWithFallback } from '@/utils/sql-utils';
import { useTheme } from './theme-provider';
import { ToolLayout } from './ToolLayout';
import { AdPlaceholder } from './AdPlaceholder';
import { PlainCode } from './PlainCode';
import { DownloadButton, OpenFileButton, RunShortcutHint, ShareButton } from './ToolIOButtons';
import { useShareLink } from '@/hooks/use-share-link';
import { useFileDrop } from '@/hooks/use-file-drop';
import { isRunShortcut } from '@/utils/file-io';
import { sampleQueries } from '@/content/sql-samples';
// Editorial content is imported eagerly: it has to exist in the prerendered HTML,
// and a lazy chunk would only ever render its Suspense fallback at build time.
import { FormatterFAQ } from './FormatterFAQ';
import { SQLInfo } from './SQLInfo';
import { SQLContent } from './SQLContent';
// Genuinely deferrable: only reachable after the user interacts with the tool.
const LazySyntaxHighlighter = lazy(() => import('./LazySyntaxHighlighter').then(module => ({ default: module.LazySyntaxHighlighter })));
const FormatterSidebar = lazy(() => import('./FormatterSidebar').then(module => ({ default: module.FormatterSidebar })));

export type Dialect =
  | 'postgresql'
  | 'mysql'
  | 'mariadb'
  | 'transactsql'
  | 'plsql'
  | 'sqlite'
  | 'bigquery'
  | 'snowflake'
  | 'redshift'
  | 'db2'
  | 'spark'
  | 'hive'
  | 'trino'
  | 'duckdb'
  | 'singlestoredb'
  | 'sql';
export type KeywordCase = 'preserve' | 'upper' | 'lower';
export type IdentifierCase = 'preserve' | 'upper' | 'lower';
export type LogicalOperatorNewline = 'before' | 'after';
export type IndentStyle = 'standard' | 'tabularLeft' | 'tabularRight';

export interface FormatterOptions {
  dialect: Dialect;
  keywordCase: KeywordCase;
  dataTypeCase: KeywordCase;
  functionCase: KeywordCase;
  identifierCase: IdentifierCase;
  indentStyle: IndentStyle;
  logicalOperatorNewline: LogicalOperatorNewline;
  tabWidth: number;
  useTabs: boolean;
  expressionWidth: number;
  linesBetweenQueries: number;
  denseOperators: boolean;
  newlineBeforeSemicolon: boolean;
}

/** Display order of the dialect selector: the most common engines first, generic SQL last. */
export const dialectLabels: Record<Dialect, string> = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  mariadb: 'MariaDB',
  transactsql: 'SQL Server (T-SQL)',
  plsql: 'Oracle (PL/SQL)',
  sqlite: 'SQLite',
  bigquery: 'BigQuery',
  snowflake: 'Snowflake',
  redshift: 'Amazon Redshift',
  db2: 'IBM Db2',
  spark: 'Spark SQL',
  hive: 'Apache Hive',
  trino: 'Trino',
  duckdb: 'DuckDB',
  singlestoredb: 'SingleStoreDB',
  sql: 'Standard SQL',
};

export const dialectIcons: Record<Dialect, string> = {
  postgresql: '🐘',
  mysql: '🐬',
  mariadb: '🦭',
  transactsql: '🔷',
  plsql: '🔴',
  sqlite: '🪶',
  bigquery: '🔍',
  snowflake: '❄️',
  redshift: '🟥',
  db2: '🟦',
  spark: '⚡',
  hive: '🐝',
  trino: '🐰',
  duckdb: '🦆',
  singlestoredb: '🟣',
  sql: '📋',
};

/** What a share link carries for this tool. */
interface SqlShareState {
  input: string;
  options: FormatterOptions;
  compactMode: boolean;
}

export interface SQLFormatterProps {
  /** Dialect the tool opens with. */
  initialDialect?: Dialect;
  /** SQL loaded into the editor on first render; the tool opens on the formatted tab. */
  initialSql?: string;
  /**
   * Formatted counterpart of initialSql, shown before the formatter chunk loads.
   * Must equal what the formatter produces — src/content/sql-dialects.test.ts checks it.
   */
  initialFormattedSql?: string;
  /** Overrides the generic page heading. */
  title?: string;
  subtitle?: string;
  /** Replaces the default editorial content rendered below the tool. */
  content?: ReactNode;
}

export function SQLFormatter({
  initialDialect = 'postgresql',
  initialSql = '',
  initialFormattedSql = '',
  title,
  subtitle,
  content,
}: SQLFormatterProps = {}) {
  const { t, i18n } = useTranslation();
  const [inputSQL, setInputSQL] = useState(initialSql);
  const [outputSQL, setOutputSQL] = useState(initialFormattedSql);
  const [copied, setCopied] = useState(false);
  // With a query preloaded there is nothing to type, so show the result straight away.
  const [activeTab, setActiveTab] = useState(initialSql ? 'formatted' : 'original');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const { theme } = useTheme();

  const [options, setOptions] = useState<FormatterOptions>({
    dialect: initialDialect,
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
  });

  const formatSQL = useCallback(async () => {
    if (!inputSQL.trim()) {
      setOutputSQL('');
      return;
    }

    try {
      const { formatted, usedFallback } = await formatSqlWithFallback(inputSQL, options);
      const result = compactMode ? superCompactSQL(formatted) : formatted;
      setOutputSQL(result);
      if (usedFallback === 'generic') toast.warning(t('toastGeneric'));
    } catch (error) {
      console.error('Format error:', error);
      toast.error(t('toastError'));
    }
  }, [inputSQL, options, compactMode, t]);

  // Auto-format when switching to formatted tab or when options change while on formatted tab
  useEffect(() => {
    if (activeTab === 'formatted' && inputSQL.trim()) {
      formatSQL();
    }
  }, [activeTab, options, formatSQL, inputSQL]);

  const share = useShareLink<SqlShareState>('sql', state => {
    setInputSQL(state.input ?? '');
    setOutputSQL('');
    setCompactMode(Boolean(state.compactMode));
    // Merge onto the current options, so a link from an older version still loads.
    setOptions(prev => ({
      ...prev,
      ...state.options,
      dialect: state.options?.dialect in dialectLabels ? state.options.dialect : prev.dialect,
    }));
    setActiveTab('formatted');
  });

  const loadText = useCallback((text: string) => {
    setInputSQL(text);
    setOutputSQL('');
    setActiveTab('formatted');
  }, []);
  const { isDragging, dropProps } = useFileDrop(loadText);

  const copyToClipboard = useCallback(async () => {
    if (!outputSQL) return;

    try {
      await navigator.clipboard.writeText(outputSQL);
      setCopied(true);
      toast.success(t('toastCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('toastCopyError'));
    }
  }, [outputSQL, t]);

  const clearAll = useCallback(() => {
    setInputSQL('');
    setOutputSQL('');
  }, []);

  const loadSample = useCallback(() => {
    setInputSQL(sampleQueries[options.dialect]);
    setOutputSQL('');
  }, [options.dialect]);

  const toggleCompactMode = useCallback((enabled: boolean) => {
    setCompactMode(enabled);
    if (enabled) {
      // Modo compacto: ajusta configurações para SQL mais compacto
      setOptions(prev => ({
        ...prev,
        tabWidth: 2,
        denseOperators: true,
        linesBetweenQueries: 1,
        expressionWidth: 150,
      }));
    } else {
      // Modo normal: restaura configurações padrão
      setOptions(prev => ({
        ...prev,
        tabWidth: 2,
        denseOperators: false,
        linesBetweenQueries: 2,
        expressionWidth: 120,
      }));
    }
  }, []);

  return (
    <ToolLayout
      title={title ?? t('title')}
      subtitle={subtitle ?? t('subtitle')}
      toolContent={
        content ?? (
        <div className="space-y-12">
            <SQLInfo />

          <div className="my-12 py-8 border-y border-border/50">
            <AdPlaceholder slotId="content-middle" />
          </div>

            <SQLContent />

          <div className="my-12 py-8 border-y border-border/50">
            <AdPlaceholder slotId="content-bottom" />
          </div>

            <FormatterFAQ />
        </div>
        )
      }
    >
      <div className="flex flex-wrap justify-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {/* Main Controls row */}
        <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-lg border border-border/50">
          <Select
            value={options.dialect}
            onValueChange={(value: Dialect) => setOptions(prev => ({ ...prev, dialect: value }))}
          >
            <SelectTrigger
              aria-label={t('selectDialect')}
              className="h-9 w-[180px] border-none bg-transparent focus:ring-0 shadow-none"
            >
              <SelectValue placeholder={t('selectDialect')} />
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

        <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-lg border border-border/50">
          <Select
            value={options.keywordCase}
            onValueChange={(value: KeywordCase) => setOptions(prev => ({ ...prev, keywordCase: value }))}
          >
            <SelectTrigger
              aria-label={t('casing')}
              className="h-9 w-[140px] border-none bg-transparent focus:ring-0 shadow-none"
            >
              <SelectValue placeholder={t('casing')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upper">{t('uppercase')}</SelectItem>
              <SelectItem value="lower">{t('lowercase')}</SelectItem>
              <SelectItem value="preserve">{t('preserve')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-lg border border-border/50">
          <Select
            value={options.indentStyle}
            onValueChange={(value: IndentStyle) => setOptions(prev => ({ ...prev, indentStyle: value }))}
          >
            <SelectTrigger
              aria-label={t('indentation')}
              className="h-9 w-[140px] border-none bg-transparent focus:ring-0 shadow-none"
            >
              <SelectValue placeholder={t('indentation')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">{t('indentation')}</SelectItem>
              <SelectItem value="tabularLeft">Tabular Left</SelectItem>
              <SelectItem value="tabularRight">Tabular Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50 h-[50px]">
          <div className="flex items-center gap-2">
            <Label htmlFor="compact-mode" className="text-sm cursor-pointer whitespace-nowrap">{t('compactMode')}</Label>
            <Switch
              id="compact-mode"
              checked={compactMode}
              onCheckedChange={toggleCompactMode}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <Button
          variant="outline"
          onClick={loadSample}
          className="gap-2 border-primary/20 hover:bg-primary/10"
        >
          <Database className="w-4 h-4" />
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
        <OpenFileButton accept=".sql,.txt,text/plain" onText={loadText} />
        <ShareButton
          onShare={() => share({ input: inputSQL, options, compactMode })}
          disabled={!inputSQL.trim()}
        />

        <Button
          variant="outline"
          className="gap-2 border-primary/20 hover:bg-primary/10"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Settings2 className="w-4 h-4" />
          {t('advanced')}
        </Button>

        <Suspense fallback={null}>
          <FormatterSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            options={options}
            setOptions={setOptions}
          />
        </Suspense>
      </div>

      {/* Main Formatter area with layout isolation */}
      <div className="glass-card p-5 animate-slide-up transition-opacity duration-300 opacity-100 mb-12 will-change-transform contain-layout" style={{ animationDelay: '0.1s' }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full contain-paint">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="original" className="flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              <h2 className="text-sm font-medium">{t('originalSql')}</h2>
            </TabsTrigger>
            <TabsTrigger value="formatted" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              <h2 className="text-sm font-medium">{t('formattedSql')}</h2>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="original" className="mt-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">
                {inputSQL.length} {t('characters')}
              </span>
              <RunShortcutHint />
            </div>
            <Textarea
              value={inputSQL}
              onChange={(e) => setInputSQL(e.target.value)}
              onKeyDown={(e) => {
                if (isRunShortcut(e)) {
                  e.preventDefault();
                  setActiveTab('formatted');
                }
              }}
              {...dropProps}
              placeholder={t('pastePlaceholder')}
              className={`min-h-[450px] font-mono text-sm bg-secondary/50 border-border resize-none scrollbar-thin focus:ring-2 focus:ring-primary/50 ${isDragging ? 'ring-2 ring-primary' : ''}`}
              aria-label={t('originalSql')}
            />
          </TabsContent>

          <TabsContent value="formatted" className="mt-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">
                {outputSQL.length} {t('characters')}
              </span>
              <div className="flex items-center gap-1">
                <DownloadButton filename="formatted.sql" text={outputSQL} mimeType="application/sql" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!outputSQL}
                  className="hover:bg-primary/20 hover:text-primary disabled:opacity-50"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-1 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {copied ? t('copied') : t('copy')}
                </Button>
              </div>
            </div>

            {/* Formatted Output */}
            <div className="min-h-[450px] code-editor overflow-hidden rounded-md border border-input bg-muted/30 contain-content">
              {outputSQL ? (
                <Suspense fallback={<PlainCode code={outputSQL} />}>
                  <LazySyntaxHighlighter code={outputSQL} theme={theme === 'dark' ? 'dark' : 'light'} />
                </Suspense>
              ) : (
                <div className="p-6 text-muted-foreground italic min-h-[450px]">
                  {inputSQL.trim() ? t('formatting') : t('emptyPlaceholder')}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout >
  );
}
