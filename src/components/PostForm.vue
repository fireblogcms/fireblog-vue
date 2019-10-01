<template>
  <div class="writeForm">
    <!-- debug form values -->
    <pre v-if="true">{{form}}</pre>

    <AppError v-if="errorMessage">{{errorMessage}}</AppError>

    <AppLoader v-if="initDataState === 'PENDING'" />

    <template v-if="initDataState === REQUEST_STATE.FINISHED_OK">
      <!-- FORM -->
      <form @submit.prevent>
        <textarea-autosize
          maxlength="250"
          @keydown.enter.native.prevent="onTitleEnter"
          autofocus
          rows="1"
          placeholder="Title"
          type="text"
          id="title"
          :disabled="savingDraftState ===  REQUEST_STATE.PENDING"
          :value="form.values.initial.title"
          @input="onTitleInput"
        ></textarea-autosize>
        <ckeditor
          class="content"
          :disabled="savingDraftState ===  REQUEST_STATE.PENDING"
          ref="ckeditor"
          :value="form.values.initial.content"
          :editor="editor"
          @input="onContentInput"
          @ready="onEditorReady"
          :config="editorConfig"
        ></ckeditor>
      </form>
    </template>

    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <span @click="onBackToPostsClick" style="cursor:pointer" class="item tag is-medium">
        <em>
          <img style="position:relative;height:20px !important;top:4px;" src="/images/book.png" />
          <IconBack />posts
        </em>
      </span>

      <span
        class="item button animated bouncedIn"
        style="border:0;color:rgba(0,0,0, 0.5);font-size:14px;position:relative;top:2px"
        v-if="lastTimeSaved"
      >
        <em>{{getCurrentPublicationStatus()}} - saved at {{ lastTimeSaved | moment("HH:mm:ss") }}</em>
      </span>
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

    <!-- TOPBAR RIGHT BUTTONS -->
    <portal to="topbar-right" v-if="initDataState === 'FINISHED_OK'">
      <button
        v-if="getCurrentPublicationStatus() === 'DRAFT'"
        @click="onSaveDraftClick()"
        class="button is-outlined item"
        :class="{ 'is-loading': savingPost.state === 'PENDING' && savingPost.publicationStatus === 'DRAFT' }"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >
        SAVE DRAFT
        <span class="animated bounce" v-if="changesDetected">*</span>
      </button>

      <button
        @click="onUnpublishClick()"
        v-if="existingPost && existingPost.status === 'PUBLISHED'"
        class="button is-outlined item"
        :class="{'is-loading':  savingPost.state === 'PENDING' && savingPost.publicationStatus === 'DRAFT' }"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >UNPUBLISH</button>

      <button
        @click="onPublishClick()"
        v-if="!existingPost || existingPost.status.includes('DRAFT', 'BIN')"
        class="button is-outlined item is-primary"
        :class="{ 'is-loading': savingPost.state === 'PENDING' && savingPost.publicationStatus === 'PUBLISHED' }"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >BEGIN PUBLICATION</button>

      <button
        @click="onPublishClick()"
        v-if="existingPost && existingPost.status === 'PUBLISHED'"
        class="button item is-outlined is-primary"
        :class="{ 'is-loading': savingPost.state === 'PENDING' && savingPost.publicationStatus === 'PUBLISHED'}"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >
        PUBLISH CHANGES
        <span class="animated bounce" v-if="changesDetected">*</span>
      </button>

      <button
        :disabled="savingPost.state === 'PENDING'"
        @click="onProofreadClick()"
        class="button is-outlined item"
        type="submit"
      >PROOFREAD</button>
    </portal>
    <!-- END TOPBAR RIGHT BUTTONS -->

    <BulmaModal v-model="modal.show">
      <template #title>{{modal.title}}</template>
      <template #body>{{modal.content}}</template>
      <template #footer>
        <div
          v-if="modal.cancelText && modal.cancelCallback"
          @click="modal.cancelCallback"
          class="button is-primary"
        >{{modal.cancelText}}</div>
        <div
          v-if="modal.confirmText && modal.confirmCallback"
          @click="modal.confirmCallback"
          class="button is-danger"
        >{{modal.confirmText}}</div>
      </template>
    </BulmaModal>

    <BulmaModal class="settings-modal animated fadeIn" v-model="settingsModal.show">
      <template #body>
        <PostFormAdvancedSettings :form="form" />
      </template>
      <template class="has-text-centered" #footer>
        <button @click="settingsModal.show = false" class="button is-large">Cancel</button>

        <button
          @click="onPublishConfirmClick"
          :class="{ 'is-loading': savingPost.state === 'PENDING' && savingPost.publicationStatus === 'PUBLISHED'}"
          :disabled="savingPost.state === 'PENDING'"
          class="button is-primary is-large"
        >{{getCurrentPublicationStatus() === 'PUBLISHED' ? "Publish changes !" : "Publish now !"}}</button>
      </template>
    </BulmaModal>

    <BulmaModal class="hurrah-modal animated fadeIn" v-model="hurrahModal.show">
      <template #body>
        <div class="has-text-centered">
          <h1 class="title is-1 has-text-centered">Hurrah ! Your post have been published !</h1>
          <img style="border-radius:5px" :src="getRandomHurrahGif()" />
        </div>
      </template>
      <template class="has-text-centered" #footer>
        <button @click="hurrahModal.show = false" class="button is-primary is-large">Okay !</button>
      </template>
    </BulmaModal>
  </div>
