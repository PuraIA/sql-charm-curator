import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, FileText, AlertTriangle, Globe, Ban, Link2, Users, Mail } from 'lucide-react';
import { SEO } from '@/components/SEO';

const Terms = () => {
  const { t } = useTranslation();

  const sections = [
    {
      icon: <FileText className="w-5 h-5 text-primary" />,
      title: t('termsIntroTitle'),
      content: t('termsIntroContent'),
    },
    {
      icon: <Shield className="w-5 h-5 text-primary" />,
      title: t('termsUsageTitle'),
      content: t('termsUsageContent'),
    },
    {
      icon: <Ban className="w-5 h-5 text-primary" />,
      title: t('termsProhibitedTitle'),
      content: t('termsProhibitedContent'),
      list: [
        t('termsProhibitedItem1'),
        t('termsProhibitedItem2'),
        t('termsProhibitedItem3'),
        t('termsProhibitedItem4'),
        t('termsProhibitedItem5'),
      ],
    },
    {
      icon: <Globe className="w-5 h-5 text-primary" />,
      title: t('termsIpTitle'),
      content: t('termsIpContent'),
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-primary" />,
      title: t('termsDisclaimerTitle'),
      content: t('termsDisclaimerContent'),
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      title: t('termsLiabilityTitle'),
      content: t('termsLiabilityContent'),
    },
    {
      icon: <Users className="w-5 h-5 text-primary" />,
      title: t('termsAdvertisingTitle'),
      content: t('termsAdvertisingContent'),
    },
    {
      icon: <Link2 className="w-5 h-5 text-primary" />,
      title: t('termsThirdPartyTitle'),
      content: t('termsThirdPartyContent'),
    },
    {
      icon: <Globe className="w-5 h-5 text-primary" />,
      title: t('termsGoverningTitle'),
      content: t('termsGoverningContent'),
    },
    {
      icon: <FileText className="w-5 h-5 text-primary" />,
      title: t('termsChangesTitle'),
      content: t('termsChangesContent'),
    },
    {
      icon: <Mail className="w-5 h-5 text-primary" />,
      title: t('termsContactTitle'),
      content: t('termsContactContent'),
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <SEO
        title={`${t('termsTitle')} - Pretty Format`}
        description={t('termsIntroContent')}
        keywords={t('termsKeywords')}
      />
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('backToHome')}
            </Button>
          </Link>
        </div>

        <div className="glass-card p-8 md:p-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">{t('termsTitle')}</h1>
          </div>

          <p className="text-muted-foreground mb-10 text-sm">
            {t('termsLastUpdated')}: September 4, 2026 &mdash; {t('termsEffectiveDate')}
          </p>

          <p className="text-muted-foreground leading-relaxed mb-10 border-l-4 border-primary/40 pl-4">
            {t('termsPreface')}
          </p>

          <div className="space-y-10">
            {sections.map((section, i) => (
              <section key={i} className="prose prose-slate dark:prose-invert max-w-none">
                <div className="flex items-center gap-2 mb-3 not-prose">
                  {section.icon}
                  <h2 className="text-xl font-semibold m-0">
                    {i + 1}. {section.title}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                {section.list && (
                  <ul className="mt-3 space-y-2 text-muted-foreground">
                    {section.list.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-12 p-6 bg-secondary/20 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground text-center">
              {t('termsFooter')}{' '}
              <a
                href="mailto:contact@prettyformat.com"
                className="text-primary underline hover:text-primary/80"
              >
                contact@prettyformat.com
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/">
            <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/10">
              <ArrowLeft className="w-4 h-4" />
              {t('backToHome')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
