import apolloClient from "./apolloClient";
import gql from "graphql-tag";
import { localStorageUser } from "./auth";

export const REQUEST_STATE = {
  NOT_STARTED: "NOT_STARTED",
  PENDING: "PENDING",
  FINISHED_OK: "FINISHED_OK",
  FINISHED_ERROR: "FINISHED_ERROR"
};

export function getUser() {
  // User is cached in local storage.
  if (localStorage.getItem("user")) {
    console.log("user loaded from cache");
    return Promise.resolve(JSON.parse(localStorage.getItem("user")));
  }
  return apolloClient
    .query({
      query: gql`
        query getUser {
          me {
            _id
            name
            email
            createdAt
            updatedAt
            picture
          }
        }
      `
    })
    .then(result => {
      console.log("user loaded from server");
      localStorage.setItem(localStorageUser, JSON.stringify(result.data.me));
      return result.data.me;
    });
}

export function graphQLErrorsContainsTokenExpiredError(graphQLErrors) {
  let result = false;
  graphQLErrors.forEach(error => {
    if (
      error.extensions &&
      error.extensions.code &&
      error.extensions.code === "TOKEN_EXPIRED"
    )
      result = true;
  });
  return result;
}
