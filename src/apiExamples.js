import i18n from "./i18n/index";

export default ({ slug, locale }) => [
  {
    id: "getBlogIinformations",
    label: i18n.t("apiModal.getBlogInformations"),
    snippet: `
    {
      blog {
        name
        description
        image {
          url
          alt
        }
      }
    }
  `
  },
  {
    id: "getAllPublishedPosts",
    label: i18n.t("apiModal.getAllPublishedPosts"),
    snippet: `
{
  posts(last:50) {
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
        image {
          url
          alt
        }
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
    image {
      url
      alt
    }
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
