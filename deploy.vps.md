# Deploy na VPS: vozilo.ice.hr

Ovaj dokument je za fresh clone i deploy projekta na VPS za domen:

```txt
https://vozilo.ice.hr
```

Pretpostavka:

- VPS ima Docker, Docker Compose, Nginx i Certbot
- domen `vozilo.ice.hr` pokazuje na IP servera
- aplikacija koristi Docker portove:

```txt
frontend 3200 -> container 3000
backend  4200 -> container 3001
postgres 55433
redis    56380
minio    9200
minio UI 9201
```

## 1. DNS

U DNS panelu dodaj:

```txt
vozilo.ice.hr    A    TVOJ_VPS_IP
```

Provjera:

```bash
nslookup vozilo.ice.hr
```

## 2. Clone

Na VPS-u:

```bash
cd /opt
git clone https://github.com/TVOJ_USERNAME/vozilo.ba.git vozilo
cd /opt/vozilo
```

Ako repo vec postoji:

```bash
cd /opt/vozilo
git pull
```

## 3. .env za VPS

Napravi:

```bash
cp .env.example .env
nano .env
```

Primjer:

```env
POSTGRES_USER=vozilo
POSTGRES_PASSWORD=promijeni_ovu_lozinku
POSTGRES_DB=vozilo
DATABASE_URL=postgresql://vozilo:promijeni_ovu_lozinku@postgres:5432/vozilo?schema=public

REDIS_URL=redis://redis:6379

MINIO_ROOT_USER=vozilo
MINIO_ROOT_PASSWORD=promijeni_ovu_minio_lozinku
MINIO_ENDPOINT=minio
MINIO_PORT=9000

JWT_ACCESS_SECRET=dug_random_secret_minimum_32_karaktera
JWT_REFRESH_SECRET=drugi_dug_random_secret_minimum_32_karaktera

NEXT_PUBLIC_API_URL=https://vozilo.ice.hr
FRONTEND_ORIGIN=https://vozilo.ice.hr

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://vozilo.ice.hr/auth/google/callback

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PREMIUM_PRICE_ID=
STRIPE_BUSINESS_PRICE_ID=

FRONTEND_BIND_IP=127.0.0.1
FRONTEND_PORT=3200
BACKEND_BIND_IP=127.0.0.1
BACKEND_PORT=4200
POSTGRES_BIND_IP=127.0.0.1
POSTGRES_PORT=55433
REDIS_BIND_IP=127.0.0.1
REDIS_PORT=56380
MINIO_BIND_IP=127.0.0.1
MINIO_PORT_PUBLIC=9200
MINIO_CONSOLE_BIND_IP=127.0.0.1
MINIO_CONSOLE_PORT=9201
```

## 4. Start

```bash
docker compose up -d --build
docker compose ps
```

Provjera lokalno na serveru:

```bash
curl http://127.0.0.1:4200/health
curl http://127.0.0.1:4200/reports/sample
curl http://127.0.0.1:4200/forum/topics
curl -I http://127.0.0.1:3200/bs
```

## 5. Nginx

Napravi config:

```bash
nano /etc/nginx/sites-available/vozilo.ice.hr
```

Stavi:

```nginx
server {
    listen 80;
    server_name vozilo.ice.hr;

    client_max_body_size 20m;

    location /api {
        proxy_pass http://127.0.0.1:4200/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /auth/ {
        proxy_pass http://127.0.0.1:4200/auth/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /vehicles {
        proxy_pass http://127.0.0.1:4200/vehicles;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /reports/ {
        proxy_pass http://127.0.0.1:4200/reports/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /forum/ {
        proxy_pass http://127.0.0.1:4200/forum/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ai/ {
        proxy_pass http://127.0.0.1:4200/ai/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /billing/ {
        proxy_pass http://127.0.0.1:4200/billing/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /health {
        proxy_pass http://127.0.0.1:4200/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /plans {
        proxy_pass http://127.0.0.1:4200/plans;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3200;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktiviraj:

```bash
ln -sf /etc/nginx/sites-available/vozilo.ice.hr /etc/nginx/sites-enabled/vozilo.ice.hr
nginx -t
systemctl reload nginx
```

## 6. SSL

```bash
certbot --nginx -d vozilo.ice.hr
```

Provjeri:

```bash
curl https://vozilo.ice.hr/health
curl https://vozilo.ice.hr/reports/sample
curl https://vozilo.ice.hr/forum/topics
```

## 7. Update poslije push-a

```bash
cd /opt/vozilo
git pull
docker compose up -d --build
docker compose ps
```

Ako frontend port zapne:

```bash
ss -tulpn | grep ':3200'
```

Ako backend ne radi:

```bash
docker compose logs --tail=120 backend
```
