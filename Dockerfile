FROM node:22-slim

WORKDIR /app

# System deps required by Prisma
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

# Build
RUN npm run build

EXPOSE 3000

# IMPORTANT: bind to 0.0.0.0 so Railway can reach it
EXPOSE 3000

CMD ["sh", "-c", "npx next start -H 0.0.0.0 -p $PORT"]
