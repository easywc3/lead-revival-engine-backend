FROM node:22-slim

WORKDIR /app

# Install system dependencies required by Prisma
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Prisma client generation
COPY prisma ./prisma
RUN npx prisma generate

# Copy full application source
COPY . .

# Build Next.js application
RUN npm run build

# Expose does not control Railway – proxy does
EXPOSE 3000

# Use shell to launch Next.js exactly on the injected PORT
CMD ["sh", "-c", "npm run start"]
