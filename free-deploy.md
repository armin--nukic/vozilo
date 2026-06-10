# Free Deployment Guide

This project has a frontend, backend, PostgreSQL, Redis, and MinIO. A truly free deployment is easiest if you split services between free providers. A single full-stack Docker deployment with database, object storage, and Redis usually needs a VPS.

## Recommended Free Path

Use this path while Vozilo.ba is still early:

- Frontend: Vercel free tier
- Backend: Render, Railway, Fly.io, or a similar free/low-cost Node host
- Database: Supabase free PostgreSQL
- Redis: Upstash free Redis
- File storage: Cloudflare R2 free allowance, Supabase Storage, or another S3-compatible storage

This keeps local development Docker-based, while production uses hosted services.

## 1. Prepare Environment Variables

Create production values based on `.env.example`.

Required frontend variable:

```bash
NEXT_PUBLIC_API_URL=https://api.vozilo.ba
```

Required backend variables:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
REDIS_URL=redis://USER:PASSWORD@HOST:PORT
MINIO_ROOT_USER=production-user
MINIO_ROOT_PASSWORD=production-password
MINIO_ENDPOINT=your-s3-endpoint
MINIO_PORT=443
JWT_ACCESS_SECRET=use-a-long-random-secret
JWT_REFRESH_SECRET=use-another-long-random-secret
FRONTEND_ORIGIN=https://vozilo.ba
```

Never use the development secrets from `.env.example` in production.

## 2. Deploy Frontend To Vercel

1. Push the project to GitHub.
2. Open Vercel and import the GitHub repository.
3. Set the root directory to:

```text
apps/frontend
```

4. Add environment variable:

```bash
NEXT_PUBLIC_API_URL=https://api.vozilo.ba
```

5. Use these build settings if Vercel does not detect them automatically:

```bash
Build command: cd ../.. && npm install && npm run build --workspace @vozilo/frontend
Output: apps/frontend/.next
```

6. Add your domain:

```text
vozilo.ba
www.vozilo.ba
```

## 3. Deploy Backend To A Free Node Host

The backend is a NestJS app in `apps/backend`.

Build command:

```bash
npm install
npm run prisma:generate --workspace @vozilo/backend
npm run build --workspace @vozilo/backend
```

Start command:

```bash
npm run start --workspace @vozilo/backend
```

Set the service port to:

```bash
3001
```

Add all backend environment variables in the provider dashboard.

## 4. Database Setup

After creating a hosted PostgreSQL database, copy its connection string into `DATABASE_URL`.

Run migrations when migrations exist:

```bash
npm run prisma:migrate --workspace @vozilo/backend
```

For the current scaffold, generate Prisma client:

```bash
npm run prisma:generate --workspace @vozilo/backend
```

## 5. Connect Domains

Recommended production domains:

```text
vozilo.ba        frontend
www.vozilo.ba    frontend
api.vozilo.ba    backend
```

In DNS:

- Point `vozilo.ba` and `www.vozilo.ba` to the frontend provider.
- Point `api.vozilo.ba` to the backend provider.

## 6. Verify Production

Frontend:

```bash
https://vozilo.ba
https://vozilo.ba/en
```

Backend:

```bash
https://api.vozilo.ba/health
https://api.vozilo.ba/api
```

Expected health response:

```json
{
  "status": "ok",
  "service": "vozilo-api"
}
```

## Free Deployment Limits

Free hosting is good for testing, demos, and early validation. For production users, a VPS is better because this app needs PostgreSQL, Redis, MinIO, backend API, and frontend together.

Use `vps.md` when you want one stable server that can host Vozilo.ba together with other projects.
