# Stripe setup za Vozilo.ba

Stripe integracija koristi Stripe Checkout za subscription planove.

Službene reference:

- Checkout Session create API: https://docs.stripe.com/api/checkout/sessions/create
- Checkout Sessions overview: https://docs.stripe.com/api/checkout/sessions
- Subscription Checkout guide: https://docs.stripe.com/billing/subscriptions/build-subscriptions
- Webhooks: https://docs.stripe.com/webhooks
- Stripe CLI: https://docs.stripe.com/stripe-cli/use-cli

## 1. Napravi Stripe proizvode

U Stripe Dashboard:

1. `Product catalog`
2. `Add product`
3. Product:

```txt
Vozilo.ba Premium
```

4. Recurring price:

```txt
5 KM monthly
```

Ako Stripe account nema BAM/KM valutu, koristi EUR kao najbliži produkcijski fallback, npr:

```txt
2.56 EUR monthly
```

5. Kopiraj Price ID:

```txt
price_xxxxxxxxx
```

Za Business napravi:

```txt
Vozilo.ba Business
29 KM monthly
```

## 2. .env

Lokalno:

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxxxxxx
STRIPE_BUSINESS_PRICE_ID=price_xxxxxxxxx
FRONTEND_ORIGIN=http://localhost:3000
```

VPS:

```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxxxxxx
STRIPE_BUSINESS_PRICE_ID=price_xxxxxxxxx
FRONTEND_ORIGIN=https://vozilo.ice.hr
```

Nikad ne commituj prave Stripe ključeve.

## 3. Test checkout

Pokreni:

```bash
docker compose up -d --build
```

Test:

```bash
curl -X POST http://localhost:3001/billing/checkout \
  -H "Content-Type: application/json" \
  -d '{"plan":"premium","customerEmail":"demo@vozilo.ba"}'
```

Ako je sve podešeno, dobiješ:

```json
{
  "configured": true,
  "url": "https://checkout.stripe.com/..."
}
```

Ako nije podešeno, backend vrati koje varijable fale.

## 4. Nginx

Dodaj backend route:

```nginx
location /billing/ {
    proxy_pass http://127.0.0.1:4200/billing/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 5. Webhook kasnije

Za produkciju treba dodati webhook endpoint koji sluša:

```txt
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
invoice.payment_failed
```

Stripe docs preporučuju webhooke za automatske reakcije na plaćanja i subscription promjene.

Lokalni webhook test:

```bash
stripe listen --forward-to localhost:3001/billing/webhook
```

Trigger:

```bash
stripe trigger checkout.session.completed
```

Trenutni kod pravi Checkout Session. Sljedeći korak je dodati `/billing/webhook` i upisivati status pretplate u bazu.
