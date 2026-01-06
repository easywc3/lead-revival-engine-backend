FROM node:22-slim

WORKDIR /app

# System deps required by Prisma engine
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

# Copy application source
COPY . .

# Build Next.js
RUN npm run build

# Expose standard HTTP port
EXPOSE 3000

# Runtime start command using Railway-provided PORT
CMD ["npm", "run", "start"]
