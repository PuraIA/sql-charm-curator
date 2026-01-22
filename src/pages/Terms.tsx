import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
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
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">{t('termsTitle')}</h1>
          </div>

          <p className="text-muted-foreground mb-8">
            {t('termsLastUpdated')}: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">{t('termsIntroTitle')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('termsIntroContent')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">{t('termsUsageTitle')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('termsUsageContent')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">{t('termsDisclaimerTitle')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('termsDisclaimerContent')}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
