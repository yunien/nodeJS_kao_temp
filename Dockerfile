FROM node:8.10-alpine

COPY ./ /usr/local/SeV

WORKDIR /usr/local/SeV

RUN apk update 

RUN apk add python make g++
 
RUN npm install -g  nodemon

RUN npm install

RUN chmod 755 -R /usr/local/SeV

EXPOSE 8080

ADD docker-entrypoint.sh /

RUN ["chmod", "+x", "/docker-entrypoint.sh"]

ENTRYPOINT ["/docker-entrypoint.sh"]

