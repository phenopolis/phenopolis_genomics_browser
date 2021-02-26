FROM node:14.4.0

WORKDIR /app

RUN npm install -g npm
RUN npm install --global netlify-cli
COPY package.json package-lock.json .npmrc ./
RUN npm install

ENV PATH /app/node_modules/.bin:$PATH

CMD ["netlify", "dev"]
