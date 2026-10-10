import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const LOCALES = ['en', 'pt', 'es', 'de', 'fr', 'zh', 'ja'];

function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap(name => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return name === 'ui' ? [] : sourceFiles(path);
        return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
    });
}

/** Every t('literal') / t("literal") key in the app, with the file it appears in. */
function usedKeys(): Map<string, string> {
    const keys = new Map<string, string>();
    for (const file of sourceFiles('src')) {
        for (const match of readFileSync(file, 'utf8').matchAll(/\bt\(\s*(['"])([A-Za-z0-9_.]+)\1/g)) {
            if (!keys.has(match[2])) keys.set(match[2], file);
        }
    }
    return keys;
}

/**
 * A key missing from a locale renders as the key itself (or as a hard-coded fallback in
 * another language). Plural keys may exist only as key_one / key_other.
 */
describe('every translation key used in the code exists in every locale', () => {
    const keys = usedKeys();

    it('finds the keys it is supposed to check', () => {
        expect(keys.size).toBeGreaterThan(100);
    });

    it.each(LOCALES)('%s', locale => {
        const strings = JSON.parse(readFileSync(`public/locales/${locale}/translation.json`, 'utf8')) as Record<string, unknown>;
        const has = (key: string) => key in strings || `${key}_other` in strings;
        const missing = [...keys].filter(([key]) => !has(key)).map(([key, file]) => `${key} (${file})`);
        expect(missing).toEqual([]);
    });
});
