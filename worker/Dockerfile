FROM node:8.10-alpine

COPY ./ /usr/local/Worker

WORKDIR /usr/local/Worker

RUN apk update

RUN apk add python make g++

RUN npm install

RUN chmod 755 -R /usr/local/Worker

ENTRYPOINT ["/usr/local/bin/node","worker/worker.js"]

