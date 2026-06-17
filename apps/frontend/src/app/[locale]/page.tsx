import {getTranslations, setRequestLocale} from 'next-intl/server';
import {HomeClient} from './home-client';

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return <HomeClient copy={t.raw('app')} />;
}
