import { useParams } from 'react-router-dom';
import { XMLFormatter } from '@/components/XMLFormatter';
import { XMLGuideContent } from '@/components/XMLGuideContent';
import { FormatConverter } from '@/components/FormatConverter';
import { ConverterGuideContent } from '@/components/ConverterGuideContent';
import { getXmlGuide } from '@/content/xml-guides';
import { getConverterGuide } from '@/content/converter-guides';
import NotFound from './NotFound';

/**
 * /xml/<slug> — either the XML formatter opened with a specific example (minify,
 * validate) or, for a conversion slug (to-json, to-yaml), the format converter — each
 * followed by reference material for that specific page.
 */
const XMLGuidePage = () => {
    const { guide: slug } = useParams();

    const converterGuide = slug ? getConverterGuide('xml', slug) : undefined;
    if (converterGuide) {
        return (
            <FormatConverter
                key={`xml-${converterGuide.slug}`}
                initialFromFormat={converterGuide.fromFormat}
                initialToFormat={converterGuide.toFormat}
                initialInput={converterGuide.sample.input}
                title={converterGuide.h1}
                subtitle={converterGuide.tagline}
                content={<ConverterGuideContent guide={converterGuide} />}
            />
        );
    }

    const guide = slug ? getXmlGuide(slug) : undefined;
    if (!guide) return <NotFound />;

    return (
        <XMLFormatter
            key={guide.slug}
            initialXml={guide.tool.input}
            initialFormattedOutput={guide.tool.input}
            title={guide.h1}
            subtitle={guide.tagline}
            content={<XMLGuideContent guide={guide} />}
        />
    );
};

export default XMLGuidePage;
