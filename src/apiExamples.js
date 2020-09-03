import i18n from "./i18n/index";

export default ({ blogId, slug, locale }) => [
  {
    id: "getBlogIinformations",
    label: i18n.t("apiModal.getBlogInformations"),
    snippet: `
    {
      blog(_id:"${blogId}") {
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
      blog(_id: "${blogId}") {
        posts(first: 20) {
          totalCount
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          edges {
            node {
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
      }
    }    
`,
  },
  {
    id: "getSinglePostBySlug",
    label: i18n.t("apiModal.getASinglePostBySlug"),
    snippet: `
    {
      post(slug: "${slug}", blogId: "${blogId}") {
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
    `,
  },
  {
    id: "getAllBlogsIinformations",
    label: i18n.t("apiModal.getAllBlogsInformations"),
    snippet: `
    {
      blogs(first:20) {
        edges {
          node {
            name
            description
            image {
              url
            }
          }
        }
      }
    }
  `,
  },
];
