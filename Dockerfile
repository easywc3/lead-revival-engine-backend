FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# ✅ ADD THIS LINE (CRITICAL)
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
