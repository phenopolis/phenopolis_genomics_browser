FROM node:16.2.0

WORKDIR /app

RUN yarn global add netlify-cli

COPY package.json yarn.lock .yarnrc.yml .pnp.cjs ./
COPY .yarn/ ./.yarn/

CMD ["netlify", "dev"]
