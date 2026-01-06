FROM node:22-slim

WORKDIR /app

# System deps required by Prisma engine
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install npm dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy app source
COPY . .

# Build Next.js app
RUN npm run build

EXPOSE 3000

# Start Next.js bound to Railway dynamic PORT
CMD ["sh", "-c", "npx next start -H 0.0.0.0 -p $PORT"]
