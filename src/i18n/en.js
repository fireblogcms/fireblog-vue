export default {
  dictionnary: {
    draft: "draft",
    published: "published",
    deleted: "deleted"
  },
  views: {
    blogList: {
      title: "My blogs",
      createNewBlogButton: "Create a new blog",
      settingsButton: "Settings"
    },
    blogSettings: {
      generalSettingsForm: {
        title: "General settings",
        fields: {
          name: {
            label: "Name",
            errors: {
              required: "Field name is required"
            }
          },
          description: {
            label: "Description"
          }
        },
        saveButton: "Save"
      },
      technicalSettingsForm: {
        title: "Technical settings",
        fields: {
          webhooks: {
            label: "Static site rebuild webhooks",
            help:
              "You can specify multiple valid URLs by comma-separating them. Those webooks will each time a build of your static blog is needed."
          }
        },
        saveButton: "Save"
      }
    },
    postList: {
      title: "posts",
      firstBlogSentence: "Write your first post in this blog !",
      firstPostWriteButton: "Write",
      writeNewPostButton: "Write new post",
      publishedTab: "Published",
      draftTab: "Draft",
      noPublishedPostFound: "No published post found for now.",
      noDraftPostFound: "No draft post found.",
      backToBlogLink: "My blogs",
      deleteButton: "Delete",
      deleteModal: {
        title: "Delete {postTitle}",
        content:
          "DANGER !\r\n This action cannot be undone. {postTitle} will be deleted.",
        confirmButton: "Delete it.",
        cancelButton: "Oups, no, cancel!"
      },
      updatedOn: "updated on {date}",
      publishedOn: "published on {date}"
    },
    postForm: {
      saveDraft: "Save draft",
      publication: "Publication",
      unpublish: "Unpublish",
      publishChanges: "Publish changes",
      publishNow: "Publish now",
      publicationCancel: "Cancel",
      fields: {
        title: {
          placeholder: "title"
        },
        content: {
          placeholder: "content"
        },
        featuredImage: {
          label: "Featured image"
        },
        teaser: {
          label: "Teaser",
          help:
            "a short introductory for your post that stimulates readers interest. 250 characters max.",
          errors: {
            required: "Teaser field is required."
          }
        },
        slug: {
          label: "slug",
          help: "used to build a seo-friendly url for your post.",
          errors: {
            invalidCharacters:
              "Slug can only contains minuscules and '-' characters.",
            required: "Slug field is required"
          }
        }
      },
      previews: {
        general: {
          name: "Post card preview",
          description:
            "Approximation of how your post will appear when sharing its link on other websites like Twitter, Facebook etc:"
        }
      }
    }
  },
  topbar: {
    accountMenu: {
      myAccount: "My account",
      logout: "Logout"
    }
  },
  apiModal: {
    title: "GRAPHQL API",
    tryItButton: "Try it!",
    openGraphQLExplorer: "Open GraphQL explorer",
    getAllPublishedPosts: "Get all published posts",
    getASinglePostBySlug: "Get a single post by slug",
    GetBlogInformations: "Get blog informations"
  }
};
