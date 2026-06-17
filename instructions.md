# Vozilo.ba generalne instrukcije

## Lokalno pokretanje

Najjednostavnije:

```bash
docker compose up -d --build
```

Provjeri:

```bash
docker compose ps
curl http://localhost:3001/health
curl http://localhost:3001/reports/sample
```

Frontend:

```txt
http://localhost:3000/bs
http://localhost:3000/en
```

Ako je port `3000` zauzet:

```bash
FRONTEND_PORT=3002 docker compose up -d frontend
```

Na Windows PowerShell:

```powershell
$env:FRONTEND_PORT='3002'
docker compose up -d frontend
```

## Glavne funkcije trenutno

- Registracija i login preko backend-a
- Google SSO konfiguracijska osnova
- Dodavanje vozila u PostgreSQL bazu
- Free sample report bez prijave
- AI mehaničar demo analiza simptoma
- Forum teme demo + dodavanje teme u runtime memoriju
- Planovi: Free, Premium 5 KM/mj, Business
- Stripe Checkout osnova
- Dark/light mode

## Bitne API rute

```txt
GET  /health
GET  /api
POST /auth/register
POST /auth/login
GET  /auth/me
GET  /auth/google/url
POST /vehicles
GET  /vehicles
GET  /reports/sample
POST /ai/diagnose
GET  /forum/topics
POST /forum/topics
GET  /plans
POST /billing/checkout
```

## Test API-ja

Free report:

```bash
curl http://localhost:3001/reports/sample
```

Forum:

```bash
curl http://localhost:3001/forum/topics
```

AI:

```bash
curl -X POST http://localhost:3001/ai/diagnose \
  -H "Content-Type: application/json" \
  -d '{"vehicle":"Volkswagen Golf 7","symptoms":"Auto trese na leru i bijeli dim na hladnom startu"}'
```

Stripe checkout test bez ključeva:

```bash
curl -X POST http://localhost:3001/billing/checkout \
  -H "Content-Type: application/json" \
  -d '{"plan":"premium","customerEmail":"demo@vozilo.ba"}'
```

Ako Stripe nije konfigurisan, dobiješ jasnu poruku koje `.env` varijable fale.

## Prije commita

```bash
npm run lint
npm run test
npm run build
docker compose config --quiet
```

## Deploy

Za `vozilo.ice.hr` koristi:

```txt
deploy.vps.md
```

Za `vozilo.ice.lol` koristi:

```txt
vozilo-vps.md
```
