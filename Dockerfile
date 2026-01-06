FROM node:22-slim

WORKDIR /app

# Prisma engine system dependencies
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy application source
COPY . .

# Build Next.js
RUN npm run build

# Expose standard HTTP port
EXPOSE 3000

# Use Railway-provided DATABASE_URL variable at runtime
CMD ["sh", "-c", "next start -H 0.0.0.0 -p $PORT"]
