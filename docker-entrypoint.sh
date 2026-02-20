#!/usr/bin/env sh
set -e

echo "Running prisma migrate deploy..."
npx prisma migrate deploy

echo "Starting app..."
exec npm run start

echo ENTRYPOINT_MARKER_20260219_160952

