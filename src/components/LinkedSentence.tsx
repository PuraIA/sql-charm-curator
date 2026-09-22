import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface LinkedSentenceProps {
    /** Translation key whose value contains exactly one literal "{{link}}" placeholder. */
    i18nKey: string;
    to: string;
    /** The link's own visible text — itself a translation key, so it's independently translated. */
    linkTextKey: string;
}

/**
 * Renders a translated sentence with one real, clickable <Link> embedded in the middle
 * of it — "Not sure which one you need? {{link}} lets you switch without leaving the
 * page." — without `Trans`'s numbered-component markup, which is easy to get wrong
 * across 7 languages. Reads the raw, uninterpolated template for the resolved
 * language (falling back to English), splits it on the literal "{{link}}" token, and
 * renders the two halves with the link in between.
 */
export function LinkedSentence({ i18nKey, to, linkTextKey }: LinkedSentenceProps) {
    const { t, i18n } = useTranslation();
    const template =
        (i18n.getResource(i18n.language, 'translation', i18nKey) as string | undefined) ??
        (i18n.getResource('en', 'translation', i18nKey) as string | undefined) ??
        '{{link}}';
    const [before, after] = template.split('{{link}}');

    return (
        <p className="mt-6">
            {before}
            <Link to={to} className="text-primary hover:underline">
                {t(linkTextKey)}
            </Link>
            {after}
        </p>
    );
}
