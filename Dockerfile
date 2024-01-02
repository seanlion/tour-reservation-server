# development mode
FROM node:16-alpine
RUN apk add --update --no-cache python3 build-base gcc && ln -sf /usr/bin/python3 /usr/bin/python
WORKDIR /app

COPY package*.json /app
RUN npm cache clean --force
RUN npm ci

COPY . /app
EXPOSE 3000