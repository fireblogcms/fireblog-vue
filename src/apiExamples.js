export default ({ postId, language }) => [
  {
    label: "Get all posts",
    id: "getAllPosts",
    snippet: `
{
  posts(last: 50, language:${language.replace("-", "_")}) {
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
        teaser
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
`
  },
  {
    id: "getSinglePost",
    label: "Get a single post",
    snippet: `
{
  post(_id: "${postId}") {
    slug
    title
    content
    publishedAt
    image
    author {
      name
      email
      picture
    }
  }
}
    `
  }
];
