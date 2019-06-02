import auth0 from "auth0-js";
import { EventEmitter } from "events";
import podClient from "../lib/podClient";

const webAuth = new auth0.WebAuth({
  domain: process.env.VUE_APP_AUTH0_DOMAIN,
  redirectUri: `${window.location.origin}/callback`,
  clientID: process.env.VUE_APP_AUTH0_CLIENTID,
  responseType: "id_token token",
  scope: "openid profile email"
});

const localStorageKey = "tokenExpiry";
const loginEvent = "loginEvent";

class AuthService extends EventEmitter {
  idToken = null;
  profile = null;
  tokenExpiry = null;

  login(customState) {
    webAuth.authorize({
      appState: customState
    });
  }

  getUser() {
    return JSON.parse(localStorage.getItem("podUser"));
  }

  logOut() {
    localStorage.removeItem(localStorageKey);

    this.idToken = null;
    this.tokenExpiry = null;
    this.profile = null;

    webAuth.logout({
      returnTo: `${window.location.origin}`
    });

    this.emit(loginEvent, { loggedIn: false });
  }

  handleAuthentication() {
    return new Promise((resolve, reject) => {
      webAuth.parseHash((err, authResult) => {
        console.log("authResult", authResult);
        if (err) {
          this.emit(loginEvent, {
            loggedIn: false,
            error: err,
            errorMsg: err.statusText
          });
          reject(err);
        } else {
          this.localLogin(authResult);
          resolve(authResult.idToken);
        }
      });
    });
  }

  isAuthenticated() {
    return Date.now() < new Date(localStorage.getItem("tokenExpiry"));
  }

  isIdTokenValid() {
    return this.idToken && this.tokenExpiry && Date.now() < this.tokenExpiry;
  }

  getIdToken() {
    return new Promise((resolve, reject) => {
      if (this.isIdTokenValid()) {
        resolve(this.idToken);
      } else if (this.isAuthenticated()) {
        this.renewTokens().then(authResult => {
          resolve(authResult.idToken);
        }, reject);
      } else {
        resolve();
      }
    });
  }

  syncUserWithServer({ auth0_user_id, email, name, picture }) {
    return podClient.request(
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
        userInput: { auth0_user_id, email, name, picture }
      }
    );
  }

  localLogin(authResult) {
    this.idToken = authResult.idToken;
    this.profile = authResult.idTokenPayload;

    // Convert the expiry time from seconds to milliseconds,
    // required by the Date constructor
    this.tokenExpiry = new Date(this.profile.exp * 1000);

    localStorage.setItem(localStorageKey, this.tokenExpiry);
    localStorage.setItem("podUser", JSON.stringify(this.profile));

    this.syncUserWithServer({
      auth0_user_id: this.profile.sub,
      email: this.profile.email,
      name: this.profile.name,
      picture: this.profile.picture ? this.profile.picture : null
    });

    this.emit(loginEvent, {
      loggedIn: true,
      profile: authResult.idTokenPayload,
      state: authResult.appState || {}
    });
  }

  renewTokens() {
    return new Promise((resolve, reject) => {
      if (!this.isAuthenticated()) {
        return reject("Not logged in");
      }

      webAuth.checkSession({}, (err, authResult) => {
        if (err) {
          reject(err);
        } else {
          this.localLogin(authResult);
          resolve(authResult);
        }
      });
    });
  }
}

const service = new AuthService();

service.setMaxListeners(5);

export default service;
