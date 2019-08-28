import apolloClient from "./apolloClient";
import gql from "graphql-tag";
import { localStorageDatabaseUser } from "./auth";

export const REQUEST_STATE = {
  NOT_STARTED: "NOT_STARTED",
  PENDING: "PENDING",
  FINISHED_OK: "FINISHED_OK",
  FINISHED_ERROR: "FINISHED_ERROR"
};

/**
 * Get full user from our database.
 */
export function getUser() {
  // User is cached in local storage.
  if (localStorage.getItem(localStorageDatabaseUser)) {
    return Promise.resolve(
      JSON.parse(localStorage.getItem(localStorageDatabaseUser))
    );
  } else {
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
        // save to local storage if we have a user object
        if (result.data.me && result.data.me._id) {
          localStorage.setItem(
            localStorageDatabaseUser,
            JSON.stringify(result.data.me)
          );
          return result.data.me;
        }
      });
  }
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
