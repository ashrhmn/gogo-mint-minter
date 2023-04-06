FROM node:16-alpine as builder

WORKDIR /app
COPY yarn.lock package.json ./
RUN mkdir -p client api
COPY client/package.json ./client/
COPY api/package.json ./api/
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:16-alpine

RUN yarn global add pm2

WORKDIR /app
COPY ./api/package.json .
RUN yarn install --frozen-lockfile --production
COPY ./api/src/prisma/schema.prisma ./src/prisma/schema.prisma
RUN yarn prisma generate
COPY --from=builder /app/api/dist/ .
COPY --from=builder /app/client/dist/ ./client

ENV NODE_ENV=production
ENV REDIS_HOST=gogo-minter-redis

ARG PORT
ENV PORT "${PORT}"
EXPOSE "${PORT}"

CMD ["pm2-runtime", "/app/main.js -i max"]