'use client';

import {Languages} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('navigation');
  const nextLocale = locale === 'bs' ? 'en' : 'bs';

  function switchLocale() {
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'bs' || segments[0] === 'en') {
      segments[0] = nextLocale;
    } else {
      segments.unshift(nextLocale);
    }
    router.push(`/${segments.join('/')}`);
  }

  return (
    <Button variant="secondary" onClick={switchLocale} aria-label={t('language')}>
      <Languages size={18} aria-hidden="true" />
      {nextLocale.toUpperCase()}
    </Button>
  );
}
