// @see https://www.apollographql.com/docs/react/basics/setup.html
// @see https://www.apollographql.com/docs/react/api/apollo-client.html
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { InMemoryCache } from "apollo-cache-inmemory";
import { setContext } from "apollo-link-context";
import { createUploadLink } from "apollo-upload-client";
import { onError } from "apollo-link-error";
import { auth0Client } from "./auth";
import { uploadFetch } from "./helpers";

// Custom fetch to track upload progress from uploads mutation.
// @see https://github.com/jaydenseric/apollo-upload-client/issues/88#issuecomment-468318261
const customFetch = (uri, options) => {
  if (options.useUpload) {
    return uploadFetch(uri, options);
  }
  return fetch(uri, options);
};

// An httpLink than support uploading files.
const uploadLink = createUploadLink({
  uri: process.env.VUE_APP_GRAPHQL_URL,
  fetch: customFetch
});

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  let additionnalHeaders = {};
  let token = null;
  const auth0 = await auth0Client();
  token = await auth0.getTokenSilently();

  if (token) {
    additionnalHeaders.authorization = `Bearer ${token}`;
  }
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      ...additionnalHeaders
    }
  };
});

/**
 * infos:
 * - graphQLErrors (array)
 * - networkError (object)
 * - operation (object) - infos about GraphqlQuery
 */
const onErrorLink = onError(infos => {});

const link = ApolloLink.from([authLink, onErrorLink, uploadLink]);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV === "development" ? true : false,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-first",
      // Any GraphQL Errors are treated the same as network errors and any data is ignored from the response.
      errorPolicy: "none"
    },
    query: {
      fetchPolicy: "cache-first",
      // Any GraphQL Errors are treated the same as network errors and any data is ignored from the response.
      errorPolicy: "none"
    },
    mutate: {
      fetchPolicy: "no-cache",
      // Any GraphQL Errors are treated the same as network errors and any data is ignored from the response.
      errorPolicy: "none"
    }
  }
});

export default client;
