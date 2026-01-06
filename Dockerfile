FROM node:22-slim

WORKDIR /app

# System deps required by Prisma engine
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install deps
COPY package*.json ./
RUN npm install

# Prisma schema first
COPY prisma ./prisma
RUN npx prisma generate

# App source
COPY . .

# Build Next.js app
RUN npm run build

# Align to Railway expected public port
EXPOSE 5000

# Make sure PORT exists for Next.js at runtime
ENV PORT=5000

# Persistent Railway-compatible runtime start
CMD ["sh", "-c", "npm run start"]
