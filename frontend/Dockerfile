FROM node:16.2.0

WORKDIR /app

RUN npm install -g netlify-cli react-scripts

COPY package.json yarn.lock .yarnrc.yml .pnp.cjs ./
COPY .yarn/ ./.yarn/
RUN yarn install

CMD ["netlify", "dev"]
