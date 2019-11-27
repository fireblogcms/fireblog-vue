export default {
  en: {
    topbar: {
      accountMenu: {
        myAccount: "My account",
        logout: "Logout"
      }
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
      }
    }
  }
};
