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

# Expose AND run on the SAME port
EXPOSE 8080

ENV PORT=8080

CMD ["npm", "start"]
