FROM node:12.19.0-alpine3.9 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install --only=production

COPY . .

RUN npm run build

COPY .sequelizerc ./dist

CMD ["node", "dist/main"]