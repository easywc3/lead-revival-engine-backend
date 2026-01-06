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

# Copy Prisma schema and generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy full application source
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the default port (Railway will still override with PORT env var)
EXPOSE 3000

# Explicit runtime command with Railway PORT expansion
CMD ["sh", "-c", "npx next start -H 0.0.0.0 -p $PORT"]
