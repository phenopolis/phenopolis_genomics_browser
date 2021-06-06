FROM node:16.2.0

WORKDIR /app

RUN npm install -g netlify-cli react-scripts

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ ./.yarn/releases
RUN yarn install

ENV PATH /app/node_modules/.bin:$PATH

CMD ["netlify", "dev"]
