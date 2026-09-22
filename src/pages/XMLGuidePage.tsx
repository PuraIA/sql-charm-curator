import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XMLFormatter } from '@/components/XMLFormatter';
import { XMLGuideContent } from '@/components/XMLGuideContent';
import { FormatConverter } from '@/components/FormatConverter';
import { ConverterGuideContent } from '@/components/ConverterGuideContent';
import { XPathTester } from '@/components/XPathTester';
import { XmlToolGuideContent } from '@/components/XmlToolGuideContent';
import { getXmlGuide, localizeXmlGuide } from '@/content/xml-guides';
import { getConverterGuide, localizeConverterGuide } from '@/content/converter-guides';
import { getXmlToolGuide } from '@/content/xml-tools';
import NotFound from './NotFound';

/**
 * /xml/<slug> — one of three tool guides sharing this route: a standalone tool
 * (xpath), a conversion (to-json, to-yaml), or the XML formatter opened with a
 * specific example (minify, validate). Each lookup is checked in turn since the slug
 * sets are disjoint but share this one route — the same layered pattern
 * SQLDialectPage uses for /sql/diff.
 *
 * The prerendered HTML is always English; `localizeXmlGuide` only affects what a
 * visitor sees post-hydration after picking another language.
 */
const XMLGuidePage = () => {
    const { guide: slug } = useParams();
    const { i18n } = useTranslation();

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
        const localizedConverter = localizeConverterGuide(converterGuide, i18n.language);
        return (
            <FormatConverter
                key={`xml-${converterGuide.slug}`}
                initialFromFormat={converterGuide.fromFormat}
                initialToFormat={converterGuide.toFormat}
                initialInput={converterGuide.sample.input}
                title={localizedConverter.h1}
                subtitle={localizedConverter.tagline}
                content={<ConverterGuideContent guide={localizedConverter} />}
            />
        );
    }

    const guide = slug ? getXmlGuide(slug) : undefined;
    if (!guide) return <NotFound />;
    const localized = localizeXmlGuide(guide, i18n.language);

    return (
        <XMLFormatter
            key={guide.slug}
            initialXml={guide.tool.input}
            initialFormattedOutput={guide.tool.input}
            title={localized.h1}
            subtitle={localized.tagline}
            content={<XMLGuideContent guide={localized} />}
        />
    );
};

export default XMLGuidePage;
