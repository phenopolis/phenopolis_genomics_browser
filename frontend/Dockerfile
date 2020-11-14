FROM node:14.4.0

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm install
RUN npm install --global netlify-cli@2.68

COPY . ./

ENV PATH /app/node_modules/.bin:$PATH

CMD ["netlify", "dev"]
