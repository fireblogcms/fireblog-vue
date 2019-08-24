import { GraphQLClient } from "graphql-request";
import { getAccessToken } from "./auth";

export default function graphqlClient() {
  let headers = {};
  let token = getAccessToken();
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  // @FIXME : use apollo to a avoid creating a new GraphQL client on each request.
  return new GraphQLClient(process.env.VUE_APP_GRAPHQL_URL, {
    headers
  });
}
