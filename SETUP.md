# RentCred - Setup Guide

This guide will help you get RentCred up and running for development and prototyping.

## Prerequisites

- Node.js >= 20.0.0
- PostgreSQL 14+
- Redis 6+
- npm 10+

## Quick Start (Development)

### 1. Clone and Install

```bash
# Install dependencies
npm install

# Copy environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

### 2. Configure Environment

Edit `apps/api/.env` with your configuration. For local development, the defaults work fine. You only need to set:

```env
DATABASE_URL="postgresql://rentcred:rentcred@localhost:5433/rentcred?schema=public"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long-change-this"
```

### 3. Start Services

```bash
# Start PostgreSQL and Redis (using Docker)
docker-compose up -d

# Or install locally:
# brew install postgresql redis  # macOS
# sudo apt install postgresql redis  # Ubuntu
```

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with demo data
npm run db:seed
```

### 5. Run Development Servers

```bash
# Start all services (API + Web)
npm run dev

# Or run separately:
# Terminal 1 - API
cd apps/api && npm run dev

# Terminal 2 - Web
cd apps/web && npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api/docs

## Demo Credentials

After running `npm run db:seed`, use these credentials (password: `Admin123!`):

| Role | Email | Description |
|------|-------|-------------|
| **Admin** | admin@rentcred.ng | Full system access |
| **Ops** | chidi.nwosu@rentcred.ng | Verification operations |
| **Ops** | aisha.bello@rentcred.ng | KYB review |
| **Agent** | contact@premierrealty.ng | Approved agent with 12 credits |
| **Agent** | info@luxehomes.ng | Approved agent with 8 credits |
| **Field Agent** | ola.adeyemi@rentcred.ng | Field visit assignments |

## Project Structure

```
rentcred/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Nuxt 3 frontend
├── packages/
│   └── shared/       # Shared types and utilities
├── docker-compose.yml
└── turbo.json
```

## Key Features Implemented

✅ Multi-role authentication (admin, agent, tenant, ops, field_agent)
✅ KYB (Know Your Business) verification for agents
✅ Credit-based submission system
✅ Tenant verification workflow
✅ Field agent management and visit tracking
✅ Report generation and approval
✅ Payment integration (Paystack)
✅ Dispute management
✅ Audit logging
✅ Rate limiting and security

## Available Scripts

### Root Level
- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps
- `npm run lint` - Lint all apps
- `npm run test` - Run tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with demo data

### API (apps/api)
- `npm run dev` - Start API in watch mode
- `npm run build` - Build API
- `npm run start:prod` - Start API in production mode
- `npm test` - Run tests

### Web (apps/web)
- `npm run dev` - Start web app in development
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Variables

### Required (Minimum for local development)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens (min 32 chars)

### Optional (Use defaults for development)
- `PORT` - API port (default: 4000)
- `FRONTEND_URL` - Frontend URL (default: http://localhost:3000)
- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)

### Production Services (Optional in development)
- `PAYSTACK_SECRET_KEY` - Paystack payment integration
- `AWS_ACCESS_KEY_ID` - AWS S3 for file storage
- `RESEND_API_KEY` - Email sending service
- `TERMII_API_KEY` - SMS notifications
- `SENTRY_DSN` - Error tracking

## Database Migrations

```bash
# Create a new migration
cd apps/api
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (⚠️ destroys data)
npx prisma migrate reset
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 4000 (API)
lsof -ti:4000 | xargs kill -9

# Kill process on port 3000 (Web)
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Not Generated
```bash
npm run db:generate
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
psql -U rentcred -d rentcred -h localhost -p 5432

# Or with Docker
docker-compose ps
```

### Redis Connection Failed
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.

## Security Notes

⚠️ **Important for Production:**

1. Change `JWT_SECRET` to a strong random string (min 32 characters)
2. Set `CREATE_DEMO_DATA=false` in production
3. Use strong admin password (not `Admin123!`)
4. Enable HTTPS/TLS
5. Configure proper CORS origins
6. Set up Sentry for error tracking
7. Use environment-specific `.env` files
8. Never commit `.env` files to version control

## Support

For issues or questions:
- Check the [API Documentation](http://localhost:4000/api/docs)
- Review the [codebase documentation](./docs/)
- Open an issue on GitHub

## License

Proprietary - RentCred Nigeria
