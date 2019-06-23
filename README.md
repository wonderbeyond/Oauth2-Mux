# Oauth2-Mux

Self-hosted Oauth2 multiplexer with a single unified redirect_uri which then routed to your own app's URIs.

Your own redirect_uri(s) can belong to multiple domains, regardless of the limitations from oauth2 provider.

Oauth2-Mux can help SPA leverage [Authorization Code Grant](https://tools.ietf.org/html/rfc6749#section-4.1) flow to request an access token at client side.

## Get Started

Get started developing...

```shell
# install deps
npm install

# run in development mode
npm run dev

# run tests
npm run test
```

## Install Dependencies

Install all package dependencies (one time operation)

```shell
npm install
```

## Run It
#### Run in *development* mode:
Runs the application is development mode. Should not be used in production

```shell
npm run dev
```

or debug it

```shell
npm run dev:debug
```

#### Run in *production* mode:

Compiles the application and starts it in production production mode.

```shell
npm run compile
npm start
```

## Test It

Run the Mocha unit tests

```shell
npm test
```

or debug them

```shell
npm run test:debug
```
