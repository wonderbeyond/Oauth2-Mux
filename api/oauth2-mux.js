import ClientOAuth2 from 'client-oauth2';
import yaml from 'js-yaml';

const oauth2Providers = yaml.safeLoad(process.env.OAUTH2_PROVIDERS, 'utf8');

const clients = {};
const trustedOrigins = process.env.TRUSTED_ORIGINS.replace(/[\r\n]/g, '').split(/\s*,\s*/);

for (let [p, s] of Object.entries(oauth2Providers.providers)) {
  clients[p] = new ClientOAuth2({
    clientId: s.clientId,
    clientSecret: s.clientSecret,
    authorizationUri: s.authorizationUri,
    accessTokenUri: s.accessTokenUri,
    scopes: s.scopes,
    // eslint-disable-next-line prettier/prettier
    redirectUri: `${process.env.SERVICE_PUBLIC_ORIGIN || ''}/${p}/callback`,
  });
}

export function authorize(req, res) {
  const client = clients[req.query.provider];

  if (!req.query.redirect_uri) {
    // next(new Error('no redirectUri found!'));
    res.status(400).send('no redirectUri found!')
    return;
  }

  const muxRUrl = new URL(req.query.redirect_uri);
  const muxRUrlOrigin = `${muxRUrl.protocol}//${muxRUrl.host}`;

  if (!trustedOrigins.includes(muxRUrlOrigin)) {
    // next(new Error('invalid redirectUri, pls. check TRUSTED_ORIGINS server config.'));
    res.status(500).send('invalid redirectUri, pls. check TRUSTED_ORIGINS server config.')
    return;
  }

  // rUrl: redirect_uri passed to oauth2 provider
  // mux_redirect_uri: redirect uri for end clients
  let rUrl = new URL(client.options.redirectUri);
  rUrl.searchParams.set('mux_redirect_uri', req.query.redirect_uri);
  client.options.redirectUri = rUrl.href;
  const state = `${req.query.provider}-${+new Date()}`;
  // return res.redirect(client.code.getUri({ state }));
  res.status(302);
  res.setHeader('Location', client.code.getUri({ state }));
  res.end();
}

export async function callback(req, res) {
  const client = clients[req.query.provider];
  let user;

  try {
    user = await client.code.getToken(req.url);
  } catch (err) {
    // next(err);
    res.status(500).send(`Error while exchange access_token by grant code: ${err.toString()}`);
    return;
  }

  let rUrl = new URL(req.query.mux_redirect_uri);
  rUrl.searchParams.set('oauth2_provider', req.query.provider);
  rUrl.searchParams.set('access_token', user.accessToken);
  rUrl.searchParams.set('token_type', user.tokenType);
  if (user.scope) {
    rUrl.searchParams.set('scope', user.scope);
  }
  // res.redirect(rUrl.href);
  res.status(302);
  res.setHeader('Location', rUrl.href);
  res.end();
}
