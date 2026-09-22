import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { JSONFormatter } from '@/components/JSONFormatter';
import { JSONGuideContent } from '@/components/JSONGuideContent';
import { FormatConverter } from '@/components/FormatConverter';
import { ConverterGuideContent } from '@/components/ConverterGuideContent';
import { getJsonGuide, localizeJsonGuide } from '@/content/json-guides';
import { getConverterGuide, localizeConverterGuide } from '@/content/converter-guides';
import NotFound from './NotFound';

/**
 * /json/<slug> — either the JSON formatter opened in a specific mode (minify, validate,
 * to-typescript) or, for a conversion slug (to-xml, to-yaml), the format converter —
 * each followed by reference material for that specific page.
 *
 * The prerendered HTML is always English; `localizeJsonGuide` only affects what a
 * visitor sees post-hydration after picking another language, and falls back to
 * English for anything a translation doesn't cover.
 */
const JSONGuidePage = () => {
    const { guide: slug } = useParams();
    const { i18n } = useTranslation();

    const converterGuide = slug ? getConverterGuide('json', slug) : undefined;
    if (converterGuide) {
        const localizedConverter = localizeConverterGuide(converterGuide, i18n.language);
        return (
            <FormatConverter
                key={`json-${converterGuide.slug}`}
                initialFromFormat={converterGuide.fromFormat}
                initialToFormat={converterGuide.toFormat}
                initialInput={converterGuide.sample.input}
                title={localizedConverter.h1}
                subtitle={localizedConverter.tagline}
                content={<ConverterGuideContent guide={localizedConverter} />}
            />
        );
    }

    const guide = slug ? getJsonGuide(slug) : undefined;
    if (!guide) return <NotFound />;
    const localized = localizeJsonGuide(guide, i18n.language);

    return (
        <JSONFormatter
            key={guide.slug}
            initialFormatStyle={guide.tool.formatStyle}
            initialData={guide.tool.input}
            initialFormattedOutput={guide.tool.output}
            tsRootName={guide.rootTypeName}
            title={localized.h1}
            subtitle={localized.tagline}
            content={<JSONGuideContent guide={localized} />}
        />
    );
};

export default JSONGuidePage;
