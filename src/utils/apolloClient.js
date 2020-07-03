// @see https://www.apollographql.com/docs/react/basics/setup.html
// @see https://www.apollographql.com/docs/react/api/apollo-client.html
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { onError } from "apollo-link-error";
import { InMemoryCache } from "apollo-cache-inmemory";
import { auth0Client } from "./auth";

// An httpLink than support uploading files.
const httpLink = createHttpLink({
  uri: process.env.VUE_APP_GRAPHQL_URL,
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
      ...additionnalHeaders,
    },
  };
});

/**
 * infos:
 * - graphQLErrors (array)
 * - networkError (object)
 * - operation (object) - infos about GraphqlQuery
 */
const errorLink = onError(infos => {});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, errorLink, httpLink]),
  fetchOptions: {
    mode: "no-cors",
  },
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV === "development" ? true : false,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
      // Any GraphQL Errors are treated the same as network errors and any data is ignored from the response.
      errorPolicy: "none",
    },
    query: {
      fetchPolicy: "no-cache",
      // Any GraphQL Errors are treated the same as network errors and any data is ignored from the response.
      errorPolicy: "none",
    },
    mutate: {
      fetchPolicy: "no-cache",
      // Any GraphQL Errors are treated the same as network errors and any data is ignored from the response.
      errorPolicy: "none",
    },
  },
});

export default client;
