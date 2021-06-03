FROM node:16.2.0

WORKDIR /app

RUN npm install -g netlify-cli react-scripts

COPY package.json yarn.lock .npmrc ./
RUN yarn install --non-interactive --network-timeout 100000

ENV PATH /app/node_modules/.bin:$PATH

CMD ["netlify", "dev"]
