FROM node:22-slim

WORKDIR /app

# Install system dependencies required by Prisma engine
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy Prisma schema and generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy full application source
COPY . .

# Build the Next.js application
RUN npm run build

# Railway proxy expects a standard web port
EXPOSE 3000

# Final persistent runtime command that prints logs
CMD ["npm", "run", "start"]
