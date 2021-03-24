FROM node:12.13.1 as build
WORKDIR /app
COPY ./client/package.json ./client/yarn.lock ./
RUN yarn
COPY ./client .
RUN yarn build

FROM node:12.13.1-alpine
ENV PORT=80
WORKDIR /app
COPY ./server/package.json ./server/yarn.lock ./
RUN yarn
COPY ./server .
COPY --from=build /app/build ./build

EXPOSE 80
CMD ["node", "index"]