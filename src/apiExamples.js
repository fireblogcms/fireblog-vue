import i18n from "./i18n/index";

export default ({ slug, locale }) => [
  {
    id: "getBlogIinformations",
    label: i18n.t("apiModal.GetBlogInformations"),
    snippet: `
    {
      blog {
        name
        description
        image
      }
    }
  `
  },
  {
    id: "getAllPublishedPosts",
    label: i18n.t("apiModal.getAllPublishedPosts"),
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
`
  },
  {
    id: "getSinglePostBySlug",
    label: i18n.t("apiModal.getASinglePostBySlug"),
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
  }
];
