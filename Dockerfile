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

# Expose port dynamically
EXPOSE 3000

# Do not hardcode PORT
CMD ["sh", "-c", "next start -H 0.0.0.0 -p $PORT"]
