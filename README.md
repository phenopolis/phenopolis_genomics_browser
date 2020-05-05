# Phenopolis React Frontend

DEV: [![Netlify Status](https://api.netlify.com/api/v1/badges/b51ae4bc-d393-4f78-8303-0ec6ee4f2825/deploy-status)](https://app.netlify.com/sites/phenopolis-react-dev/deploys)
LIVE: [![Netlify Status](https://api.netlify.com/api/v1/badges/bb56af63-0d92-4259-9884-b6795cffad1d/deploy-status)](https://app.netlify.com/sites/phenopolis/deploys)


Note: pushing to the master branch triggers an automatic build at
[https://phenopolis-react-dev.netlify.com/](https://phenopolis-react-dev.netlify.com/)

## Installation

### Requirements

- Node JS (version ...)

### Dependencies

Install all dependencies

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
```
This will display:
```
netlify link will connect this folder to a site on Netlify

? How do you want to link this folder to a site?
❯ Use current git remote origin (https://github.com/phenopolis/phenopolis_frontend_react)
  Search by full or partial site name
  Choose from a list of your recently updated sites
  Enter a site ID

```
Select `Use current git remote origin...`

Then Select `phenopolis-react-dev`

3. Start Dev server:

```bash
# copy _redirects_dev to _redirects
cp _redirects_dev _redirects

netlify dev
```

> Note: If there are any issues remove the node_modules folder and re-install