</template>

<script>
import AppLoader from "../components/AppLoader";
import Editor from "@ckeditor/ckeditor5-build-balloon-block";
import CKEditor from "@ckeditor/ckeditor5-vue";
import gql from "graphql-tag";
import AppError from "./AppError";
import hotkeys from "hotkeys-js";
import logger from "../utils/logger";
import BulmaModal from "./BulmaModal";
import IconBack from "./IconBack";
import PostFormAdvancedSettings from "./PostFormAdvancedSettings";
import apolloClient from "../utils/apolloClient";
import { ckeditorCloudinaryDirectUploadAdapterPlugin } from "../utils/ckeditorCloudinaryDirectUploadAdapter";
import {
  REQUEST_STATE,
  getUser,
  getBlog,
  formInitData,
  createSlug
} from "../utils/helpers";
import { richPreviewLinksAuthorizedDomains } from "../../config";

const PostResponseFragment = gql`
  fragment PostResponse on Post {
    _id
    title
    content
    status
    slug
    teaser
    publishedAt
    author {
      _id
      name
      email
    }
  }
`;

const createPostQuery = gql`
  ${PostResponseFragment}
  mutation createPostQuery($post: CreatePostInput!) {
    createPost(post: $post) {
      ...PostResponse
    }
  }
`;

const updatePostQuery = gql`
  ${PostResponseFragment}
  mutation updatePostQuery($post: UpdatePostInput!) {
    updatePost(post: $post) {
      ...PostResponse
    }
  }
`;

const getExistingPostQuery = gql`
  ${PostResponseFragment}
  query getExistingPostQuery($_id: ID!) {
    post(_id: $_id) {
      ...PostResponse
    }
  }
`;

const randomHurraGifs = [
  "https://media.giphy.com/media/3kD2Eciolhy4VOzjRV/giphy.gif",
  "https://media.giphy.com/media/sRHX9qwNKQaQB48RAM/giphy.gif",
  "https://media.giphy.com/media/7IW6Jnw29TYmgkuu3M/giphy.gif",
  "https://media.giphy.com/media/Wq2xnn2ZnwiTtoD6Qk/giphy.gif"
];

const OPERATION_TYPE = {
  CREATE: "CREATE",
  UPDATE: "UPDATE"
};

const STATUS_ENUM = {
  PUBLISHED: "PUBLISHED",
  DRAFT: "DRAFT",
  BIN: "BIN"
};

const initialFormValues = {
  title: "",
  content: "",
  slug: "",
  teaser: ""
};

