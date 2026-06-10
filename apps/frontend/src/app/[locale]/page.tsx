import {
  Bell,
  Bot,
  CalendarCheck,
  Car,
  ChartNoAxesCombined,
  Gauge,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Wrench
} from 'lucide-react';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {LanguageSwitcher} from '@/components/language-switcher';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';

const moduleIcons = [Car, Wrench, ChartNoAxesCombined, Bell, MapPin, ShieldCheck, MessageSquareText, Bot];

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const modules = t.raw('modules') as {title: string; description: string}[];
  const stats = t.raw('stats') as {value: string; label: string}[];
  const reminders = t.raw('reminders') as string[];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
      <nav className="flex items-center justify-between gap-3 py-2" aria-label={t('navLabel')}>
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-md bg-primary text-primaryForeground">
            <Gauge size={24} aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-bold leading-tight">{t('brand')}</p>
            <p className="text-xs text-muted">{t('market')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button variant="secondary">{t('login')}</Button>
        </div>
      </nav>

      <section className="grid flex-1 items-center gap-6 py-8 lg:grid-cols-[1fr_0.86fr] lg:py-12">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex rounded-md border border-border bg-white/5 px-3 py-2 text-sm font-semibold text-primary">
            {t('eyebrow')}
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{t('headline')}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{t('subheadline')}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button>{t('primaryAction')}</Button>
            <Button variant="secondary">{t('secondaryAction')}</Button>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border bg-white/[0.04] p-4">
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-border p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted">{t('dashboard.vehicleLabel')}</p>
                <h2 className="mt-1 text-2xl font-black">{t('dashboard.vehicle')}</h2>
              </div>
              <div className="rounded-md bg-primary/15 px-3 py-2 text-sm font-bold text-primary">
                {t('dashboard.status')}
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/[0.04] p-4">
                <p className="text-sm text-muted">{t('dashboard.mileage')}</p>
                <p className="mt-2 text-2xl font-black">142.400 km</p>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-4">
                <p className="text-sm text-muted">{t('dashboard.costs')}</p>
                <p className="mt-2 text-2xl font-black">2.180 KM</p>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center gap-2">
                <CalendarCheck size={18} className="text-primary" aria-hidden="true" />
                <h3 className="font-bold">{t('dashboard.remindersTitle')}</h3>
              </div>
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div key={reminder} className="flex items-center gap-3 rounded-md bg-white/[0.04] p-3 text-sm">
                    <Bell size={16} className="shrink-0 text-primary" aria-hidden="true" />
                    <span>{reminder}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="pb-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">{t('modulesEyebrow')}</p>
            <h2 className="mt-1 text-2xl font-black">{t('modulesTitle')}</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((module, index) => {
            const Icon = moduleIcons[index];
            return (
              <Card key={module.title} className="p-4">
                <Icon size={22} className="text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-bold">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{module.description}</p>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
