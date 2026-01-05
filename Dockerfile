FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# ✅ COPY PRISMA FILES FIRST
COPY prisma ./prisma

# ✅ NOW generate client
RUN npx prisma generate

# ✅ THEN copy the rest of the app
COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
