import { useParams } from 'react-router-dom';
import { JSONFormatter } from '@/components/JSONFormatter';
import { JSONGuideContent } from '@/components/JSONGuideContent';
import { FormatConverter } from '@/components/FormatConverter';
import { ConverterGuideContent } from '@/components/ConverterGuideContent';
import { getJsonGuide } from '@/content/json-guides';
import { getConverterGuide } from '@/content/converter-guides';
import NotFound from './NotFound';

/**
 * /json/<slug> — either the JSON formatter opened in a specific mode (minify, validate,
 * to-typescript) or, for a conversion slug (to-xml, to-yaml), the format converter —
 * each followed by reference material for that specific page.
 */
const JSONGuidePage = () => {
    const { guide: slug } = useParams();

    const converterGuide = slug ? getConverterGuide('json', slug) : undefined;
    if (converterGuide) {
        return (
            <FormatConverter
                key={`json-${converterGuide.slug}`}
                initialFromFormat={converterGuide.fromFormat}
                initialToFormat={converterGuide.toFormat}
                initialInput={converterGuide.sample.input}
                title={converterGuide.h1}
                subtitle={converterGuide.tagline}
                content={<ConverterGuideContent guide={converterGuide} />}
            />
        );
    }

    const guide = slug ? getJsonGuide(slug) : undefined;
    if (!guide) return <NotFound />;

    return (
        <JSONFormatter
            key={guide.slug}
            initialFormatStyle={guide.tool.formatStyle}
            initialData={guide.tool.input}
            initialFormattedOutput={guide.tool.output}
            tsRootName={guide.rootTypeName}
            title={guide.h1}
            subtitle={guide.tagline}
            content={<JSONGuideContent guide={guide} />}
        />
    );
};

export default JSONGuidePage;
