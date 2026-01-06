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

EXPOSE 3000

# Load environment variables at runtime and start Next on that same port
CMD ["sh", "-c", "node -r dotenv/config ./node_modules/.bin/next start -H 0.0.0.0 -p $PORT"]
