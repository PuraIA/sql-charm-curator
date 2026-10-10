import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FolderOpen, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLoadTextFile } from '@/hooks/use-file-drop';
import { downloadText } from '@/utils/file-io';

const toolbarButton = 'gap-2 border-primary/20 hover:bg-primary/10';

/** Opens a local text file into a tool's input. Nothing is uploaded. */
export function OpenFileButton({ accept, onText }: { accept: string; onText: (text: string, fileName: string) => void }) {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);
    const load = useLoadTextFile(onText);

    return (
        <>
            <Button variant="outline" className={toolbarButton} onClick={() => inputRef.current?.click()}>
                <FolderOpen className="w-4 h-4" />
                {t('toolOpenFile')}
            </Button>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
                onChange={event => {
                    const file = event.target.files?.[0];
                    // Reset so choosing the same file again still fires onChange.
                    event.target.value = '';
                    if (file) void load(file);
                }}
            />
        </>
    );
}

/** Creates a share link for the current state (see useShareLink). */
export function ShareButton({ onShare, disabled }: { onShare: () => void; disabled?: boolean }) {
    const { t } = useTranslation();
    return (
        <Button variant="outline" className={toolbarButton} onClick={onShare} disabled={disabled}>
            <Link2 className="w-4 h-4" />
            {t('toolShare')}
        </Button>
    );
}

/** Saves a tool's output as a file, next to its Copy button. */
export function DownloadButton({
    filename,
    text,
    mimeType,
}: {
    filename: string;
    text: string;
    mimeType?: string;
}) {
    const { t } = useTranslation();
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => downloadText(filename, text, mimeType)}
            disabled={!text}
            className="hover:bg-primary/20 hover:text-primary disabled:opacity-50"
        >
            <Download className="w-4 h-4 mr-1" />
            {t('toolDownload')}
        </Button>
    );
}

/** The "Ctrl/⌘ + Enter" hint shown under an input that supports the shortcut. */
export function RunShortcutHint() {
    const { t } = useTranslation();
    return <span className="text-xs text-muted-foreground hidden sm:inline">{t('toolShortcutHint')}</span>;
}
