#!/bin/sh
set -e

# ─────────────────────────────────────────────────────────────
# Wait for PostgreSQL to accept connections before starting.
# DATABASE_URL example: postgresql://postgres:postgres@db:5432/rats
# ─────────────────────────────────────────────────────────────
echo "⏳ Waiting for PostgreSQL to be ready…"

# Extract host and port from DATABASE_URL (defaults to db:5432).
DB_HOST=$(printf '%s' "$DATABASE_URL" | sed -n 's#.*@\([^:/]*\).*#\1#p')
DB_PORT=$(printf '%s' "$DATABASE_URL" | sed -n 's#.*@[^:]*:\([0-9]*\).*#\1#p')
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}

until node -e "require('net').createConnection({host:'${DB_HOST}',port:${DB_PORT}}).on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))" 2>/dev/null; do
  echo "   …still waiting for ${DB_HOST}:${DB_PORT}"
  sleep 2
done

echo "✅ PostgreSQL is up — applying schema"
npx prisma db push --skip-generate --accept-data-loss

echo "🌱 Seeding database"
node dist/seed/run.js || echo "⚠️  Seed step failed or already applied — continuing"

echo "🚀 Starting server"
exec "$@"
