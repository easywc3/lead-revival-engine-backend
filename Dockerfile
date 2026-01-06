FROM node:22-slim

WORKDIR /app

# Prisma system dependencies
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# Railway will still set PORT dynamically; expose is just documentation
EXPOSE 3000

# IMPORTANT:
# - Use the real Next binary path (prevents "/app/next" errors)
# - Bind to Railway's PORT (prevents healthcheck "service unavailable")
CMD ["sh", "-c", "node ./node_modules/next/dist/bin/next start -H 0.0.0.0 -p ${PORT:-3000}"]
