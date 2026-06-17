import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {Manrope} from 'next/font/google';
import {notFound} from 'next/navigation';
import {locales, type Locale} from '@/i18n/config';
import '../globals.css';

const manrope = Manrope({subsets: ['latin', 'latin-ext']});

export const metadata: Metadata = {
  title: 'Vozilo.ba',
  description: 'Vehicle management platform and automotive community for Bosnia and Herzegovina.'
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

function isLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className={manrope.className}>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
