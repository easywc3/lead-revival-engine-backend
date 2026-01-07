FROM node:22-slim

WORKDIR /app

# Prisma system dependencies
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy application source
COPY . .

# Build Next.js application
RUN npm run build

# Expose container port (informational only)
EXPOSE 3000

# Runtime – explicitly use local Next.js binary so it is found
CMD ["sh", "-c", "./node_modules/.bin/next start -H 0.0.0.0 -p $PORT"]
