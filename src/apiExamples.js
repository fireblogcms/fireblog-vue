import i18n from "./i18n/index";

export default ({ blogId, slug, locale }) => [
  {
    id: "getBlogIinformations",
    label: i18n.t("apiModal.getBlogInformations"),
    snippet: `
{
  blog(filter: {_id: { eq: "${blogId}" } }) {
    name
    description
    image {
      url
    }
  }
}
  `,
  },
  {
    id: "getAllPublishedPosts",
    label: i18n.t("apiModal.getAllPublishedPosts"),
    snippet: `
{
  posts(
    itemsPerPage: 20
    page: 1
    filter: { blog: { eq: "5f4e8705094947778f8da304" } }
  ) {
    pagination {
      totalItems
      totalPages
      hasPreviousPage
      hasNextPage
    }
    items {
      slug
      title
      teaser
      content
      updatedAt
      publishedAt
      imageThumbnail: image(w: 200) {
        url
      }
      imageFull: image {
        url
      }
    }
  }
}    
`,
  },
  {
    id: "getSinglePostBySlug",
    label: i18n.t("apiModal.getASinglePostBySlug"),
    snippet: `
{
  post(filter: { slug: { eq: "${slug}" }, blog: { eq: "5f4e8705094947778f8da304" } }) {
    slug
    title
    content
    publishedAt
    image {
      url
    }
  }
} 
    `,
  },
  {
    id: "getAllBlogsIinformations",
    label: i18n.t("apiModal.getAllBlogsInformations"),
    snippet: `
{
  blogs(itemsPerPage:20, page: 1) {
    pagination {
      totalItems
      totalPages
      hasPreviousPage
      hasNextPage
    }
    items {
      name
      description
      image {
        url
      }
    }
  }
}
  `,
  },
];
