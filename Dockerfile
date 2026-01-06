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

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build Next.js
RUN npm run build

# Expose standard HTTP port
EXPOSE 3000

CMD ["sh", "-c", "next start -H 0.0.0.0 -p $PORT"]
