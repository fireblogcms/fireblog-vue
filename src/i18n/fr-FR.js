export default {
  dictionnary: {
    draft: "Brouillon",
    published: "Publié",
    deleted: "supprimé"
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
      },
      updatedOn: "mis à jour le {date}",
      publishedOn: "publié le {date}"
    },
    postForm: {
      saveDraft: "Sauvegarder le brouillon",
      publication: "Publication",
      unpublish: "Dépublier",
      publishChanges: "Publier les changements",
      publishNow: "Publier maintenant",
      publicationCancel: "Annuler",
      fields: {
        title: {
          placeholder: "title"
        },
        content: {
          placeholder: "content"
        },
        featuredImage: {
          label: "Image à la une"
        },
        teaser: {
          label: "Accroche",
          help:
            "Un texte court et percutant pour donner envie à vos lecteurs de lire votre billet. 250 characters max.",
          errors: {
            required: "Le champ accroche est obligatoire."
          }
        },
        slug: {
          label: "slug",
          help: "Utilisé pour construire une url SEO-friendly pour votre post",
          errors: {
            invalidCharacters:
              "Le slug peut seulement contenir des minuscules et le caractère '-'",
            required: "Le champ slug est obligatoire"
          }
        }
      },
      previews: {
        general: {
          name: "Prévisualiation",
          description:
            "Une approximation de comment apparaitra votre article lorsque son lien sera partagé sur d'autres sites (Facebook, linkedin, twitter, etc)"
        }
      }
    }
  },
  topbar: {
    accountMenu: {
      myAccount: "Mon compte",
      logout: "Se déconnecter"
    }
  },
  apiModal: {
    title: "API GraphQL",
    tryItButton: "Essayer!",
    openGraphQLExplorer: "Ouvrir l'explorateur GraphQL",
    getAllPublishedPosts: "Obtenir la liste des posts publiés",
    getASinglePostBySlug: "Obtenir un post par son slug",
    GetBlogInformations: "Obtenir les informations du blog"
  }
};
