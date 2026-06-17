# Local deploy/test: kako pokrenuti cijeli Vozilo app

Ovaj dokument je za lokalno testiranje cijele aplikacije preko Docker Compose.

Kratak odgovor:

- prvi put ili poslije promjena u Dockerfile/package fajlovima koristi `docker compose up -d --build`
- poslije toga je obicno dovoljno `docker compose up -d`
- ako backend nece da ostane pokrenut, prvo gledaj `docker compose logs -f backend`

## 1. Sta Docker pokrece

`docker compose up -d` pokrece:

```txt
frontend   Next.js app
backend    NestJS API
postgres   baza
redis      cache
minio      S3-compatible storage
```

Default lokalni URL-ovi:

```txt
Frontend:      http://localhost:3000
Frontend BS:   http://localhost:3000/bs
Frontend EN:   http://localhost:3000/en
Backend:       http://localhost:3001
Health:        http://localhost:3001/health
API docs:      http://localhost:3001/api
MinIO console: http://localhost:9001
Postgres:      localhost:5432
Redis:         localhost:6379
```

## 2. Prvi setup

Instaliraj:

- Docker Desktop ili Docker Engine
- Node.js 22, ako hoces pokretati npm komande van Dockera
- Git

Provjera:

```bash
docker --version
docker compose version
node -v
npm -v
```

Ako nemas `.env`, napravi ga:

```bash
cp .env.example .env
```

Na Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## 3. Pokretanje cijelog app-a

Prvi put:

```bash
docker compose up -d --build
```

Svaki sljedeci put, ako nisi mijenjao dependencies ili Dockerfile:

```bash
docker compose up -d
```

Provjeri stanje:

```bash
docker compose ps
```

Svi servisi trebaju biti `running`. Backend moze kratko cekati dok Postgres ne bude healthy.

## 4. Test da sve radi

Backend health:

```bash
curl http://localhost:3001/health
```

Ocekivano:

```json
{
  "status": "ok",
  "service": "vozilo-api"
}
```

API docs:

```bash
curl -I http://localhost:3001/api
```

Frontend:

```bash
curl -I http://localhost:3000/
curl -I http://localhost:3000/bs
curl -I http://localhost:3000/en
```

U browseru otvori:

```txt
http://localhost:3000
http://localhost:3000/bs
http://localhost:3000/en
http://localhost:3001/api
```

## 5. Najbitnije debug komande

Svi logovi:

```bash
docker compose logs -f
```

Backend log:

```bash
docker compose logs -f backend
```

Frontend log:

```bash
docker compose logs -f frontend
```

Postgres log:

```bash
docker compose logs -f postgres
```

Zadnjih 100 linija backend-a:

```bash
docker compose logs --tail=100 backend
```

## 6. Ako backend nije pokrenut

Prvo:

```bash
docker compose ps
docker compose logs --tail=100 backend
docker compose logs --tail=100 postgres
```

Najcesci uzrok je da backend krene prije baze. To je popravljeno tako da:

- Postgres ima healthcheck
- backend ceka healthy Postgres
- Prisma konekcija ima retry pri startu

Ako i dalje ne radi, restartuj:

```bash
docker compose restart postgres
docker compose restart backend
```

Ako treba fresh rebuild:

```bash
docker compose build backend --no-cache
docker compose up -d backend
```

## 7. Ako frontend nije pokrenut

Provjeri:

```bash
docker compose logs --tail=100 frontend
```

Rebuild:

```bash
docker compose build frontend --no-cache
docker compose up -d frontend
```

Test:

```bash
curl -I http://localhost:3000/
```

## 8. Kompletan reset lokalnog Docker-a

Ovo brise kontejnere, ali cuva volume podatke:

```bash
docker compose down
docker compose up -d --build
```

Ovo brise i bazu i MinIO podatke:

```bash
docker compose down -v
docker compose up -d --build
```

Koristi `down -v` samo ako hoces skroz cistu lokalnu bazu.

## 9. Lokalni npm workflow bez Dockera

Ako radis samo frontend:

```bash
npm install
npm run dev:frontend
```

Ako je port `3000` zauzet:

```bash
npm exec --workspace @vozilo/frontend -- next dev -p 3002
```

Ako radis backend lokalno, prvo digni servise:

```bash
docker compose up -d postgres redis minio
npm run dev:backend
```

## 10. Verifikacija prije push/deploy

Pokreni:

```bash
npm run lint
npm run test
npm run build
docker compose config --quiet
```

Ako sve prodje, projekat je spreman za commit i deploy.

## 11. Brza komanda za svaki dan

Najcesce ti treba samo:

```bash
docker compose up -d --build
docker compose ps
curl http://localhost:3001/health
```

Ako health vrati `ok` i frontend se otvara na `http://localhost:3000`, cijeli app fercera lokalno.
