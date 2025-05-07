FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build chat-service

CMD ["node", "dist/apps/chat-service/main"]