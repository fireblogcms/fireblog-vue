export default ({ slug, locale }) => [
  {
    id: 'getAllPublishedPosts',
    label: 'Get all published posts',
    snippet: `
{
  posts {
    totalCount
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
`,
  },
  {
    id: 'getSinglePostBySlug',
    label: 'Get a single post by slug',
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
    `,
  },
  {
    id: 'getBlogWithPosts',
    label: 'Get blog informations',
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
      }
    }
      
  `,
  },
];
