FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build notification-service

EXPOSE 3005

CMD ["node", "dist/apps/notification-service/main"]