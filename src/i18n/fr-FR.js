export default {
  dictionnary: {
    draft: "Brouillon",
    published: "Publié",
    deleted: "supprimé",
    close: "fermer"
  },
  views: {
    apiUsage: {
      title: "Consommation API"
    },
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
            label: "Une description qui donne envie de lire votre blog",
            help:
              "Celle-ci sera affichée par les moteurs de recherche ou quand le lien de votre blog sera partagé sur les réseaux sociaux."
          },
          image: {
            label: "Une belle image qui représente votre blog",
            help:
              "Celle-ci sera utilisée pour illustrer le lien de votre blog quand il sera partagé sur les réseaux sociaux"
          }
        },
        notifications: {
          saved: "Les modifications des réglages généraux ont été enregistrées."
        },
        saveButton: "Enregistrer"
      },
      technicalSettingsForm: {
        title: "Réglages techniques",
        fields: {
          url: {
            label: "Url absolue de votre blog"
          },
          webhooks: {
            label: "Webhooks à appeler quand le contenu du site change",
            help:
              "Ces webhooks seront appelés à chaque fois que le contenu de votre site change. Vous pouvez spécifier plusieurs urls en les séparant par des virgules"
          }
        },
        notifications: {
          saved:
            "Les modifications des réglages techniques ont été enregistrées."
        },
        saveButton: "Enregistrer"
      },
      dangerZone: {
        title: "Zone dangereuse",
        deleteBlog: "Supprimer ce blog"
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
      changesNotSavedModal: {
        title: "Des modifications du post n'ont pas été sauvegardées",
        content: "Si vous quittez maintenant, vos changement seront perdus.",
        saveAndQuit: "Sauvegarder et quitter",
        quitWithoutSaving: "Quitter sans sauvegarder"
      },
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
      },
      firstPublicationHurralModal: {
        title: "Hourrah ! Votre post a été publié !",
        okayButton: "Ok !"
      },
      publishChangesHurralModal: {
        title: "Vos changement ont été publiés !",
        okayButton: "Ok !"
      },
      mediaUploadingModal: {
        title: "Nous n'avons pas fini d'uploder vos media",
        content:
          "Un media est toujours en cours d'upload | {count} media sont actuellement en cours d'upload",
        cancelText: "Attendre que les uploads soient terminés!",
        confirmText: "Quitter quand même"
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