export default {
  components: {
    ckeditor: CKEditor.component,
    AppLoader,
    AppError,
    BulmaModal,
    IconBack,
    PostFormAdvancedSettings
  },
  data() {
    return {
      initDataState: REQUEST_STATE.NOT_STARTED,
      publishPostState: REQUEST_STATE.NOT_STARTED,
      unpublishPostState: REQUEST_STATE.NOT_STARTED,
      savingDraftState: REQUEST_STATE.NOT_STARTED,
      changesDetected: false,
      mediaLoadingCounter: 0,
      lastTimeSaved: null,
      existingPost: null,
      errorMessage: null,
      savingPost: {
        state: REQUEST_STATE.NOT_STARTED,
        publicationStatus: null
      },
      form: formInitData({ initialFormValues }),
      modal: {
        show: false,
        title: null,
        content: null,
        confirmText: null,
        confirmCallback: () => {},
        cancelText: null,
        cancelCallback: () => {}
      },
      settingsModal: {
        show: false
      },
      hurrahModal: {
        show: false
      }
    };
  },
  provide() {
    return {
      form: this.form
    };
  },
  created() {
    this.initData();
    window.onbeforeunload = function(e) {
      return "Are you sure you want to quit ?";
    };
    this.REQUEST_STATE = REQUEST_STATE;
    this.OPERATION_TYPE = OPERATION_TYPE;
    this.editor = Editor;
    this.editorConfig = {
      extraPlugins: [
        ckeditorCloudinaryDirectUploadAdapterPlugin({
          onRequestStateChange: ({ state, file }) => {
            if (state === REQUEST_STATE.PENDING) {
              this.mediaLoadingCounter = this.mediaLoadingCounter + 1;
            }
            if (
              state === REQUEST_STATE.FINISHED_OK ||
              state === REQUEST_STATE.FINISHED_ERROR
            )
              this.mediaLoadingCounter = this.mediaLoadingCounter - 1;
          }
        })
      ],
      toolbar: [
        "bold",
        "italic",
        "link",
        "heading",
        "blockQuote",
        "bulletedList"
      ],
      blockToolbar: ["imageUpload", "mediaEmbed"],
      image: {
        toolbar: ["imageTextAlternative"]
      },
      mediaEmbed: {
        // Previews are always enabled if there’s a provider for a URL (below regex catches all URLs)
        // By default `previewsInData` are disabled, but let’s set it to `false` explicitely to be sure
        previewsInData: false,
        providers: [
          {
            // hint: this is just for previews. Get actual HTML codes by making API calls from your CMS
            name: "iframely previews",
            // Match all URLs or just the ones you need:
            url: /.+/,
            //url: new RegExp(richPreviewLinksAuthorizedDomains.join("|")),
            html: match => {
              const url = match[0];
              var iframeUrl = `//cdn.iframe.ly/api/iframe?app=1&api_key=${
                process.env.VUE_APP_IFRAMELY_API_KEY
              }&url=${encodeURIComponent(url)}`;
              // alternatively, use &key= instead of &api_key with the MD5 hash of your api_key
              // more about it: https://iframely.com/docs/allow-origins
              return (
                // If you need, set maxwidth and other styles for 'iframely-embed' class - it's yours to customize
                '<div class="iframely-embed">' +
                '<div class="iframely-responsive">' +
                "loading ..." +
                `<iframe src="${iframeUrl}" ` +
                'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
                "</iframe>" +
                "</div>" +
                "</div>"
              );
            }
          }
        ]
      }
    };
    hotkeys("ctrl+s,command+s", (event, handler) => {
      // Prevent the default refresh event under WINDOWS system
      // this.onSaveDraftClick();
      event.preventDefault();
    });
  },
  beforeDestroy() {
    window.onbeforeunload = null;
    hotkeys.unbind("ctrl+s");
    hotkeys.unbind("command+s");
  },
  watch: {
    "form.values": {
      deep: true,
      handler() {
        this.changesDetected = this.detectChanges().changesDetected;
      }
    }
  },
  methods: {
    initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      const promises = [];
      promises.push(getBlog(this.$route.params.blogId));
      if (this.getCurrentOperation() === OPERATION_TYPE.UPDATE) {
        promises.push(this.getExistingPost());
      }
      return Promise.all(promises)
        .then(results => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          throw new Error(error);
        });
    },
    getCurrentPublicationStatus() {
      return this.existingPost ? this.existingPost.status : "DRAFT";
    },
    savePost(status) {
      if (!STATUS_ENUM[status]) {
        throw new Error(
          `Received unknown status ${status}. Status MUST be one of the following value: ` +
            Object.values(STATUS_ENUM).join(", ")
        );
      }
      if (!this.form.values.current.title.trim()) {
        alert("A title is required");
        return Promise.reject("A title is required");
      }
      this.savingPost.state = REQUEST_STATE.PENDING;
      this.savingPost.publicationStatus = status;
      if (this.getCurrentOperation() === "CREATE") {
        const newPost = {
          ...this.preparePostFromCurrentFormValues(),
          status
        };
        if (status === "PUBLISHED") {
          newPost.publishedAt = new Date();
        }
        return this.createPost(newPost)
          .then(result => {
            this.savingPost.state = REQUEST_STATE.FINISHED_OK;
            return result;
          })
          .catch(error => {
            this.savingPost.state = REQUEST_STATE.FINISHED_ERROR;
            this.errorMessage = "Sorry, publishing failed.";
            throw new Error(error);
          });
      }
      if (this.getCurrentOperation() === "UPDATE") {
        const post = {
          ...this.preparePostFromCurrentFormValues(),
          status
        };
        if (status === "PUBLISHED") {
          post.publishedAt = new Date();
        }
        return this.updatePost(post)
          .then(result => {
            this.savingPost.state = REQUEST_STATE.FINISHED_OK;
            return result;
          })
          .catch(error => {
            this.errorMessage = "Sorry, publish operation failed.";
            this.saveDraft.state = REQUEST_STATE.FINISHED_ERROR;
            throw new Error(error);
          });
      }
    },
    onBackToPostsClick() {
      if (this.mediaLoadingCounter > 0) {
        this.modal = {
          show: true,
          title: "We haven' finished uploading your media",
          content: `${this.mediaLoadingCounter} media ${
            this.mediaLoadingCounter > 1 ? "are" : "is"
          } currently uploading`,
          cancelText: "Wait for uploads to complete!",
          confirmText: "Quit anyway",
          confirmCallback: () => {
            this.$router.push({
              name: "postList",
              params: { blogId: this.$route.params.blogId }
            });
          },
          cancelCallback: () => {
            this.modal.show = false;
          }
        };
      } else if (this.changesDetected) {
        this.modal = {
          show: true,
          title: "Some changes have not been saved",
          content: `If you quit now, your last changes will be lost`,
          cancelText: "Save my changes first",
          confirmText: "Quit anyway.",
          confirmCallback: () => {
            this.$router.push({
              name: "postList",
              params: { blogId: this.$route.params.blogId }
            });
          },
          cancelCallback: () => {
            this.modal.show = false;
          }
        };
      } else {
        this.$router.push({
          name: "postList",
          params: { blogId: this.$route.params.blogId }
        });
      }
    },
    detectChanges() {
      const modifiedValues = {};
      Object.keys(this.form.values.initial).forEach(key => {
        if (this.form.values.initial[key] !== this.form.values.current[key]) {
          modifiedValues[key] = true;
        } else {
          modifiedValues[key] = false;
        }
      });
      return {
        modifiedValues,
        changesDetected:
          Object.values(modifiedValues).filter(v => v === true).length > 0
            ? true
            : false
      };
    },
    onTitleInput(value) {
      this.form.values.current.title = value;
    },
    onContentInput(value) {
      this.form.values.current.content = value;
    },
    onEditorReady() {
      const element = document.querySelector(
        ".ck-block-toolbar-button .ck-tooltip__text"
      );
      const toolTip = "Add media";
      element.innerHTML = toolTip;
      element.innerText = toolTip;
    },
    // when user click "enter" in the title input,
    // automically move cursor to the textarea
    onTitleEnter() {
      this.$refs.ckeditor.$el.focus();
    },
    onPublishConfirmClick() {
      this.form.errors = this.getFormErrors();
      if (Object.keys(this.form.errors).length > 0) {
        return false;
      } else {
        this.savePost("PUBLISHED").then(() => {
          this.settingsModal.show = false;
          this.hurrahModal.show = true;
        });
      }
    },
    /**
     * Determine if we are currently creating a new post or updating an existing one.
     */
    getCurrentOperation() {
      return this.$route.params.postId
        ? OPERATION_TYPE.UPDATE
        : OPERATION_TYPE.CREATE;
    },
    getExistingPost() {
      return apolloClient
        .query({
          query: getExistingPostQuery,
          variables: { _id: this.$route.params.postId }
        })
        .then(result => {
          this.existingPost = result.data.post;
          this.prepareFormValuesFromPost(this.existingPost);
        })
        .catch(error => {
          this.errorMessage = "En error occured while loading post";
          throw new Error(error);
        });
    },
    onPublishClick() {
      if (this.mediaLoadingCounter > 0) {
        this.modal = {
          show: true,
          title: "We can't publish now",
          content: `${this.mediaLoadingCounter} media ${
            this.mediaLoadingCounter > 1 ? "are" : "is"
          } currently uploading`,
          cancelText: "Wait for uploads to complete!",
          cancelCallback: () => {
            this.modal.show = false;
          }
        };
      } else {
        if (!this.form.values.initial.slug.trim()) {
          this.form.values.current.slug = createSlug(
            this.form.values.current.title,
            {
              replacement: "-",
              lower: true
            }
          );
        }
        this.settingsModal.show = true;

        //this.savePost(STATUS_ENUM.PUBLISHED);
      }
    },
    onUnpublishClick() {
      this.savePost(STATUS_ENUM.DRAFT);
    },
    onSaveDraftClick() {
      this.savePost(STATUS_ENUM.DRAFT);
    },
    onProofreadClick() {
      this.savePost(STATUS_ENUM.DRAFT).then(() => {
        this.$router.newTab({ name: "postProofread" });
      });
    },
    async createPost(post) {
      const user = await getUser();
      const blog = await getBlog(this.$route.params.blogId);
      // current user as author by default. But another user might have been defined
      // as the author, so do not override if this is already set.
      if (!post.author) {
        post.author = user._id;
      }
      post.blog = this.$route.params.blogId;
      post.language = blog.contentDefaultLanguage.replace("-", "_");
      return apolloClient
        .mutate({
          mutation: createPostQuery,
          variables: { post }
        })
        .then(result => {
          this.lastTimeSaved = Date.now();
          this.existingPost = result.data.createPost;
          // post is created, we are now in UPDATE mode for the form.
          this.$router.replace({
            name: "postUpdate",
            params: {
              blogId: this.$route.params.blogId,
              postId: result.data.createPost._id
            }
          });
          return result;
        })
        .catch(error => {
          this.errorMessage = "😞Sorry, an error occured while creating post.";
          throw new Error(error);
        });
    },
    updatePost(post) {
      if (!post._id) {
        post._id = this.$route.params.postId;
      }
      return apolloClient
        .mutate({
          mutation: updatePostQuery,
          variables: {
            post
          }
        })
        .then(result => {
          this.lastTimeSaved = Date.now();
          this.existingPost = result.data.updatePost;
          this.changesDetected = false;
          return result;
        })
        .catch(error => {
          this.errorMessage = "😞Sorry, an error occured updating post";
          throw new Error(error);
        });
    },
    saveDraft() {
      this.savingDraftState = REQUEST_STATE.PENDING;
      // NEW POST
      if (this.getCurrentOperation() === OPERATION_TYPE.CREATE) {
        const newPost = {
          ...this.preparePostFromCurrentFormValues(),
          status: "DRAFT"
        };
        this.createPost(newPost)
          .then(() => {
            this.savingDraftState = REQUEST_STATE.FINISHED_OK;
          })
          .catch(error => {
            this.savingDraftState = REQUEST_STATE.FINISHED_ERROR;
            throw new Error(error);
          });
      }
      // EDITING EXISTING POST
      if (this.getCurrentOperation() === OPERATION_TYPE.UPDATE) {
        const post = {
          ...this.preparePostFromCurrentFormValues(),
          status: "DRAFT",
          _id: this.$route.params.postId
        };
        this.prepareFormValuesFromPost(post);
        this.updatePost(post)
          .then(() => {
            this.savingDraftState = REQUEST_STATE.FINISHED_OK;
          })
          .catch(error => {
            this.savingDraftState = REQUEST_STATE.FINISHED_ERROR;
            this.errorMessage = "Sorry, an error occured while saving draft.";
            throw new Error(error);
          });
      }
    },
    prepareFormValuesFromPost(post) {
      // initial
      this.form.values.initial.title = post.title;
      this.form.values.initial.content = post.content ? post.content : "";
      this.form.values.initial.slug = post.slug ? post.slug : "";
      this.form.values.initial.teaser = post.teaser ? post.teaser : "";
      this.form.values.current = {
        ...this.form.values.initial
      };
    },
    // Prepare a post object from form form.values
    preparePostFromCurrentFormValues() {
      return {
        title: this.form.values.current.title,
        content: this.form.values.current.content,
        slug: this.form.values.current.slug,
        teaser: this.form.values.current.teaser
      };
    },
    getRandomHurrahGif() {
      return randomHurraGifs[
        Math.floor(Math.floor(Math.random() * randomHurraGifs.length))
      ];
    },
    getFormErrors() {
      const errors = {};
      if (!this.form.values.current.title.trim()) {
        errors.title = "Title is required";
      }
      // validate that slug is an url
      if (!/^[a-z](-?[a-z])*$/.test(this.form.values.current.slug)) {
        errors.slug = "Slug can only contains minusculs dans '-' characters.";
      }
      if (!this.form.values.current.slug.trim()) {
        errors.slug = "Slug is required";
      }
      //// slug regex: ^[a-z](-?[a-z])*$
      //if ()
      if (!this.form.values.current.teaser.trim()) {
        errors.teaser = "Teaser is required";
      }
      return errors;
    }
  }
};
</script>

