FROM node:12.13.1 as build
ARG GoogleApiKey
RUN test -n "$GoogleApiKey"

WORKDIR /app
COPY ./client/package.json ./client/yarn.lock ./
RUN yarn
COPY ./client .
RUN echo "REACT_APP_GOOGLE_API_KEY=$GoogleApiKey" > .env
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