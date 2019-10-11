export default ({ slug, language }) => [
  {
    id: "getAllPosts",
    label: "Get all posts",
    snippet: `
{
  posts {
    pageInfo {
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
    id: "getSinglePostBySlug",
    label: "Get a single post by slug",
    snippet: `
{
  post(slug: "${slug}") {
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
  },
  {
    id: "getBlogWithPosts",
    label: "Get blog informations",
    snippet: `
    {
      blog {
        name
        description
        owner {
          name
          email
          name
        }
        posts {
          edges {
            node {
              title
              teaser
            }
          }
        }
      }
    }
      
  `
  }
];
