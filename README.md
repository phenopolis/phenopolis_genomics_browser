# Phenopolis React Frontend

[![Netlify Status](https://api.netlify.com/api/v1/badges/b51ae4bc-d393-4f78-8303-0ec6ee4f2825/deploy-status)](https://app.netlify.com/sites/phenopolis-react-dev/deploys)


Note: pushing to the master branch triggers an automatic build at
[https://phenopolis-react-dev.netlify.com/](https://phenopolis-react-dev.netlify.com/)

## Installation

### Requirements

- Node JS (version ...)

### Dependencies

Install all dependencys

```bash
npm install

npm install -g netlify-cli
```

## Set up Netlify

1. First login into Netlify:

```bash
# use the Phenopolis account
netlify login
# run netlify logout if you are already logged in with a different account
```

2. Then connect the folder to the correct Netlify site:

```bash
netlify link
# Select `Use current git remote origin`
# Then Select `phenopolis-react-dev`
```

3. Start Dev server:

```bash
# copy _redirects_dev to _redirects
cp _redirects_dev _redirects

netlify dev
```

> Note: If there are any issues remove the node_modules folder and re-install
