import {getRequestConfig} from 'next-intl/server';
import {defaultLocale, locales} from './config';

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;
  const resolvedLocale = locales.includes(locale as never) ? locale : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default
  };
});
