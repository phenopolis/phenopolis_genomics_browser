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

npm install -g netlify-cli concurrently
```

## Run Dev Server

Start Dev server:

```bash
concurrently "npm run watch" "netlify dev"

# (Any issues remove the node_modules folder and re-install)...
```
