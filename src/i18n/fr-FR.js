export default {
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
    },
    postList: {
      title: "posts",
      firstBlogSentence:
        "Il est temps d'écrire le premier article de votre blog!",
      firstPostWriteButton: "Écrire",
      writeNewPostButton: "Écrire un nouveau post",
      publishedTab: "Publiés",
      draftTab: "Brouillons",
      noPublishedPostFound: "Aucun post publié pour le moment.",
      noDraftPostFound: "Aucun brouillon pour le moment.",
      backToBlogLink: "Mes blogs",
      deleteButton: "Supprimer",
      deleteModal: {
        title: "Supprimer {postTitle}",
        content:
          "ATTENTION !\r\n Cette action n'est pas réversible. {postTitle} sera effacé définitivement.",
        confirmButton: "Supprimer.",
        cancelButton: "Oups, non, annuler !"
      }
    }
  },
  topbar: {
    accountMenu: {
      myAccount: "Mon compte",
      logout: "Se déconnecter"
    }
  }
};
