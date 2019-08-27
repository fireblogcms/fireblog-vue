// @see https://www.apollographql.com/docs/react/basics/setup.html
// @see https://www.apollographql.com/docs/react/api/apollo-client.html
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { InMemoryCache } from "apollo-cache-inmemory";
import { setContext } from "apollo-link-context";
import { getAccessToken } from "./auth";
import { createUploadLink } from "apollo-upload-client";
import { onError } from "apollo-link-error";
import { graphQLErrorsContainsTokenExpiredError } from "./helpers";
import { auth0client } from "./auth";

// An httpLink than support uploading files.
const uploadLink = createUploadLink({ uri: process.env.VUE_APP_GRAPHQL_URL });

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  let additionnalHeaders = {};
  let token = getAccessToken();
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
const logoutLink = onError(infos => {
  // if access token for our GraphQL API has expired, re-authenticate.
  if (graphQLErrorsContainsTokenExpiredError(infos.graphQLErrors)) {
    auth0client.authorize({ target: "/" });
  }
});

const link = ApolloLink.from([authLink, logoutLink, uploadLink]);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV === "development" ? true : false,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
      errorPolicy: "all"
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all"
    },
    mutate: {
      errorPolicy: "all"
    }
  }
});

export default client;
