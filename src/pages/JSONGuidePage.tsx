import { useParams } from 'react-router-dom';
import { JSONFormatter } from '@/components/JSONFormatter';
import { JSONGuideContent } from '@/components/JSONGuideContent';
import { getJsonGuide } from '@/content/json-guides';
import NotFound from './NotFound';

/** /json/<slug> — the formatter opened in a specific mode, followed by reference material for it. */
const JSONGuidePage = () => {
    const { guide: slug } = useParams();
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
