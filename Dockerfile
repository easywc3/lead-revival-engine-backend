FROM node:22-slim

WORKDIR /app

# Install system dependencies required by Prisma engine
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests and install Node modules
COPY package*.json ./
RUN npm install

# Copy Prisma schema and generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the full application source
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the default Next.js port (for clarity)
EXPOSE 3000

# Start Next.js using Railway-provided PORT environment variable
CMD ["sh", "-c", "npx next start -H 0.0.0.0 -p $PORT"]
