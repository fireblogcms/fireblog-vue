export default () => `
  {
    posts(last: 50) {
      PageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          slug
          title
          content
          updatedAt
          publishedAt
          author {
            name
            email
            picture
          }
        }
      }
    }
  }
`;
