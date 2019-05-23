import { GraphQLClient } from "graphql-request";

console.log("GRAPHQL_URL", process.env.VUE_APP_GRAPHQL_URL);
const client = new GraphQLClient(process.env.VUE_APP_GRAPHQL_URL, {
  headers: {}
});

export default client;
