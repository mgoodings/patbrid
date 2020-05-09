FROM node:12-alpine

WORKDIR /workspace

RUN mkdir -p /watch && mkdir -p /download

COPY package.json yarn.lock /workspace/
RUN yarn install --frozen-lockfile

ADD . /workspace

CMD yarn start
