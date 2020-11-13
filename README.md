# fireblog back-office

[![Netlify Status](https://api.netlify.com/api/v1/badges/a7a00840-fd9c-4d4c-97d1-d3c2de4903b0/deploy-status)](https://app.netlify.com/sites/fireblog-app-staging/deploys)

First create and fill a `.env.local` file with all variables from `.env.example` file.

## Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn dev
```

### Compiles and minifies for production

```
yarn build
```

### build report from webpack analyser. This will create a dist/report.html file.

```
yarn build-report
```

### Run your tests

```
yarn test:unit
yarn test:e2e:headless
```

### Lints and fixes files

```
yarn lint
```

### Server local build

```
yarn build && yarn serve
```

Note: must serve site on localhost:8080 to allow Auth0 to work.
