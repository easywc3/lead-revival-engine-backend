FROM node:22-slim

WORKDIR /app

# Prisma system dependencies
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Dependencies
COPY package*.json ./
RUN npm install

# Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# Expose deterministic port
EXPOSE 3000

# Start the app on the same port Railway expects
CMD ["next", "start", "-H", "0.0.0.0", "-p", "3000"]
