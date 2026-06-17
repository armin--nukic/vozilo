'use client';

import {useMemo, useState} from 'react';
import Image from 'next/image';
import {
  Bell,
  Bot,
  Car,
  Check,
  Download,
  LogIn,
  Moon,
  Plus,
  ShieldCheck,
  Sparkles,
  Sun,
  Wrench
} from 'lucide-react';
import {LanguageSwitcher} from '@/components/language-switcher';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';

type Copy = {
  brand: string;
  market: string;
  navLabel: string;
  login: string;
  logout: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryAction: string;
  secondaryAction: string;
  authTitle: string;
  authSubtitle: string;
  name: string;
  email: string;
  password: string;
  register: string;
  google: string;
  dashboardTitle: string;
  vehicleFormTitle: string;
  vehicleFormSubtitle: string;
  make: string;
  model: string;
  year: string;
  engine: string;
  mileage: string;
  plate: string;
  addVehicle: string;
  garage: string;
  report: string;
  reportAction: string;
  noVehicles: string;
  plansTitle: string;
  trial: string;
  premium: string;
  premiumPrice: string;
  premiumDescription: string;
  businessPrice: string;
  disclaimer: string;
  aiTitle: string;
  aiSubtitle: string;
  symptoms: string;
  diagnose: string;
  forumTitle: string;
  forumSubtitle: string;
  forumAction: string;
  forumNewTopic: string;
  topicTitle: string;
  checkout: string;
  stripeNote: string;
  sampleImageTitle: string;
  newFeaturesTitle: string;
  issuesTitle: string;
  issuesSubtitle: string;
  issuesAction: string;
  costEstimate: string;
  severity: string;
  timelineTitle: string;
  timelineAction: string;
  modulesTitle: string;
  modules: {title: string; description: string}[];
};

type Vehicle = {
  id: string;
  make: string;
  model: string;
  productionYear: number;
  engine: string;
  licensePlate?: string;
  currentMileage: number;
};

type User = {
  email: string;
  name?: string | null;
  plan: string;
  trialEndsAt?: string | null;
};

type ForumTopic = {
  id: string;
  brand: string;
  model: string;
  title: string;
  replies: number;
  votes: number;
};

type CommonIssue = {
  id: string;
  make: string;
  model: string;
  issue: string;
  symptoms: string[];
  severity: string;
  estimatedCostKm: {min: number; max: number};
  votes: number;
  recommendedAction: string;
};

type MaintenanceItem = {
  id: string;
  title: string;
  vehicle: string;
  dueIn: string;
  severity: string;
};

const makes = ['Volkswagen', 'Skoda', 'Audi', 'BMW', 'Mercedes-Benz', 'Toyota', 'Hyundai', 'Kia', 'Renault'];
const makeMarks: Record<string, string> = {
  Volkswagen: 'VW',
  Skoda: 'SK',
  Audi: 'AU',
  BMW: 'BM',
  'Mercedes-Benz': 'MB',
  Toyota: 'TY',
  Hyundai: 'HY',
  Kia: 'K',
  Renault: 'R'
};
const makeColors: Record<string, string> = {
  Volkswagen: 'from-blue-500 to-sky-300',
  Skoda: 'from-emerald-500 to-lime-300',
  Audi: 'from-zinc-200 to-zinc-500',
  BMW: 'from-sky-500 to-white',
  'Mercedes-Benz': 'from-slate-100 to-slate-500',
  Toyota: 'from-red-500 to-white',
  Hyundai: 'from-blue-700 to-cyan-300',
  Kia: 'from-red-600 to-zinc-100',
  Renault: 'from-yellow-300 to-amber-600'
};
const makeShapes: Record<string, string> = {
  Volkswagen: 'rounded-full',
  Skoda: 'rounded-[38%]',
  Audi: 'rounded-full',
  BMW: 'rounded-full',
  'Mercedes-Benz': 'rounded-xl',
  Toyota: 'rounded-full',
  Hyundai: 'rounded-[45%]',
  Kia: 'rounded-2xl',
  Renault: 'rounded-md'
};

