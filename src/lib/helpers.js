import apolloClient from "./apolloClient";
import gql from "graphql-tag";
//import { localStorageDatabaseUser } from "./auth";

export const LOADING_STATE = {
  NOT_STARTED: "NOT_STARTED",
  PENDING: "PENDING",
  COMPLETED_OK: "COMPLETED_OK",
  COMPLETED_ERROR: "COMPLETED_ERROR"
};

/**
 * Get full user from our database.
 */
export function getUser() {
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
      if (result.data.me === null) {
        throw new Error("No logged in user found");
      }
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
