#!/usr/bin/env bash
set -e

# Install all dependencies including devDependencies
npm install --include=dev

# Use the locally installed prisma (v6), not npx which may fetch v7
./node_modules/.bin/prisma generate

# Build the NestJS app
npm run build
