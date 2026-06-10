# Local Setup And Development Workflow

This guide explains how to work on Vozilo.ba locally.

## Requirements

Install:

- Node.js 22 or newer
- npm
- Docker Desktop or Docker Engine
- Git

Check versions:

```bash
node -v
npm -v
docker --version
docker compose version
git --version
```

## Project Structure

```text
apps/frontend   Next.js app
apps/backend    NestJS API
apps/backend/prisma/schema.prisma
docker-compose.yml
messages        Translation files live inside apps/frontend/src/messages
```

Important files:

```text
apps/frontend/src/messages/bs.json
apps/frontend/src/messages/en.json
apps/frontend/src/app/[locale]/page.tsx
apps/backend/src/main.ts
apps/backend/src/app.controller.ts
apps/backend/prisma/schema.prisma
```

## First Setup

Install dependencies:

```bash
npm install
```

Create environment files if they do not exist:

```bash
cp .env.example .env
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item .env.example .env.local
```

## Run Everything With Docker

Start the full stack:

```bash
docker compose up -d --build
```

Open:

```text
Frontend:     http://localhost:3000
Backend:      http://localhost:3001
API docs:     http://localhost:3001/api
Health check: http://localhost:3001/health
MinIO:        http://localhost:9001
```

Stop:

```bash
docker compose down
```

Stop and remove volumes:

```bash
docker compose down -v
```

Only use `down -v` when you are okay deleting local database and MinIO data.

## Run Frontend Only

Use this when you are working mainly on UI:

```bash
npm run dev:frontend
```

Default URL:

```text
http://localhost:3000
```

If port `3000` is busy:

```bash
npm exec --workspace @vozilo/frontend -- next dev -p 3002
```

Then open:

```text
http://127.0.0.1:3002/bs
http://127.0.0.1:3002/en
```

## Run Backend Only

Start database services first:

```bash
docker compose up -d postgres redis minio
```

Run backend:

```bash
npm run dev:backend
```

Open:

```text
http://localhost:3001/health
http://localhost:3001/api
```

## Localization Rules

Bosnian is the default language. English is secondary.

Do not hardcode user-facing text in components. Add translations to:

```text
apps/frontend/src/messages/bs.json
apps/frontend/src/messages/en.json
```

Routes:

```text
/       Bosnian default
/bs     Bosnian
/en     English
```

When adding new UI text:

1. Add the Bosnian translation.
2. Add the English translation.
3. Read it with `next-intl`.
4. Build the app to catch missing keys.

## Common Commands

Build everything:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Test:

```bash
npm run test
```

Format:

```bash
npm run format
```

Generate Prisma client:

```bash
npm run prisma:generate --workspace @vozilo/backend
```

Run Prisma migrations when migrations are added:

```bash
npm run prisma:migrate --workspace @vozilo/backend
```

## Adding Backend Features

Feature modules should follow the planned backend structure:

```text
auth
users
vehicles
maintenance
expenses
reminders
workshops
reviews
forum
ai-assistant
admin
```

Use DTOs with validation decorators from `class-validator`.

Every database table should include:

```text
id
createdAt
updatedAt
deletedAt
```

Never store plain text passwords. Use bcrypt hashing.

## Adding Frontend Features

Frontend feature folders should follow:

```text
src/features/auth
src/features/vehicles
src/features/maintenance
src/features/expenses
src/features/reminders
src/features/workshops
src/features/forum
src/features/ai-assistant
src/features/admin
```

Design rules:

- Mobile-first.
- Dark mode by default.
- Accessible buttons, labels, and focus states.
- Use translated text only.
- Keep pages fast and responsive.

## Debugging

Check Docker services:

```bash
docker compose ps
```

View backend logs:

```bash
docker compose logs -f backend
```

View frontend logs:

```bash
docker compose logs -f frontend
```

View database logs:

```bash
docker compose logs -f postgres
```

Rebuild a service:

```bash
docker compose up -d --build backend
docker compose up -d --build frontend
```

## Before Committing

Run:

```bash
npm run lint
npm run test
npm run build
```

Commit only when all three pass.