export function HomeClient({copy}: {copy: Copy}) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [dark, setDark] = useState(true);
  const [token, setToken] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : window.localStorage.getItem('vozilo_token')
  );
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [message, setMessage] = useState('');
  const [authForm, setAuthForm] = useState({name: 'Demo Vozac', email: 'demo@vozilo.ba', password: 'Demo12345'});
  const [vehicleForm, setVehicleForm] = useState({
    make: 'Volkswagen',
    model: 'Golf 7',
    productionYear: 2018,
    engine: '2.0 TDI',
    licensePlate: 'A12-B-345',
    currentMileage: 142400
  });
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [aiSymptoms, setAiSymptoms] = useState('Golf 7 trese na leru i ponekad izbaci bijeli dim pri hladnom startu.');
  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null);
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([]);
  const [issues, setIssues] = useState<CommonIssue[]>([]);
  const [timeline, setTimeline] = useState<MaintenanceItem[]>([]);
  const [topicForm, setTopicForm] = useState({brand: 'Volkswagen', model: 'Golf 7', title: 'DSG vibration at low speed'});

  const authed = Boolean(token);
  const trialLabel = useMemo(() => {
    if (!user?.trialEndsAt) return copy.trial;
    return `${copy.trial}: ${new Date(user.trialEndsAt).toLocaleDateString()}`;
  }, [copy.trial, user?.trialEndsAt]);

  const apiBase =
    typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
      ? process.env.NEXT_PUBLIC_API_URL || `${window.location.origin}/api`
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444';

  function setTheme(nextDark: boolean) {
    setDark(nextDark);
    document.documentElement.classList.toggle('light', !nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
  }

  async function api(path: string, options: RequestInit = {}) {
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
        ...options.headers
      }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Request failed');
    }
    return data;
  }

  async function submitAuth() {
    try {
      setMessage('');
      const data = await api(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(authForm)
      });
      window.localStorage.setItem('vozilo_token', data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      await loadMe(data.accessToken);
      setMessage(mode === 'register' ? 'Account created. Free trial active.' : 'Logged in.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Auth failed');
    }
  }

  async function loadMe(nextToken = token) {
    if (!nextToken) return;
    const response = await fetch(`${apiBase}/auth/me`, {
      headers: {Authorization: `Bearer ${nextToken}`}
    });
    if (!response.ok) return;
    const data = await response.json();
    setUser(data);
    setVehicles(data.vehicles || []);
  }

  async function startGoogle() {
    const data = await api('/auth/google/url');
    if (data.url) {
      window.location.href = data.url;
    } else {
      setMessage(data.message || 'Google OAuth is not configured yet.');
    }
  }

  async function addVehicle() {
    try {
      const vehicle = await api('/vehicles', {
        method: 'POST',
        body: JSON.stringify(vehicleForm)
      });
      setVehicles((current) => [vehicle, ...current]);
      setMessage('Vehicle added.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Vehicle failed');
    }
  }

  async function generateReport() {
    try {
      setReport(await api('/reports/sample'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Report failed');
    }
  }

  async function diagnose() {
    try {
      setAiResult(
        await api('/ai/diagnose', {
          method: 'POST',
          body: JSON.stringify({
            symptoms: aiSymptoms,
            vehicle: `${vehicleForm.make} ${vehicleForm.model}`
          })
        })
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'AI failed');
    }
  }

  async function loadForum() {
    try {
      setForumTopics(await api('/forum/topics'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Forum failed');
    }
  }

  async function createTopic() {
    try {
      const topic = await api('/forum/topics', {
        method: 'POST',
        body: JSON.stringify(topicForm)
      });
      setForumTopics((current) => [topic, ...current]);
      setMessage('Forum topic created.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Forum topic failed');
    }
  }

  async function loadIssues(make?: string) {
    try {
      const path = make ? `/issues/common?make=${encodeURIComponent(make)}` : '/issues/common';
      setIssues(await api(path));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Issues failed');
    }
  }

  async function checkout(plan: 'premium' | 'business') {
    try {
      const data = await api('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({plan, customerEmail: user?.email || authForm.email})
      });
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.message || copy.stripeNote);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Checkout failed');
    }
  }

  async function loadTimeline() {
    try {
      setTimeline(await api('/maintenance/timeline'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Timeline failed');
    }
  }

  function logout() {
    window.localStorage.removeItem('vozilo_token');
    setToken(null);
    setUser(null);
    setVehicles([]);
    setReport(null);
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative">
        <Image
          src="/hero-automotive.png"
          alt=""
          fill
          priority
          className="pointer-events-none -z-10 object-cover opacity-35"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 via-background/92 to-background" />
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between gap-3 py-2" aria-label={copy.navLabel}>
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" width={48} height={48} alt="" aria-hidden="true" priority className="rounded-lg" />
              <div>
                <p className="text-base font-black leading-tight">{copy.brand}</p>
                <p className="text-xs text-muted">{copy.market}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setTheme(!dark)} aria-label="Theme">
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
              <LanguageSwitcher />
              {authed ? (
                <Button variant="secondary" onClick={logout}>
                  {copy.logout}
                </Button>
              ) : null}
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-6 py-8 lg:grid-cols-[1fr_420px]">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex rounded-md border border-border bg-white/5 px-3 py-2 text-sm font-bold text-primary">
                <Sparkles size={16} /> <span className="ml-2">{copy.eyebrow}</span>
              </p>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{copy.headline}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{copy.subheadline}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => document.getElementById('garage')?.scrollIntoView({behavior: 'smooth'})}>
                  <Plus size={18} />
                  {copy.primaryAction}
                </Button>
                <Button variant="secondary" onClick={generateReport}>
                  <Download size={18} />
                  {copy.secondaryAction}
                </Button>
              </div>
            </div>

            <Card className="p-5">
              <div className="mb-5 flex items-center gap-3">
                <LogIn className="text-primary" />
                <div>
                  <h2 className="text-xl font-black">{authed ? copy.dashboardTitle : copy.authTitle}</h2>
                  <p className="text-sm text-muted">{authed ? user?.email : copy.authSubtitle}</p>
                </div>
              </div>

              {!authed ? (
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant={mode === 'register' ? 'primary' : 'secondary'} onClick={() => setMode('register')}>
                      {copy.register}
                    </Button>
                    <Button variant={mode === 'login' ? 'primary' : 'secondary'} onClick={() => setMode('login')}>
                      {copy.login}
                    </Button>
                  </div>
                  {mode === 'register' ? (
                    <input
                      className="rounded-md border border-border bg-white/5 px-3 py-3"
                      placeholder={copy.name}
                      value={authForm.name}
                      onChange={(event) => setAuthForm({...authForm, name: event.target.value})}
                    />
                  ) : null}
                  <input
                    className="rounded-md border border-border bg-white/5 px-3 py-3"
                    placeholder={copy.email}
                    value={authForm.email}
                    onChange={(event) => setAuthForm({...authForm, email: event.target.value})}
                  />
                  <input
                    className="rounded-md border border-border bg-white/5 px-3 py-3"
                    placeholder={copy.password}
                    type="password"
                    value={authForm.password}
                    onChange={(event) => setAuthForm({...authForm, password: event.target.value})}
                  />
                  <Button onClick={submitAuth}>{mode === 'register' ? copy.register : copy.login}</Button>
                  <Button variant="secondary" onClick={startGoogle}>
                    <ShieldCheck size={18} />
                    {copy.google}
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  <div className="rounded-lg border border-border bg-white/[0.04] p-4">
                    <p className="text-sm text-muted">{trialLabel}</p>
                    <p className="mt-2 text-2xl font-black">{copy.premiumPrice}</p>
                    <p className="mt-1 text-sm text-muted">{copy.premiumDescription}</p>
                  </div>
                  <Button onClick={() => loadMe()}>{copy.garage}</Button>
                </div>
              )}
              {message ? <p className="mt-4 rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</p> : null}
            </Card>
          </div>

          <div className="grid gap-4 pb-8 lg:grid-cols-[1fr_0.85fr]">
            <Card className="overflow-hidden">
              <div className="relative min-h-72">
                <Image src="/diagnostic-sample.png" alt="" fill className="object-cover" />
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="text-2xl font-black">{copy.sampleImageTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{copy.disclaimer}</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-lg border border-border bg-white/[0.04] p-4">
                  <p className="text-sm font-bold text-primary">AI mechanic</p>
                  <p className="mt-1 text-sm text-muted">Symptoms to causes to severity to next steps</p>
                </div>
                <div className="rounded-lg border border-border bg-white/[0.04] p-4">
                  <p className="text-sm font-bold text-primary">Free report</p>
                  <p className="mt-1 text-sm text-muted">Works before registration with demo data.</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="overflow-hidden pb-8">
            <div className="brand-track flex w-max gap-3">
              {[...makes, ...makes].map((make, index) => (
                <button
                  key={`${make}-${index}`}
                  className="flex min-w-44 items-center gap-3 rounded-lg border border-border bg-panel/80 p-3 shadow-soft backdrop-blur"
                  onClick={() => loadIssues(make)}
                >
                  <span
                    className={`flex size-12 items-center justify-center bg-gradient-to-br ${makeColors[make]} ${makeShapes[make]} text-xs font-black text-slate-950 shadow-sm ring-2 ring-white/40`}
                  >
                    <span className={`flex size-8 items-center justify-center bg-white/85 ${makeShapes[make]}`}>
                      {makeMarks[make]}
                    </span>
                  </span>
                  <span className="text-sm font-black">{make}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="garage" className="mx-auto grid w-full max-w-7xl gap-4 px-4 pb-10 sm:px-6 lg:grid-cols-[420px_1fr] lg:px-8">
        <Card className="p-5">
          <h2 className="text-xl font-black">{copy.vehicleFormTitle}</h2>
          <p className="mt-1 text-sm text-muted">{copy.vehicleFormSubtitle}</p>
          <div className="mt-5 grid gap-3">
            <div className="grid grid-cols-3 gap-2">
              {makes.map((make) => (
                <button
                  key={make}
                  className={`rounded-lg border p-3 text-left transition ${
                    vehicleForm.make === make ? 'border-primary bg-primary/15' : 'border-border bg-white/[0.03]'
                  }`}
                  onClick={() => setVehicleForm({...vehicleForm, make})}
                >
                  <span
                    className={`flex size-11 items-center justify-center rounded-full bg-gradient-to-br ${makeColors[make]} text-xs font-black text-slate-950 shadow-sm ring-2 ring-white/30`}
                  >
                    <span className="flex size-8 items-center justify-center rounded-full bg-white/85">
                      {makeMarks[make]}
                    </span>
                  </span>
                  <span className="mt-2 block text-xs font-bold">{make}</span>
                </button>
              ))}
            </div>
            <input className="rounded-md border border-border bg-white/5 px-3 py-3" placeholder={copy.model} value={vehicleForm.model} onChange={(event) => setVehicleForm({...vehicleForm, model: event.target.value})} />
            <input className="rounded-md border border-border bg-white/5 px-3 py-3" placeholder={copy.engine} value={vehicleForm.engine} onChange={(event) => setVehicleForm({...vehicleForm, engine: event.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <input className="rounded-md border border-border bg-white/5 px-3 py-3" placeholder={copy.year} type="number" value={vehicleForm.productionYear} onChange={(event) => setVehicleForm({...vehicleForm, productionYear: Number(event.target.value)})} />
              <input className="rounded-md border border-border bg-white/5 px-3 py-3" placeholder={copy.mileage} type="number" value={vehicleForm.currentMileage} onChange={(event) => setVehicleForm({...vehicleForm, currentMileage: Number(event.target.value)})} />
            </div>
            <input className="rounded-md border border-border bg-white/5 px-3 py-3" placeholder={copy.plate} value={vehicleForm.licensePlate} onChange={(event) => setVehicleForm({...vehicleForm, licensePlate: event.target.value})} />
            <Button onClick={addVehicle} disabled={!authed}>
              <Plus size={18} />
              {copy.addVehicle}
            </Button>
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-black">{copy.timelineTitle}</h2>
              <Button variant="secondary" onClick={loadTimeline}>
                {copy.timelineAction}
              </Button>
            </div>
            <div className="grid gap-3">
              {(timeline.length
                ? timeline
                : [
                    {id: 'oil-service', title: 'Oil service', vehicle: 'Volkswagen Golf 7 2.0 TDI', dueIn: '1,600 km', severity: 'medium'},
                    {id: 'registration', title: 'Registration renewal', vehicle: 'Skoda Karoq 2.0 TDI', dueIn: '28 days', severity: 'high'}
                  ]
              ).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white/[0.04] p-4">
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-sm text-muted">{item.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">{item.dueIn}</p>
                    <p className="text-xs text-muted">{item.severity}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-black">{copy.garage}</h2>
              <Button variant="secondary" onClick={generateReport}>
                {copy.reportAction}
              </Button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {vehicles.length ? (
                vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="rounded-lg border border-border bg-white/[0.04] p-4">
                    <Car className="text-primary" />
                    <h3 className="mt-3 text-lg font-black">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-sm text-muted">
                      {vehicle.productionYear} · {vehicle.engine} · {vehicle.currentMileage.toLocaleString()} km
                    </p>
                    <p className="mt-2 text-sm">{vehicle.licensePlate}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted">{copy.noVehicles}</p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-xl font-black">{copy.report}</h2>
            <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {JSON.stringify(report || {status: copy.reportAction, example: 'Login, add a vehicle, then generate.'}, null, 2)}
            </pre>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <Bot className="text-primary" />
            <div>
              <h2 className="text-xl font-black">{copy.aiTitle}</h2>
              <p className="text-sm text-muted">{copy.aiSubtitle}</p>
            </div>
          </div>
          <textarea
            className="min-h-32 w-full rounded-md border border-border bg-white/5 px-3 py-3"
            placeholder={copy.symptoms}
            value={aiSymptoms}
            onChange={(event) => setAiSymptoms(event.target.value)}
          />
          <Button className="mt-3 w-full" onClick={diagnose}>
            <Bot size={18} />
            {copy.diagnose}
          </Button>
          <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            {JSON.stringify(
              aiResult || {
                exampleSymptoms: aiSymptoms,
                possibleCauses: ['engine mount', 'injector imbalance', 'EGR/turbo check'],
                severity: 'medium',
                nextActions: ['scan OBD codes', 'check service history', 'book diagnostics']
              },
              null,
              2
            )}
          </pre>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
          <Card className="overflow-hidden">
            <div className="relative min-h-80">
              <Image src="/common-issues.png" alt="" fill className="object-cover" />
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-black">{copy.issuesTitle}</h2>
                <p className="mt-1 text-sm text-muted">{copy.issuesSubtitle}</p>
              </div>
              <Button variant="secondary" onClick={() => loadIssues()}>
                {copy.issuesAction}
              </Button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {(issues.length
                ? issues
                : [
                    {
                      id: 'demo-dsg',
                      make: 'Volkswagen',
                      model: 'Golf 7',
                      issue: 'DSG mechatronic hesitation',
                      symptoms: ['jerking at low speed', 'delayed engagement'],
                      severity: 'high',
                      estimatedCostKm: {min: 450, max: 1600},
                      votes: 128,
                      recommendedAction: 'Scan transmission codes and inspect DSG service history.'
                    },
                    {
                      id: 'demo-bmw-chain',
                      make: 'BMW',
                      model: 'F30',
                      issue: 'Timing chain noise',
                      symptoms: ['cold-start rattle', 'rough idle'],
                      severity: 'high',
                      estimatedCostKm: {min: 900, max: 2400},
                      votes: 97,
                      recommendedAction: 'Book specialist inspection before long trips.'
                    }
                  ]
              ).map((issue) => (
                <div key={issue.id} className="rounded-lg border border-border bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-primary">
                      {issue.make} / {issue.model}
                    </p>
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-black text-primary">
                      {issue.votes} votes
                    </span>
                  </div>
                  <h3 className="mt-2 font-black">{issue.issue}</h3>
                  <p className="mt-2 text-sm text-muted">{issue.symptoms.join(', ')}</p>
                  <p className="mt-3 text-sm">
                    {copy.severity}: <b>{issue.severity}</b>
                  </p>
                  <p className="text-sm">
                    {copy.costEstimate}: {issue.estimatedCostKm.min}-{issue.estimatedCostKm.max} KM
                  </p>
                  <p className="mt-3 text-sm text-muted">{issue.recommendedAction}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Card className="p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black">{copy.forumTitle}</h2>
              <p className="mt-1 text-sm text-muted">{copy.forumSubtitle}</p>
            </div>
            <Button variant="secondary" onClick={loadForum}>
              {copy.forumAction}
            </Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {(forumTopics.length
              ? forumTopics
              : [
                  {id: 'demo-1', brand: 'Skoda', model: 'Karoq', title: 'Oil leak from oil pan', replies: 12, votes: 34},
                  {
                    id: 'demo-2',
                    brand: 'Volkswagen',
                    model: 'Golf 7',
                    title: 'DSG gearbox issues at low speed',
                    replies: 28,
                    votes: 51
                  },
                  {id: 'demo-3', brand: 'BMW', model: 'F30', title: 'Timing chain noise on cold start', replies: 19, votes: 43}
                ]
            ).map((topic) => (
              <div key={topic.id} className="rounded-lg border border-border bg-white/[0.04] p-4">
                <p className="text-xs font-bold text-primary">
                  {topic.brand} / {topic.model}
                </p>
                <h3 className="mt-2 font-black">{topic.title}</h3>
                <p className="mt-3 text-sm text-muted">
                  {topic.replies} replies | {topic.votes} votes
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 border-t border-border pt-5 md:grid-cols-[1fr_1fr_1.4fr_auto]">
            <input
              className="rounded-md border border-border bg-white/5 px-3 py-3"
              placeholder={copy.make}
              value={topicForm.brand}
              onChange={(event) => setTopicForm({...topicForm, brand: event.target.value})}
            />
            <input
              className="rounded-md border border-border bg-white/5 px-3 py-3"
              placeholder={copy.model}
              value={topicForm.model}
              onChange={(event) => setTopicForm({...topicForm, model: event.target.value})}
            />
            <input
              className="rounded-md border border-border bg-white/5 px-3 py-3"
              placeholder={copy.topicTitle}
              value={topicForm.title}
              onChange={(event) => setTopicForm({...topicForm, title: event.target.value})}
            />
            <Button onClick={createTopic}>{copy.forumNewTopic}</Button>
          </div>
        </Card>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 pb-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <Card className="animate-float overflow-hidden">
          <div className="relative min-h-80">
            <Image src="/premium-offer.png" alt="" fill className="object-cover" />
          </div>
        </Card>
        <div className="grid gap-4 lg:grid-cols-3">
        {[
          ['Free', '0 KM', copy.trial, ['One vehicle', 'Forum', 'Workshop search']],
          [copy.premium, copy.premiumPrice, copy.premiumDescription, ['Unlimited vehicles', 'AI mechanic', 'PDF reports']],
          ['Business', copy.businessPrice, 'For workshops', ['Profile', 'Featured placement', 'Appointment requests']]
        ].map(([title, price, description, features], index) => (
          <Card key={title as string} className="p-5">
            <h3 className="text-xl font-black">{title as string}</h3>
            <p className="mt-2 text-3xl font-black text-primary">{price as string}</p>
            <p className="mt-2 text-sm text-muted">{description as string}</p>
            <div className="mt-5 grid gap-2">
              {(features as string[]).map((feature) => (
                <p key={feature} className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-primary" /> {feature}
                </p>
              ))}
            </div>
            {index > 0 ? (
              <Button className="mt-5 w-full" onClick={() => checkout(index === 1 ? 'premium' : 'business')}>
                {copy.checkout}
              </Button>
            ) : null}
          </Card>
        ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-2xl font-black">{copy.newFeaturesTitle}</h2>
        <div className="mb-8 grid gap-3 md:grid-cols-3">
          {['Service reminders timeline', 'Workshop shortlist', 'Common issue voting'].map((feature) => (
            <Card key={feature} className="p-4">
              <Sparkles size={20} className="text-primary" />
              <p className="mt-3 font-bold">{feature}</p>
              <p className="mt-2 text-sm text-muted">Prepared UI concept for the next backend module.</p>
            </Card>
          ))}
        </div>
        <h2 className="text-2xl font-black">{copy.modulesTitle}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {copy.modules.map((module, index) => {
            const icons = [Car, Wrench, Bell, Bot];
            const Icon = icons[index % icons.length];
            return (
              <Card key={module.title} className="p-4">
                <Icon size={22} className="text-primary" />
                <h3 className="mt-4 font-bold">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{module.description}</p>
              </Card>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-muted">{copy.disclaimer}</p>
      </section>
    </main>
  );
}
