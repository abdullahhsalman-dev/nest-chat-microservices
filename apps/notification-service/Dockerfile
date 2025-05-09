FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build presence-service

CMD ["node", "dist/apps/presence-service/main"]