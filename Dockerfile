FROM node:22-slim

WORKDIR /app

# System dependencies required by Prisma engine
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Prisma schema and client generation
COPY prisma ./prisma
RUN npx prisma generate

# Copy full application source
COPY . .

# Build Next.js application
RUN npm run build

EXPOSE 3000

# Explicit long-running start command compatible with Railway dynamic PORT
CMD ["sh", "-c", "npx next start -H 0.0.0.0 -p $PORT"]
