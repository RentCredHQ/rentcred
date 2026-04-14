# Database Migrations Guide

This guide explains how to use Prisma migrations for the RentCred project.

## Overview

We use Prisma Migrate for database schema management. This ensures:
- Version-controlled schema changes
- Reproducible database states
- Safe production deployments
- Rollback capability

## Development Workflow

### 1. Create a Migration

When you modify the `schema.prisma` file:

```bash
cd apps/api
npx prisma migrate dev --name descriptive_migration_name
```

Example names:
- `init` - Initial migration
- `add_field_agent_role` - Add new field agent role
- `add_kyb_review_notes` - Add review notes to KYB
- `update_submission_status_enum` - Modify submission statuses

This command will:
1. Generate SQL migration file
2. Apply migration to your development database
3. Regenerate Prisma Client

### 2. Review the Migration

Check the generated SQL in `prisma/migrations/[timestamp]_[name]/migration.sql`

```sql
-- Example migration
ALTER TABLE "users" ADD COLUMN "phone_verified" BOOLEAN DEFAULT false;
```

### 3. Commit the Migration

```bash
git add prisma/migrations
git commit -m "Add phone verification to users"
```

## Production Deployment

### Option 1: Automatic (Recommended for CI/CD)

```bash
# In your deployment script
npx prisma migrate deploy
```

This:
- Applies pending migrations only
- Doesn't create new migrations
- Safe for production

### Option 2: Manual Review

```bash
# 1. Generate SQL without applying
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script > migration.sql

# 2. Review migration.sql

# 3. Apply manually or via deploy
npx prisma migrate deploy
```

## Common Commands

```bash
# Check migration status
npx prisma migrate status

# Reset database (⚠️ DESTRUCTIVE - dev only)
npx prisma migrate reset

# Generate Prisma Client only
npx prisma generate

# Resolve migration issues
npx prisma migrate resolve --applied "20250316_migration_name"
npx prisma migrate resolve --rolled-back "20250316_migration_name"
```

## Migration from db:push to Migrations

If you've been using `prisma db push`, here's how to convert:

### Step 1: Create Baseline Migration

```bash
# This creates a migration for your current schema without applying it
npx prisma migrate dev --name init --create-only

# Mark it as applied (since schema is already in DB)
npx prisma migrate resolve --applied init
```

### Step 2: Verify

```bash
npx prisma migrate status
# Should show: Database schema is up to date!
```

### Step 3: Future Changes

From now on, use `migrate dev` instead of `db push`:

```bash
# ❌ Old way
npm run db:push

# ✅ New way
npx prisma migrate dev --name your_change_name
```

## Best Practices

### DO:
✅ Use descriptive migration names
✅ Review generated SQL before committing
✅ Test migrations on staging before production
✅ Keep migrations small and focused
✅ Commit migrations with related code changes
✅ Use `migrate deploy` in production

### DON'T:
❌ Modify existing migration files
❌ Delete migration files
❌ Use `db push` in production
❌ Skip migration testing
❌ Commit unreviewed migrations

## Handling Migration Conflicts

### Scenario 1: Failed Migration

```bash
# Check what failed
npx prisma migrate status

# If it's safe to retry
npx prisma migrate deploy

# If migration is broken, mark as rolled back and fix
npx prisma migrate resolve --rolled-back "migration_name"
# Fix schema.prisma
npx prisma migrate dev --name fix_migration_name
```

### Scenario 2: Schema Drift

```bash
# Detect drift
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma

# If drift detected, create corrective migration
npx prisma migrate dev --name fix_schema_drift
```

### Scenario 3: Merge Conflicts

```bash
# If two developers created migrations:

# 1. Pull latest
git pull origin main

# 2. Resolve migration order issues
npx prisma migrate resolve --applied "their_migration"

# 3. Test locally
npx prisma migrate dev

# 4. Push
git push
```

## Data Migrations

For data transformations, use Prisma in migration:

```typescript
// prisma/migrations/[timestamp]_migrate_data/migration.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update existing records
  await prisma.user.updateMany({
    where: { role: 'admin' },
    data: { permissions: ['all'] },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Then run it as part of deployment:

```bash
npx tsx prisma/migrations/[timestamp]_migrate_data/migration.ts
```

## Rollback Strategy

Prisma doesn't support automatic rollbacks, but you can:

### Option 1: Create Reverse Migration

```bash
# Manually create a migration that undoes changes
npx prisma migrate dev --name revert_previous_change --create-only

# Edit the SQL to reverse changes
# Apply
npx prisma migrate dev
```

### Option 2: Database Backup (Production)

```bash
# Before migration
pg_dump $DATABASE_URL > backup_before_migration.sql

# If rollback needed
psql $DATABASE_URL < backup_before_migration.sql
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
- name: Run migrations
  run: |
    cd apps/api
    npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Vercel/Railway Example

```json
// package.json
{
  "scripts": {
    "postinstall": "cd apps/api && npx prisma generate",
    "build": "turbo build && cd apps/api && npx prisma migrate deploy"
  }
}
```

## Troubleshooting

### "Migration failed to apply"

```bash
# Check database connection
psql $DATABASE_URL

# Check migration status
npx prisma migrate status

# Check for locks
SELECT * FROM pg_locks WHERE relation::regclass::text LIKE '%_prisma_migrations%';
```

### "Schema drift detected"

```bash
# Option 1: Create migration to match
npx prisma db pull  # Pull current DB state
npx prisma migrate dev --name sync_schema

# Option 2: Force reset (dev only)
npx prisma migrate reset
```

### "Migration already applied"

```bash
# Mark as applied without running
npx prisma migrate resolve --applied "migration_name"
```

## References

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Migration Troubleshooting](https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/migrate-troubleshooting)
- [Best Practices](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate)
