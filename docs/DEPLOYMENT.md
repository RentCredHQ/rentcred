# RentCred — Production Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured (see below)
- [ ] `CREATE_DEMO_DATA=false` in API environment
- [ ] Strong `JWT_SECRET` (minimum 32 random characters)
- [ ] Strong `ADMIN_PASSWORD` (not `Admin123!`)
- [ ] `PAYSTACK_SECRET_KEY` is production key (not test key)
- [ ] AWS S3 bucket configured with correct permissions
- [ ] CORS origin set to production domain
- [ ] Database migrations run (`prisma migrate deploy`)
- [ ] HTTPS/TLS configured on load balancer or reverse proxy
- [ ] Error tracking configured (Sentry DSN)

---

## Environment Variables

### API (`apps/api/.env`)

```env
# ── Required ────────────────────────────────────────────────
DATABASE_URL="postgresql://user:pass@host:5432/rentcred?schema=public"
JWT_SECRET="minimum-32-random-characters-change-this-before-production"

# ── App ─────────────────────────────────────────────────────
PORT=4000
NODE_ENV=production
FRONTEND_URL="https://app.rentcred.ng"

# ── Redis ────────────────────────────────────────────────────
REDIS_URL="redis://redis-host:6379"

# ── JWT ──────────────────────────────────────────────────────
JWT_EXPIRES_IN="7d"

# ── Paystack ─────────────────────────────────────────────────
PAYSTACK_SECRET_KEY="sk_live_xxxxxxxxxxxx"
PAYSTACK_PUBLIC_KEY="pk_live_xxxxxxxxxxxx"

# ── AWS S3 ───────────────────────────────────────────────────
AWS_S3_BUCKET="rentcred-production-uploads"
AWS_S3_REGION="eu-west-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."

# ── Email ─────────────────────────────────────────────────────
RESEND_API_KEY="re_live_xxxxxxxxxxxx"

# ── SMS ───────────────────────────────────────────────────────
TERMII_API_KEY="xxxxxxxx"

# ── Error Tracking ────────────────────────────────────────────
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"

# ── Seed ──────────────────────────────────────────────────────
CREATE_DEMO_DATA=false
ADMIN_EMAIL="admin@rentcred.ng"
ADMIN_PASSWORD="STRONG_RANDOM_PASSWORD_HERE"
```

### Web (`apps/web/.env`)

```env
NUXT_PUBLIC_API_BASE_URL="https://api.rentcred.ng/api"
```

---

## Build

```bash
# Build both apps
npm run build

# Or individually
cd apps/api && npm run build      # outputs to apps/api/dist/
cd apps/web && npm run build      # outputs to apps/web/.output/
```

---

## Database Setup

```bash
cd apps/api

# Run migrations (safe for production — never resets data)
npx prisma migrate deploy

# Seed admin user only (demo data disabled via CREATE_DEMO_DATA=false)
npm run db:seed
```

---

## Running in Production

### API

```bash
cd apps/api
node dist/main.js
```

Or with PM2:

```bash
pm2 start dist/main.js --name rentcred-api
pm2 save
pm2 startup
```

### Web (Nuxt)

```bash
cd apps/web
node .output/server/index.mjs
```

Or with PM2:

```bash
pm2 start .output/server/index.mjs --name rentcred-web
pm2 save
```

---

## Docker Deployment

### Build Images

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
COPY node_modules/.prisma ./node_modules/.prisma
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY .output/ ./.output/
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### Docker Compose (production)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: rentcred
      POSTGRES_USER: rentcred
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  api:
    build: ./apps/api
    env_file: ./apps/api/.env
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - redis

  web:
    build: ./apps/web
    env_file: ./apps/web/.env
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:
```

---

## Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/rentcred
server {
    listen 443 ssl http2;
    server_name app.rentcred.ng;

    ssl_certificate     /etc/letsencrypt/live/app.rentcred.ng/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.rentcred.ng/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name api.rentcred.ng;

    ssl_certificate     /etc/letsencrypt/live/api.rentcred.ng/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.rentcred.ng/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name app.rentcred.ng api.rentcred.ng;
    return 301 https://$host$request_uri;
}
```

---

## Cloudflare R2 Setup

### 1. Create a bucket

Cloudflare Dashboard → R2 → **Create bucket** → name it `rentcred-production-uploads`

### 2. Enable public access

Bucket → **Settings** → **Public access** → Enable
Copy the `pub-xxxxxxxxxxxxxxxx.r2.dev` URL — this is your `R2_PUBLIC_URL`.

Alternatively, connect a custom domain (e.g. `uploads.rentcred.ng`) under
Bucket → Settings → **Custom Domains** → Add domain.

### 3. Create an API token

R2 overview page → **Manage R2 API Tokens** → Create token

- **Permissions**: Object Read & Write
- **Bucket**: restrict to `rentcred-production-uploads`
- Copy **Access Key ID** → `R2_ACCESS_KEY_ID`
- Copy **Secret Access Key** → `R2_SECRET_ACCESS_KEY`
- Your **Account ID** is in the R2 page URL: `dash.cloudflare.com/<ACCOUNT_ID>/r2`

### 4. CORS configuration

Bucket → **Settings** → **CORS policy** → Add:

```json
[
  {
    "AllowedOrigins": ["https://app.rentcred.ng"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### 5. Environment variables

```env
R2_ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your-key-id"
R2_SECRET_ACCESS_KEY="your-secret"
R2_BUCKET="rentcred-production-uploads"
R2_PUBLIC_URL="https://uploads.rentcred.ng"
```

---

## Paystack Webhook Configuration

In the Paystack dashboard:

1. Go to **Settings → API Keys & Webhooks**
2. Set webhook URL to: `https://api.rentcred.ng/api/payments/webhook`
3. Copy the **secret hash** and set it as `PAYSTACK_SECRET_KEY` in the API environment

The webhook endpoint verifies the `x-paystack-signature` header using HMAC-SHA512 before processing any events.

---

## Health Check

```bash
curl https://api.rentcred.ng/api/health
# Returns: { "status": "ok", "timestamp": "..." }
```

---

## Monitoring

- **Error tracking**: Sentry (configured via `SENTRY_DSN`)
- **Logs**: NestJS built-in Logger; pipe to CloudWatch or Datadog via PM2
- **Uptime**: Configure an uptime monitor to hit `/api/health` every 60 seconds
- **Database**: Set up pg_stat_statements and slow query logging

---

## Rollback

```bash
# Roll back to previous migration
cd apps/api
npx prisma migrate resolve --rolled-back <migration-name>

# Or reset to a specific migration
npx prisma migrate deploy --preview-feature
```

For zero-downtime deployments, use blue-green deployment or run database migrations before deploying the new API version.

---

## Security Hardening

1. **Firewall**: Only expose ports 80 and 443. API and Redis ports should not be publicly accessible.
2. **Database**: PostgreSQL should only accept connections from the API server IP.
3. **Secrets**: Use a secrets manager (AWS Secrets Manager, HashiCorp Vault) instead of `.env` files in production.
4. **Rate limiting**: The API has built-in rate limiting via `@nestjs/throttler`. Tune limits based on traffic patterns.
5. **JWT**: Rotate `JWT_SECRET` periodically. Existing tokens will be invalidated (users must re-login).
6. **S3**: Never give the API `s3:GetObject` permissions — files are served directly from S3 public URLs.
