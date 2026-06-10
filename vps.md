# VPS Deployment With Same IP As Other Projects

Use this guide when one VPS hosts multiple projects on the same public IP, for example:

```text
vozilo.ba
api.vozilo.ba
hidzama.ba
api.hidzama.ba
```

The correct setup is:

- One public VPS IP
- DNS records for each domain pointing to that IP
- One reverse proxy on ports `80` and `443`
- Each project running on internal Docker ports
- The reverse proxy routes traffic by domain name

## Recommended VPS Setup

Use Ubuntu 24.04 LTS or 22.04 LTS.

Install Docker:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git ufw
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc > /dev/null
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Log out and back in after adding your user to the Docker group.

## DNS Setup

At your domain registrar, create these records:

```text
A    vozilo.ba        YOUR_VPS_IP
A    www.vozilo.ba    YOUR_VPS_IP
A    api.vozilo.ba    YOUR_VPS_IP
A    hidzama.ba       YOUR_VPS_IP
A    www.hidzama.ba   YOUR_VPS_IP
A    api.hidzama.ba   YOUR_VPS_IP
```

All projects can share the same IP because the reverse proxy reads the requested domain.

## Firewall

Open only SSH, HTTP, and HTTPS publicly:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Do not expose PostgreSQL, Redis, or MinIO publicly unless you have a specific reason.

## Folder Structure On VPS

Use one folder per project:

```text
/var/www/vozilo.ba
/var/www/hidzama.ba
/var/www/proxy
```

Create folders:

```bash
sudo mkdir -p /var/www/vozilo.ba /var/www/hidzama.ba /var/www/proxy
sudo chown -R $USER:$USER /var/www
```

## Reverse Proxy Option A: Nginx On Host

Install Nginx and Certbot:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

For Vozilo.ba, create:

```bash
sudo nano /etc/nginx/sites-available/vozilo.ba
```

Example config:

```nginx
server {
    listen 80;
    server_name vozilo.ba www.vozilo.ba;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.vozilo.ba;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/vozilo.ba /etc/nginx/sites-enabled/vozilo.ba
sudo nginx -t
sudo systemctl reload nginx
```

Get SSL:

```bash
sudo certbot --nginx -d vozilo.ba -d www.vozilo.ba -d api.vozilo.ba
```

Repeat with a separate Nginx config for `hidzama.ba`, but proxy it to different internal ports, for example:

```text
hidzama.ba frontend: 127.0.0.1:3100
api.hidzama.ba backend: 127.0.0.1:3101
```

## Avoid Port Conflicts

Only one project can bind to a host port.

Vozilo.ba currently uses:

```text
frontend: 3000
backend: 3001
postgres: 5432
redis: 6379
minio: 9000, 9001
```

If `hidzama.ba` already uses some of these ports, change the exposed host ports in one project.

Example for Vozilo.ba:

```yaml
frontend:
  ports:
    - "3200:3000"

backend:
  ports:
    - "3201:3001"

postgres:
  ports:
    - "55432:5432"

redis:
  ports:
    - "56379:6379"

minio:
  ports:
    - "9200:9000"
    - "9201:9001"
```

Then Nginx should use:

```nginx
proxy_pass http://127.0.0.1:3200;
proxy_pass http://127.0.0.1:3201;
```

## Deploy Vozilo.ba On VPS

Clone the repository:

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/vozilo.ba.git vozilo.ba
cd /var/www/vozilo.ba
```

Create `.env`:

```bash
cp .env.example .env
nano .env
```

Use production secrets:

```bash
DATABASE_URL=postgresql://vozilo:STRONG_PASSWORD@postgres:5432/vozilo?schema=public
JWT_ACCESS_SECRET=long-random-access-secret
JWT_REFRESH_SECRET=long-random-refresh-secret
NEXT_PUBLIC_API_URL=https://api.vozilo.ba
FRONTEND_ORIGIN=https://vozilo.ba
```

Start:

```bash
docker compose up -d --build
```

Check services:

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

Verify:

```bash
curl http://127.0.0.1:3001/health
curl https://api.vozilo.ba/health
```

## Updating Production

From `/var/www/vozilo.ba`:

```bash
git pull
docker compose up -d --build
docker compose ps
```

If Prisma migrations are added later:

```bash
docker compose exec backend npm run prisma:migrate --workspace @vozilo/backend
```

## Backups

Back up PostgreSQL:

```bash
docker compose exec postgres pg_dump -U vozilo vozilo > backup-$(date +%F).sql
```

Restore:

```bash
cat backup-YYYY-MM-DD.sql | docker compose exec -T postgres psql -U vozilo vozilo
```

Back up Docker volumes:

```bash
docker volume ls
```

Important volumes:

```text
voziloba_postgres-data
voziloba_minio-data
```

## Production Checklist

- DNS points to the VPS IP.
- Nginx routes each domain to the correct local port.
- SSL certificates are installed.
- `.env` uses strong secrets.
- Database and Redis ports are not public.
- `docker compose ps` shows healthy running services.
- `https://vozilo.ba` opens frontend.
- `https://api.vozilo.ba/health` returns `ok`.
