import gql from "graphql-tag";

export default gql`
  {
    pods(last: 100) {
      edges {
        cursor
        node {
          name
          description
          updatedAt
          createdAt
        }
      }
    }
  }
`;
