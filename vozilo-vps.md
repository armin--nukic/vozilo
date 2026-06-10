# Vozilo VPS deploy: vozilo.ice.lol na istom serveru kao hidzama.ice.lol

Ovaj dokument je posebno za dodavanje Vozilo.ba projekta na isti VPS gdje vec radi Hidzama.

Server IP:

```txt
13.140.166.66
```

Cilj:

- `https://hidzama.ice.lol` nastavlja raditi kao do sada
- `https://vozilo.ice.lol` prikazuje Vozilo frontend
- `https://vozilo.ice.lol/api` prikazuje Swagger API docs
- `https://vozilo.ice.lol/health` ide na Vozilo backend health check
- oba projekta koriste isti VPS IP, ali razlicite Docker portove

Najbitnije:

```txt
hidzama frontend  -> 127.0.0.1:3100
hidzama backend   -> 127.0.0.1:4100

vozilo frontend   -> 127.0.0.1:3200
vozilo backend    -> 127.0.0.1:4200
vozilo postgres   -> 127.0.0.1:55433
vozilo redis      -> 127.0.0.1:56380
vozilo minio      -> 127.0.0.1:9200
vozilo minio UI   -> 127.0.0.1:9201
```

## 1. DNS

U DNS panelu za `ice.lol` dodaj A record:

```txt
vozilo.ice.lol    A    13.140.166.66
```

Provjera sa racunara:

```bash
nslookup vozilo.ice.lol
```

Treba vratiti:

```txt
13.140.166.66
```

Ako DNS jos nije propagirao, sacekaj par minuta.

## 2. Udji na VPS

```bash
ssh root@13.140.166.66
```

Ako koristis drugog usera:

```bash
ssh ubuntu@13.140.166.66
```

## 3. Provjeri da Hidzama radi

Prije dodavanja Vozila, provjeri postojece portove:

```bash
ss -tulpn | grep -E ':3100|:4100|:3200|:4200'
```

Hidzama bi trebala koristiti:

```txt
3100 frontend
4100 backend
```

Vozilo ce koristiti:

```txt
3200 frontend
4200 backend
```

Ako vec nesto koristi `3200` ili `4200`, izaberi druge portove i promijeni ih u `.env` i Nginx configu.

## 4. Clone Vozilo projekta

Preporuceni folder:

```txt
/opt/vozilo
```

Na serveru:

```bash
mkdir -p /opt
cd /opt
git clone https://github.com/TVOJ-USERNAME/vozilo.ba.git vozilo
cd /opt/vozilo
```

Ako si vec uploadovao fajlove:

```bash
cd /opt/vozilo
git pull
```

## 5. .env za vozilo.ice.lol

U `/opt/vozilo` napravi `.env`:

```bash
nano .env
```

Stavi ovo kao osnovu:

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

JWT_ACCESS_SECRET=napravi_dug_random_access_secret_minimum_32_karaktera
JWT_REFRESH_SECRET=napravi_dug_random_refresh_secret_minimum_32_karaktera

NEXT_PUBLIC_API_URL=https://vozilo.ice.lol
FRONTEND_ORIGIN=https://vozilo.ice.lol

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

Bitno:

- `FRONTEND_PORT=3200` ne smije biti isti kao Hidzama `3100`
- `BACKEND_PORT=4200` ne smije biti isti kao Hidzama `4100`
- `POSTGRES_PORT=55433` ne smije biti isti kao Hidzama `55432`
- `NEXT_PUBLIC_API_URL=https://vozilo.ice.lol` je isti domen jer backend ide preko Nginx-a na istom subdomenu
- nemoj koristiti dev secret vrijednosti u produkciji

## 6. Pokreni Docker za Vozilo

U `/opt/vozilo`:

```bash
docker compose up -d --build
```

Provjeri kontejnere:

```bash
docker compose ps
```

Provjeri logove:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

Lokalni test na VPS-u:

```bash
curl http://127.0.0.1:4200/health
curl http://127.0.0.1:4200/api
curl -I http://127.0.0.1:3200/
curl -I http://127.0.0.1:3200/bs
curl -I http://127.0.0.1:3200/en
```

Ocekivano:

- `/health` vraca JSON sa `status: ok`
- `/api` otvara Swagger docs
- `3200` vraca frontend HTML

## 7. Nginx config za vozilo.ice.lol

Napravi novi Nginx fajl:

```bash
nano /etc/nginx/sites-available/vozilo.ice.lol
```

Stavi:

