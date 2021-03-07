FROM node:12.13.1 as build
WORKDIR /app
COPY ./client/package.json ./client/yarn.lock ./
RUN yarn
COPY ./client .
RUN yarn build

FROM node:12.13.1-alpine
WORKDIR /app
COPY ./server .
RUN yarn
COPY --from=build /app/build ./build

EXPOSE 80
CMD ["node", "index"]