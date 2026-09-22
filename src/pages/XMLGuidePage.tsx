import { useParams } from 'react-router-dom';
import { XMLFormatter } from '@/components/XMLFormatter';
import { XMLGuideContent } from '@/components/XMLGuideContent';
import { FormatConverter } from '@/components/FormatConverter';
import { ConverterGuideContent } from '@/components/ConverterGuideContent';
import { XPathTester } from '@/components/XPathTester';
import { XmlToolGuideContent } from '@/components/XmlToolGuideContent';
import { getXmlGuide } from '@/content/xml-guides';
import { getConverterGuide } from '@/content/converter-guides';
import { getXmlToolGuide } from '@/content/xml-tools';
import NotFound from './NotFound';

/**
 * /xml/<slug> — one of three tool guides sharing this route: a standalone tool
 * (xpath), a conversion (to-json, to-yaml), or the XML formatter opened with a
 * specific example (minify, validate). Each lookup is checked in turn since the slug
 * sets are disjoint but share this one route — the same layered pattern
 * SQLDialectPage uses for /sql/diff.
 */
const XMLGuidePage = () => {
    const { guide: slug } = useParams();

    const toolGuide = slug ? getXmlToolGuide(slug) : undefined;
    if (toolGuide) {
        return (
            <XPathTester
                key={toolGuide.slug}
                initialXml={toolGuide.sampleXml}
                initialExpression={toolGuide.defaultExpression}
                title={toolGuide.h1}
                subtitle={toolGuide.tagline}
                content={<XmlToolGuideContent guide={toolGuide} />}
            />
        );
    }

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