<style>
.writeForm {
  background-color: white;
}

.writeForm form {
  font-family: "Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
  padding: 0 2rem;
  margin: auto;
  max-width: 940px;
  padding: 2rem 4rem;
}
.writeForm textarea#title {
  background: transparent;
  font-family: Roslindale, serif;
  text-align: left;
  font-size: 53px;
  width: 100%;
  border: none !important;
  border-color: none;
  outline: none !important;
}
.writeForm .ck-content {
  padding: 0rem 2rem;
  background: transparent;
  text-align: left;
  min-height: 70vh;
  border: none !important;
  border-color: none;
  outline: none !important;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none !important;
  border-color: #a0c0e4;
  border-radius: 2px;
  outline: none;
  padding: 1px;
  margin: 0;
  resize: none; /*remove the resize handle on the bottom right*/
  line-height: 1.8;
}
.writeForm .ck-toolbar {
  background: white;
  border: none;
}
.writeForm .ck-editor__editable p,
.writeForm .ck-editor__editable li,
.writeForm .ck-editor__editable a {
  font-size: 21px;
}
.writeForm .ck-editor__editable h4 {
  font-size: 28px;
}
.writeForm .ck-editor__editable h3 {
  font-size: 34px;
}
.writeForm .ck-editor__editable h2 {
  font-size: 40px;
}

@media screen and (max-width: 768px) {
  .writeForm form {
    padding: 1rem;
  }
}

/**
 * Replace "P" paragraph icon to a "+" to add media
 */
button.ck-block-toolbar-button {
  background-image: url("/images/editor-button-plus.svg") !important;
  background-repeat: no-repeat !important;
  cursor: pointer !important;
}

button.ck-block-toolbar-button:hover {
  background-color: transparent;
}

.ck-block-toolbar-button svg {
  display: none;
}

.ck-block-toolbar-button .ck.ck-icon {
  font-size: 2em !important;
}

.settings-modal .modal-close {
  background: black;
  top: 40px;
}

.settings-modal .modal-card {
  border-radius: 5px;
  width: 95%;
  height: 100%;
}

.hurrah-modal .modal-card {
  border-radius: 5px;
}
</style>
