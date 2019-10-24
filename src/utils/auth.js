import createAuth0Client from '@auth0/auth0-spa-js';
import apolloClient from './apolloClient';
import gql from 'graphql-tag';
import logger from './logger';

export let auth0 = null;

/**
 * Return Promise.
 * https://auth0.com/docs/libraries/lock/v11/configuration#leeway-integer-
 */
export async function auth0Client() {
  if (!auth0) {
    auth0 = await createAuth0Client({
      audience: process.env.VUE_APP_AUTH0_AUDIENCE,
      domain: process.env.VUE_APP_AUTH0_DOMAIN,
      redirect_uri: `${process.env.VUE_APP_BASE_URL}/auth0-callback`,
      client_id: process.env.VUE_APP_AUTH0_CLIENTID,
      leeway: 300, // avoid "token emitted in the future" error.
      // We request TWO tokens from auth0
      // - "id_token" :  for our web app: contains user informations (name, email etc)
      //    Those informations can be trusted IF the webapp checks the token signature.
      // - "access token": used by our webapp to access our GraphQL API.
      //    access token informs the API that the bearer of the token has been authorized to access the API.
      //    API must check the access token is valid.
      //responseType: "id_token token",
      // request all openid fields (sub, ssi, etc) + email + full profile data
      scope: 'openid email profile',
    });
    return auth0;
  } else {
    return Promise.resolve(auth0);
  }
}

export function syncAuth0UserWithServer({ auth0Id, email, name, picture }) {
  logger.info('debug:syncAuth0UserWithServer()', {
    auth0Id,
    email,
    name,
    picture,
  });
  return apolloClient.mutate({
    mutation: gql`
      mutation syncAuth0UserWithServer($user: syncAuth0UserInput!) {
        syncAuth0User(user: $user) {
          _id
          email
          name
          picture
          auth0Id
        }
      }
    `,
    variables: {
      user: { auth0Id, email, name, picture },
    },
  });
}
