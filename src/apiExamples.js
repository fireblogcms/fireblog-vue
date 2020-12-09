import i18n from "./i18n/index";

export default ({ blogId, slug, locale }) => [
  {
    id: "getBlogIinformations",
    label: i18n.t("apiModal.getBlogInformations"),
    snippet: `
{
  pod(filter: {_id: { eq: "${blogId}" } }) {
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
  articlesCount(filter: { pod: { eq: "${blogId}" } })
  articles(
    limit: 20
    skip: 0
    filter: { pod: { eq: "${blogId}" } }
  ) {
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
    featured
    metaTitle
    metaDescription
    readingTime
    wordCount
  }
}    
`,
  },
  {
    id: "getSinglePostBySlug",
    label: i18n.t("apiModal.getASinglePostBySlug"),
    snippet: `
  {
    article(
      filter: {
        slug: { eq: "${slug}" }
        pod: { eq: "${blogId}" }
      }
    ) {
      slug
      title
      content
      publishedAt
      image {
        url
      }
      featured
      metaTitle
      metaDescription
      readingTime
      wordCount
    }
  }    
    `,
  },
  {
    id: "getAllBlogsIinformations",
    label: i18n.t("apiModal.getAllBlogsInformations"),
    snippet: `
{
  pods(limit:20) {
    name
    description
    image {
      url
    }
  }
}
  `,
  },
];
