FROM node:22-alpine

ARG CACHE_BUST=20260104

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm","run","start"]
