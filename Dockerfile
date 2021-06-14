FROM node:12.13.1-slim as base-builder

WORKDIR /usr/src/app
COPY package.json yarn.lock ./

RUN yarn

FROM node:12.13.1-slim as base-deploy

WORKDIR /usr/src/app
COPY package.json yarn.lock ./

RUN yarn --prod

FROM base-builder as builder

COPY . .

RUN yarn build

FROM base-deploy as deploy

WORKDIR /usr/src/app

COPY package.json ./
COPY --from=builder /usr/src/app/dist/ ./dist/

EXPOSE 3000
CMD [ 'yarn', 'start' ]
