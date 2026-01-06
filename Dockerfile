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

# Prisma schema
COPY prisma ./prisma
RUN npx prisma generate

# Copy app source
COPY . .

# Build Next.js app
RUN npm run build

EXPOSE 3000

# Start Next.js on the port Railway proxy expects
CMD ["sh", "-c", "npx next start -H 0.0.0.0 -p 3000"]
