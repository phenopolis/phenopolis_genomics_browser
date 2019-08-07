# Phenopolis React Frontend

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
