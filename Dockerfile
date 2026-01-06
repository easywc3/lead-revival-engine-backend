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

# Prisma schema
COPY prisma ./prisma
RUN npx prisma generate

# App source
COPY . .

# Build
RUN npm run build

EXPOSE 5000

CMD ["sh", "-c", "npx next start -H 0.0.0.0 -p 5000"]
