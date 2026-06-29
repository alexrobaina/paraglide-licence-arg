'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n/provider';

export default function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={t('header.langToggle')}
      onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
      className="gap-1.5"
    >
      <Languages className="h-4 w-4" />
      <span className="text-xs font-semibold uppercase">{locale}</span>
    </Button>
  );
}