```nginx
server {
    listen 80;
    server_name vozilo.ice.lol;

    client_max_body_size 20m;

    location /api {
        proxy_pass http://127.0.0.1:4200/api;
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

    location = /modules {
        proxy_pass http://127.0.0.1:4200/modules;
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

Zasto ovako:

- `/api` ide na backend jer je Swagger trenutno na backend ruti `/api`
- `/health` ide na backend
- `/modules` ide na backend jer trenutni scaffold ima tu backend rutu
- sve ostalo ide na frontend, ukljucujuci `/`, `/bs`, `/en`, `_next` fajlove i statiku

Aktiviraj config:

```bash
ln -s /etc/nginx/sites-available/vozilo.ice.lol /etc/nginx/sites-enabled/vozilo.ice.lol
nginx -t
systemctl reload nginx
```

Ako symlink vec postoji:

```bash
ln -sf /etc/nginx/sites-available/vozilo.ice.lol /etc/nginx/sites-enabled/vozilo.ice.lol
nginx -t
systemctl reload nginx
```

Nemoj brisati Hidzama config. Trebas imati oba:

```txt
/etc/nginx/sites-enabled/hidzama.ice.lol
/etc/nginx/sites-enabled/vozilo.ice.lol
```

## 8. HTTP test prije SSL-a

Prvo testiraj preko HTTP:

```bash
curl -I http://vozilo.ice.lol/
curl -I http://vozilo.ice.lol/bs
curl -I http://vozilo.ice.lol/en
curl http://vozilo.ice.lol/health
curl -I http://vozilo.ice.lol/api
```

Ako frontend vraca HTML i health vraca `ok`, Nginx je dobar.

Ako `vozilo.ice.lol` prikazuje Hidzamu, problem je DNS ili Nginx `server_name`.

Ako `vozilo.ice.lol` vraca backend JSON za frontend rute, problem je `location /`; mora ici na:

```txt
http://127.0.0.1:3200
```

## 9. SSL za vozilo.ice.lol

Kada HTTP radi:

```bash
certbot --nginx -d vozilo.ice.lol
```

Provjera:

```bash
curl -I https://vozilo.ice.lol/
curl https://vozilo.ice.lol/health
curl -I https://vozilo.ice.lol/api
```

Automatska obnova certifikata:

```bash
systemctl status certbot.timer
certbot renew --dry-run
```

## 10. Update Vozilo projekta

Kad napravis promjene i push na GitHub:

```bash
cd /opt/vozilo
git pull
docker compose up -d --build
docker compose ps
```

Ako mijenjas samo `.env`, opet rebuild jer frontend env ulazi u Next build:

```bash
docker compose up -d --build frontend backend
```

## 11. Debug komande

Status portova:

```bash
ss -tulpn | grep -E ':3100|:4100|:3200|:4200|:55433|:56380|:9200|:9201'
```

Docker:

```bash
cd /opt/vozilo
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

Nginx:

```bash
nginx -t
nginx -T | grep -n "vozilo.ice.lol" -A90
systemctl reload nginx
```

Test lokalno na VPS-u:

```bash
curl http://127.0.0.1:4200/health
curl -I http://127.0.0.1:3200/
```

Test preko domena:

```bash
curl https://vozilo.ice.lol/health
curl -I https://vozilo.ice.lol/
curl -I https://vozilo.ice.lol/bs
curl -I https://vozilo.ice.lol/en
```

## 12. Ako nesto ne radi

### DNS ne radi

```bash
nslookup vozilo.ice.lol
```

Mora pokazati:

```txt
13.140.166.66
```

### Docker ne radi

```bash
cd /opt/vozilo
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
```

### Nginx salje na pogresan projekat

Provjeri da `server_name vozilo.ice.lol;` postoji samo u Vozilo configu:

```bash
grep -R "server_name .*vozilo.ice.lol" /etc/nginx/sites-available /etc/nginx/sites-enabled
```

### Frontend radi lokalno, ali domen ne radi

Ovo znaci da je problem Nginx:

```bash
curl -I http://127.0.0.1:3200/
curl -I http://vozilo.ice.lol/
```

Ako prvi radi, a drugi ne radi, popravi `/etc/nginx/sites-available/vozilo.ice.lol`.

### Backend radi lokalno, ali domen health ne radi

```bash
curl http://127.0.0.1:4200/health
curl http://vozilo.ice.lol/health
```

Ako prvi radi, a drugi ne radi, problem je Nginx `location = /health`.

## 13. Kratka procedura od nule

```bash
ssh root@13.140.166.66
cd /opt
git clone https://github.com/TVOJ-USERNAME/vozilo.ba.git vozilo
cd /opt/vozilo
nano .env
docker compose up -d --build
curl http://127.0.0.1:4200/health
nano /etc/nginx/sites-available/vozilo.ice.lol
ln -s /etc/nginx/sites-available/vozilo.ice.lol /etc/nginx/sites-enabled/vozilo.ice.lol
nginx -t
systemctl reload nginx
curl -I http://vozilo.ice.lol/
certbot --nginx -d vozilo.ice.lol
curl -I https://vozilo.ice.lol/
```

Ako ovaj flow prodje, Vozilo radi na istom VPS-u i istom IP-u kao Hidzama.
