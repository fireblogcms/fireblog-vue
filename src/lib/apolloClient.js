// @see https://www.apollographql.com/docs/react/basics/setup.html
// @see https://www.apollographql.com/docs/react/api/apollo-client.html
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { setContext } from "apollo-link-context";
import { getAccessToken } from "./auth";
import { createUploadLink } from "apollo-upload-client";

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

const client = new ApolloClient({
  link: authLink.concat(uploadLink),
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV === "development" ? true : false,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
      errorPolicy: "all"
    },
    query: {
      //fetchPolicy: "network-only",
      fetchPolicy: "cache-first",
      errorPolicy: "all"
    },
    mutate: {
      errorPolicy: "all"
    }
  }
});

export default client;
