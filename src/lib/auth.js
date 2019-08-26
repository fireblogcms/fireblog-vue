import auth0 from "auth0-js";
import apolloClient from "./apolloClient";
import gql from "graphql-tag";

// access Token received by auth0, to request our GraphQL API
export const localStorageAccessToken = "accessToken";
// user received by auth0 token
export const localStorageAuth0User = "auth0User";
// user received from graphql server
export const localStorageUser = "user";

export const auth0client = new auth0.WebAuth({
  audience: process.env.VUE_APP_AUTH0_AUDIENCE,
  domain: process.env.VUE_APP_AUTH0_DOMAIN,
  redirectUri: `${process.env.VUE_APP_BASE_URL}/auth0-callback`,
  clientID: process.env.VUE_APP_AUTH0_CLIENTID,
  // id_token:  get user profile
  // access token: access token to request our custom API, containing permissions
  responseType: "id_token token",
  // request all openid fields (sub, ssi, etc) + email + full profile data
  scope: "openid email profile"
});

// @FIXME : we should not store accessTokenin local storage for security reason.
// Good enough for the proto.
export function localLogin(authResult) {
  const user = authResult.idTokenPayload;
  localStorage.setItem(localStorageAccessToken, authResult.accessToken);
  localStorage.setItem(localStorageAuth0User, JSON.stringify(user));
  return syncUserWithServer({
    _id: user.sub,
    email: user.email,
    name: user.name,
    picture: user.picture ? user.picture : null
  });
}

export function logout() {
  // access Token received by auth0, to request our GraphQL API
  localStorage.removeItem(localStorageAccessToken);
  // user received by auth0 token
  localStorage.removeItem(localStorageAuth0User);
  // user from Server, set by getUser()
  localStorage.removeItem(localStorageUser);
}

export function getAccessToken() {
  return localStorage.getItem(localStorageAccessToken);
}

export function isAuthenticated() {
  const user = getLocalUser();
  if (!user) {
    return false;
  }
  const tokenExpiry = new Date(user.exp * 1000);
  return user && tokenExpiry > Date.now();
}

export function getLocalUser() {
  return JSON.parse(localStorage.getItem(localStorageAuth0User));
}

function syncUserWithServer({ _id, email, name, picture }) {
  return apolloClient.mutate({
    mutation: gql`
      mutation($user: UserUpsertInput!) {
        upsertUser(user: $user) {
          email
          name
          picture
          _id
        }
      }
    `,
    variables: {
      user: { _id, email, name, picture }
    }
  });
}
