import { useParams } from 'react-router-dom';
import { XMLFormatter } from '@/components/XMLFormatter';
import { XMLGuideContent } from '@/components/XMLGuideContent';
import { getXmlGuide } from '@/content/xml-guides';
import NotFound from './NotFound';

/** /xml/<slug> — the formatter opened with a specific example, followed by reference material for it. */
const XMLGuidePage = () => {
    const { guide: slug } = useParams();
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
