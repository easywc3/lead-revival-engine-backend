FROM node:22-slim

WORKDIR /app

# Install Prisma system dependencies
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install Node.js dependencies
COPY package*.json ./
RUN npm install

# Pass Railway-provided database connection into container
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build Next.js
RUN npm run build

# Expose standard Next.js production port
EXPOSE 3000

CMD ["npm", "run", "start"]
