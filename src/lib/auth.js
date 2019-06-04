import auth0 from "auth0-js";
import podClient from "./podClient";

export const auth0client = new auth0.WebAuth({
  audience: process.env.VUE_APP_AUTH0_AUDIENCE,
  domain: process.env.VUE_APP_AUTH0_DOMAIN,
  redirectUri: `${process.env.VUE_APP_BASE_URL}/callback`,
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
  console.log("debug authResult", authResult);
  const user = authResult.idTokenPayload;
  localStorage.setItem("accessToken", authResult.accessToken);
  localStorage.setItem("user", JSON.stringify(user));
  return syncUserWithServer({
    _id: user.sub,
    email: user.email,
    name: user.name,
    picture: user.picture ? user.picture : null
  });
}

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function isAuthenticated() {
  const user = getUser();
  if (!user) {
    return false;
  }
  const tokenExpiry = new Date(user.exp * 1000);
  return user && tokenExpiry > Date.now();
}

export function getUser() {
  return JSON.parse(localStorage.getItem("user"));
}

function syncUserWithServer({ _id, email, name, picture }) {
  return podClient().request(
    `
    mutation($userInput: UserInput!) {
      upsertUser(userInput: $userInput ) {
        email
        name
        picture
        _id
      }
    }
  `,
    {
      userInput: { _id, email, name, picture }
    }
  );
}

export function auth0RouterMiddleware(to, from, next) {
  // if route is public, authorized access without checking authentication
  if (to.matched.some(record => record.meta.public === true)) {
    next();
  }
  // do not require
  else if (
    to.path === "/login" ||
    to.path === "/" ||
    to.path === "/callback" ||
    isAuthenticated()
  ) {
    next();
  } else {
    auth0client.authorize({ target: to.path });
    next(false);
  }
}
