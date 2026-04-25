#!/usr/bin/env bash
set -e

# Install all dependencies including devDependencies
npm install --include=dev

# Force Prisma v6 (v7 has breaking schema changes)
npx prisma@6 generate

# Build the NestJS app
npm run build
