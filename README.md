# Vozilo.ba

Modern vehicle management platform and automotive community for Bosnia and Herzegovina.

## Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, next-intl
- Backend: NestJS, TypeScript, Prisma, PostgreSQL
- Local services: Redis, MinIO

## Local Development

Create `.env` from `.env.example`, then run:

```bash
docker compose up -d
```

URLs:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API docs: http://localhost:3001/api
- MinIO console: http://localhost:9001

For frontend-only development:

```bash
npm install
npm run dev:frontend
```
