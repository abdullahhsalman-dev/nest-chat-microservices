FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build api-gateway

EXPOSE 3000

CMD ["node", "dist/apps/api-gateway/main"]