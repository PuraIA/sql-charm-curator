import { useCallback, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { FileTooLargeError, readTextFile } from '@/utils/file-io';

/** Loads a text file into the caller, with the toasts every tool shows for failures. */
export function useLoadTextFile(onText: (text: string, fileName: string) => void) {
    const { t } = useTranslation();
    return useCallback(
        async (file: File) => {
            try {
                onText(await readTextFile(file), file.name);
            } catch (error) {
                toast.error(t(error instanceof FileTooLargeError ? 'toolFileTooLarge' : 'toolFileReadError'));
            }
        },
        [onText, t]
    );
}

/**
 * Props for a textarea that accepts a dropped file. `isDragging` lets the caller
 * highlight the drop target while a file is over it.
 */
export function useFileDrop(onText: (text: string, fileName: string) => void) {
    const load = useLoadTextFile(onText);
    const [isDragging, setIsDragging] = useState(false);

    const onDragOver = useCallback((event: DragEvent) => {
        if (!event.dataTransfer.types.includes('Files')) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback(() => setIsDragging(false), []);

    const onDrop = useCallback(
        (event: DragEvent) => {
            const file = event.dataTransfer.files[0];
            setIsDragging(false);
            if (!file) return;
            event.preventDefault();
            void load(file);
        },
        [load]
    );

    return { isDragging, dropProps: { onDragOver, onDragLeave, onDrop } };
}
