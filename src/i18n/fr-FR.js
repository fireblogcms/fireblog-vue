export default {
  "fr-FR": {
    topbar: {
      accountMenu: {
        myAccount: "My account",
        logout: "Logout"
      }
    },
    views: {
      blogList: {
        title: "Mes blogs",
        createNewBlogButton: "Créer un nouveau blog",
        settingsButton: "Réglages"
      },
      blogSettings: {
        generalSettingsForm: {
          title: "Réglages généraux",
          fields: {
            name: {
              label: "Nom",
              errors: { required: "Le champ nom est requis" }
            },
            description: {
              label: "Description"
            }
          },
          saveButton: "Enregistrer"
        },
        technicalSettingsForm: {
          title: "Réglages techniques",
          fields: {
            webhooks: {
              label: "Webhooks de reconstruction du site statique",
              help:
                "Vous pouvez spécifier plusieurs urls en les séparant par des virgules. Ces webhooks seront appelés à chaque fois qu'une reconstruction du site statique sera nécessaire."
            }
          },
          saveButton: "Enregistrer"
        }
      }
    }
  }
};
