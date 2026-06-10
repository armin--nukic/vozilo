# Vozilo.ba Development Standards

## Technology Stack

Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- next-intl

Backend

- NestJS
- TypeScript

Database

- PostgreSQL

ORM

- Prisma

Authentication

- JWT
- Refresh Tokens

Storage

- MinIO (S3 compatible)

Caching

- Redis

Search

- PostgreSQL Full Text Search

Maps

- OpenStreetMap
- Leaflet

Containerization

- Docker
- Docker Compose

CI/CD

- GitHub Actions

---

## Localization

The entire application must support:

### Bosnian

Default language.

### English

Secondary language.

All text must use translation files.

Examples:

/messages/bs.json
/messages/en.json

No hardcoded strings are allowed.

---

## Architecture

Frontend Structure

src/

- app
- components
- features
- hooks
- services
- lib
- types
- messages

Features:

- auth
- vehicles
- maintenance
- expenses
- reminders
- workshops
- forum
- ai-assistant
- admin

Backend Modules:

- auth
- users
- vehicles
- maintenance
- expenses
- reminders
- workshops
- reviews
- forum
- ai-assistant
- admin

---

## Database Rules

Every table must contain:

- id
- createdAt
- updatedAt

Soft delete support:

- deletedAt

Indexes must be added for:

- vehicles
- workshops
- reviews
- forum topics

---

## Security

Requirements:

- bcrypt password hashing
- JWT expiration
- Refresh tokens
- Rate limiting
- CSRF protection
- Input validation
- Audit logging

Never store plain text passwords.

---

## Docker Requirements

The project must run using a single command.

Command:

docker compose up -d

Required services:

- frontend
- backend
- postgres
- redis
- minio

No external dependencies should be required for local development.

---

## Docker Compose Requirements

Environment files:

.env
.env.local

The entire stack must start locally.

Required URLs:

Frontend:
http://localhost:3000

Backend:
http://localhost:3001

API Docs:
http://localhost:3001/api

MinIO:
http://localhost:9001

---

## Testing

Unit Tests

- Jest

E2E Tests

- Playwright

Coverage target:

80%+

---

## Accessibility

Requirements:

- WCAG compliance
- Keyboard navigation
- Screen reader support

---

## Performance

Target:

- Lighthouse score > 90
- First load < 2 seconds
- Mobile optimized

---

## Future Roadmap

Phase 1

- Authentication
- Vehicles
- Service history
- Workshop directory
- Forum

Phase 2

- AI mechanic
- Reviews
- Common issues database

Phase 3

- Mobile applications
- Push notifications

Phase 4

- Marketplace
- Insurance integrations
- Registration integrations
- Vehicle valuation

All new features must remain Docker compatible and deployable on AWS, Azure, Hetzner and local environments without code changes.
