# SSO / Google Auth konfiguracija za Vozilo.ba

Ovaj projekat sada ima osnovni Google OAuth flow:

```txt
GET /auth/google/url
GET /auth/google/callback?code=...
```

Frontend dugme `Nastavi sa Google` zove backend rutu `/auth/google/url`. Ako je Google OAuth konfigurisan, backend vrati Google login URL.

Službena Google dokumentacija:

- Google OAuth web server flow: https://developers.google.com/identity/protocols/oauth2/web-server
- OAuth consent screen: https://developers.google.com/workspace/guides/configure-oauth-consent
- OpenID Connect redirect URI: https://developers.google.com/identity/openid-connect/openid-connect

## 1. Google Cloud projekat

1. Otvori Google Cloud Console.
2. Napravi novi project, npr:

```txt
vozilo-ba
```

3. Otvori `APIs & Services`.
4. Otvori `OAuth consent screen`.
5. Izaberi `External`, osim ako koristiš samo Google Workspace organizaciju.
6. Popuni:

```txt
App name: Vozilo.ba
User support email: tvoj-email
Developer contact email: tvoj-email
```

7. Za testiranje dodaj svoj Google račun u `Test users`.

## 2. Scopes

Za login su dovoljni osnovni OpenID scopes:

```txt
openid
email
profile
```

Ne dodaj Gmail, Drive ili druge sensitive scopes ako ti ne trebaju.

## 3. OAuth Client

U Google Cloud Console:

1. `APIs & Services`
2. `Credentials`
3. `Create credentials`
4. `OAuth client ID`
5. Application type: `Web application`
6. Name:

```txt
Vozilo.ba Web
```

## 4. Authorized redirect URIs

Za lokalni Docker:

```txt
http://localhost:3001/auth/google/callback
```

Za lokalno preko IP:

```txt
http://127.0.0.1:3001/auth/google/callback
```

Za VPS sa istim domenom:

```txt
https://vozilo.ice.lol/auth/google/callback
```

Ako kasnije koristiš pravi domen:

```txt
https://vozilo.ba/auth/google/callback
https://api.vozilo.ba/auth/google/callback
```

Koristi samo one URL-ove koji stvarno postoje u tvojoj produkciji.

## 5. Lokalni .env primjer

U `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
FRONTEND_ORIGIN=http://localhost:3000

GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```

Pokretanje:

```bash
docker compose up -d --build
```

Test:

```bash
curl http://localhost:3001/auth/google/url
```

Ako je sve podešeno, odgovor sadrži:

```json
{
  "configured": true,
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

Ako nije podešeno:

```json
{
  "configured": false,
  "message": "Google OAuth is not configured..."
}
```

## 6. VPS .env primjer za vozilo.ice.lol

U `/opt/vozilo/.env`:

```env
NEXT_PUBLIC_API_URL=https://vozilo.ice.lol
FRONTEND_ORIGIN=https://vozilo.ice.lol

GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=https://vozilo.ice.lol/auth/google/callback
```

Nakon promjene `.env`:

```bash
cd /opt/vozilo
docker compose up -d --build
docker compose logs --tail=80 backend
```

## 7. Nginx za Google callback

Ako koristiš isti domen `vozilo.ice.lol`, Nginx mora slati auth rute na backend.

Dodaj u `/etc/nginx/sites-available/vozilo.ice.lol` prije `location /`:

```nginx
location /auth/ {
    proxy_pass http://127.0.0.1:4200/auth/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Zatim:

```bash
nginx -t
systemctl reload nginx
```

Test:

```bash
curl https://vozilo.ice.lol/auth/google/url
```

## 8. Važna napomena za trenutni callback

Backend callback trenutno vraća JSON sa `accessToken`.

Za produkcijski UX sljedeći korak je da callback napravi redirect na frontend, npr:

```txt
https://vozilo.ice.lol?token=...
```

ili sigurnije:

```txt
https://vozilo.ice.lol/auth/callback
```

pa da frontend spremi token. Za početni test je JSON callback dovoljan da potvrdi da Google SSO radi.

## 9. Najčešće greške

### redirect_uri_mismatch

Google redirect URI se ne poklapa tačno sa `.env`.

Mora biti identično:

```txt
GOOGLE_CALLBACK_URL=https://vozilo.ice.lol/auth/google/callback
```

i u Google Cloud Console mora postojati isti URI.

### access_denied dok je app u Testing modu

Dodaj Google račun u `Test users` na OAuth consent screen.

### Dugme vraća "not configured"

Provjeri:

```bash
docker compose exec backend printenv | grep GOOGLE
```

Moraš vidjeti:

```txt
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
```

### Nginx šalje /auth na frontend

Provjeri:

```bash
curl https://vozilo.ice.lol/auth/google/url
```

Ako dobiješ HTML od frontenda, fali `location /auth/` u Nginx configu.
