#!/bin/bash

# This script creates the initial migration from the current schema
# Run this once to convert from db:push to migrations

set -e

echo "🔧 Creating initial migration..."
echo ""

# Check if database is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo "Please start your database first:"
    echo "  docker-compose up -d"
    echo "  OR"
    echo "  brew services start postgresql"
    exit 1
fi

# Create the migration (without applying)
echo "📝 Generating migration files..."
npx prisma migrate dev --name init --create-only

# Mark as applied (since schema already exists in DB)
echo "✅ Marking migration as applied..."
npx prisma migrate resolve --applied init

# Verify status
echo ""
echo "🔍 Migration status:"
npx prisma migrate status

echo ""
echo "✅ Initial migration setup complete!"
echo ""
echo "From now on, use: npx prisma migrate dev --name your_change"
