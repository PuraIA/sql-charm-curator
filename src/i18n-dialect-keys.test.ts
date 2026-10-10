import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dialectLabels } from '@/components/SQLFormatter';

const LOCALES = ['en', 'pt', 'es', 'de', 'fr', 'zh', 'ja'];

/**
 * SQLInfo renders t(`${dialect}Desc`) for every dialect in the selector. A missing key
 * renders the key itself — /sql once showed "plsqlDesc" and "sqlDesc" as visible text.
 */
describe('every SQL dialect has a description in every locale', () => {
    it.each(LOCALES)('%s', locale => {
        const strings = JSON.parse(readFileSync(`public/locales/${locale}/translation.json`, 'utf8'));
        const missing = Object.keys(dialectLabels).filter(d => typeof strings[`${d}Desc`] !== 'string' || !strings[`${d}Desc`]);
        expect(missing).toEqual([]);
    });
});
