export default {
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
      }
    }
  },
  topbar: {
    accountMenu: {
      myAccount: "My account",
      logout: "Logout"
    }
  }
};
