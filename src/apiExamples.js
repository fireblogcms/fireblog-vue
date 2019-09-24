export default ({ postId = "{{POST_ID}}", blogId = "{{BLOG_ID}}" }) => [
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
    author {
      name
      email
      picture
    }
  }
}
    `
  },
  {
    label: "Get all posts",
    id: "getAllPosts",
    snippet: `
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
`
  }
];
