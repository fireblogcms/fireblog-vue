<template>
  <div>
    <AppLoader v-if="initDataState === 'PENDING'" />
    <AppError v-if="errorMessage">{{errorMessage}}</AppError>
    <div v-if="initDataState === REQUEST_STATE.FINISHED_OK" class="post-form-wrapper">
      <!-- debug form values -->
      <pre v-if="false">{{form}}</pre>

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
    </div>

    <BulmaModal v-model="modal.show">
      <template #title>{{modal.title}}</template>
      <template #body>{{modal.content}}</template>
      <template #footer>
        <div
          v-if="modal.confirmText && modal.confirmCallback"
          @click="modal.confirmCallback"
          class="button is-danger"
        >{{modal.confirmText}}</div>
        <div
          v-if="modal.cancelText && modal.cancelCallback"
          @click="modal.cancelCallback"
          class="button is-primary"
        >{{modal.cancelText}}</div>
      </template>
    </BulmaModal>

    <!-- PUBLISH MODAL -->

    <BulmaModal
      class="publication-settings-modal"
      :fullscreen="true"
      v-model="publicationSettingsModal.show"
    >
      <template #body>
        <div class="container">
          <PostFormAdvancedSettings
            :postForm="form"
            :existingPost="existingPost"
            :savingPost="savingPost"
            @onCancelClick="publicationSettingsModal.show = false"
            @onPublishClick="onPublishClick"
          />
        </div>
      </template>
      <template class="has-text-centered" #footer></template>
    </BulmaModal>

    <!-- HURRAH MODAL -->
    <BulmaModal class="hurrah-modal" v-model="publishingHurrahModal.show" :whiteFooter="true">
      <template #body>
        <div class="has-text-centered">
          <h1 class="title is-1 has-text-centered">Hurrah ! Your post have been published !</h1>
          <img style="border-radius:5px" :src="getRandomHurrahGif()" />
        </div>
      </template>
      <template class="has-text-centered" #footer>
        <button
          @click="publishingHurrahModal.show = false"
          class="button is-primary is-large"
        >Okay !</button>
      </template>
    </BulmaModal>

    <BulmaModal
      class="publishing-changes-modal"
      v-model="publishingChangesModal.show"
      :whiteFooter="true"
    >
      <template #title></template>
      <template #body>
        <div class="has-text-centered">
          <h1
            style="padding:30px;"
            class="title is-3 has-text-centered"
          >Your changes have been published !</h1>
          <img style="border-radius:5px" :src="getRandomHurrahGif()" />
        </div>
      </template>
      <template class="has-text-centered" #footer>
        <button
          @click="publishingChangesModal.show = false"
          class="button is-primary is-large"
        >Okay !</button>
      </template>
    </BulmaModal>

    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <span @click="onBackToPostsClick" style="cursor:pointer" class="item tag is-medium">
        <em>
          <img style="position:relative;height:20px !important;top:4px;" src="/images/book.png" />
          <IconBack />posts
        </em>
      </span>

      <span
        v-if="initDataState === 'FINISHED_OK'"
        class="item"
        style="color:rgba(0,0,0, 0.6);font-size:14px;"
      >
        <em>
          {{getCurrentPublicationStatus()}}
          <span
            v-if="getCurrentPublicationStatus() === 'DRAFT' && lastTimeSaved"
          >- saved at {{ lastTimeSaved | moment("HH:mm:ss") }}</span>
        </em>
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
        @click="onPublicationClick()"
        v-if="!existingPost || existingPost.status.includes('DRAFT', 'BIN')"
        class="button is-outlined item is-primary"
        :class="{ 'is-loading': savingPost.state === 'PENDING' && savingPost.publicationStatus === 'PUBLISHED' }"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >PUBLICATION</button>

      <button
        @click="onPublicationClick()"
        v-if="existingPost && existingPost.status === 'PUBLISHED'"
        class="button item is-outlined is-primary"
        :class="{ 'is-loading': savingPost.state === 'PENDING' && savingPost.publicationStatus === 'PUBLISHED'}"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >
        PUBLISH CHANGES
        <span class="animated bounce" v-if="changesDetected">*</span>
      </button>

      <!--
      <button
        :disabled="savingPost.state === 'PENDING'"
        @click="onProofreadClick()"
        class="button is-outlined item"
        type="submit"
      >PROOFREAD</button>
      -->
    </portal>
    <!-- END TOPBAR RIGHT BUTTONS -->
  </div>
</template>

<script>
import AppLoader from "../components/AppLoader";
import Editor from "@ckeditor/ckeditor5-build-balloon-block";
import CKEditor from "@ckeditor/ckeditor5-vue";
import gql from "graphql-tag";
import AppError from "./AppError";
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
  createSlug,
  ckeditorIframelyMediaProvider,
  graphQLErrorsContainsCode
} from "../utils/helpers";
import { richPreviewLinksAuthorizedDomains } from "../../config";
import striptags from "striptags";

const PostResponseFragment = gql`
  fragment PostResponse on Post {
    _id
    title
    content
    status
    slug
    teaser
    publishedAt
    image
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
  "https://media.giphy.com/media/7IW6Jnw29TYmgkuu3M/giphy.gif",
  "https://media.giphy.com/media/Wq2xnn2ZnwiTtoD6Qk/giphy.gif",
  "http://giphygifs.s3.amazonaws.com/media/7vfhdCIn13zm8/giphy.gif"
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
      hello: "world",
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
      publicationSettingsModal: {
        show: false
      },
      publishingHurrahModal: {
        show: false
      },
      publishingChangesModal: {
        show: false
      }
    };
  },
  provide() {
    return {
      form: this.form,
      savingPost: this.savingPost,
      // we use a function here because of https://github.com/vuejs/vue/issues/7017
      existingPost: () => {
        return this.existingPost ? this.existingPost : null;
      }
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
        previewsInData: false,
        providers: [ckeditorIframelyMediaProvider()]
      }
    };
  },
  mounted() {
    this.onKeyPress = (event) => {
      const {
        metaKey,
        key,
        ctrlKey,
        type,
      } = event;
      if (key !== "s") return;

      const isMac = navigator.platform.includes("Mac")

      if (isMac && !metaKey) return;
      if (!isMac && !ctrlKey) return;

      event.preventDefault();

      if (type !== "keydown") return;

      // dates is to throttle (if you spam ctrl + s it will works once per second)
      if (this.lastTimeSaved && Date.now() - this.lastTimeSaved < 1000) return;
      // timeout is to debounce (if you keep down ctrl + s it will save only once)
      if (this.timeoutSaving) clearTimeout(this.timeoutSaving)
      this.timeoutSaving = setTimeout(
        () => {
          this.lastTimeSaved = Date.now();
          this.onSaveDraftClick()
        },
        200,
      )
    };

    window.addEventListener("keydown", this.onKeyPress);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.onKeyPress);
    window.onbeforeunload = null;
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
          if (this.$store.state.postJustPublished === true) {
            this.$store.commit("postJustPublished", false);
            this.publishingHurrahModal.show = true;
          }
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
      this.errorMessage = null;
      if (!STATUS_ENUM[status]) {
        throw new Error(
          `Received unknown status ${status}. Status MUST be one of the following value: ` +
            Object.values(STATUS_ENUM).join(", ")
        );
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
            this.errorMessage = "Sorry, publishing failed: " + error;
            if (this.publicationSettingsModal.show) {
              this.publicationSettingsModal.show = false;
            }
            throw new Error(error);
          });
      }
      if (this.getCurrentOperation() === "UPDATE") {
        const post = {
          ...this.preparePostFromCurrentFormValues(),
          status
        };
        if (
          this.existingPost.status !== "PUBLISHED" &&
          status === "PUBLISHED"
        ) {
          post.publishedAt = new Date();
        }
        return this.updatePost(post)
          .then(result => {
            this.savingPost.state = REQUEST_STATE.FINISHED_OK;
            return result;
          })
          .catch(error => {
            this.errorMessage = "Sorry, publish operation failed: " + error;
            this.savingPost.state = REQUEST_STATE.FINISHED_ERROR;
            if (this.publicationSettingsModal.show) {
              this.publicationSettingsModal.show = false;
            }
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
          cancelText: "Save and quit",
          confirmText: "Quit without saving",
          confirmCallback: () => {
            this.$router.push({
              name: "postList",
              params: { blogId: this.$route.params.blogId }
            });
          },
          cancelCallback: () => {
            this.onSaveDraftClick().then(() => {
              this.modal.show = false;
              this.$router.push({
                name: "postList",
                params: { blogId: this.$route.params.blogId }
              });
            });
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
    onEditorReady(editor) {
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
    onPublishClick() {
      // If article is published or re-published from draft, we display a "Hurrah modal".
      // If we only publish changes on a already published articles, we have a more
      // sober modal.
      let publishingChanges = false;
      if (this.existingPost && this.existingPost.status === "PUBLISHED") {
        publishingChanges = true;
      }
      this.form.errors = this.getFormErrors();
      if (Object.keys(this.form.errors).length > 0) {
        return false;
      } else {
        this.savePost(STATUS_ENUM.PUBLISHED).then(() => {
          this.publicationSettingsModal.show = false;
          if (publishingChanges === true) {
            this.publishingChangesModal.show = true;
          } else {
            this.publishingHurrahModal.show = true;
          }
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
    /**
     * At least a title is required to begin publication process.
     */
    postFormIsValid() {
      let isValid = true;
      if (!this.form.values.current.title.trim()) {
        alert("A title is required");
        isValid = false;
      }
      return isValid;
    },
    onPublicationClick() {
      if (!this.postFormIsValid()) {
        return;
      }

      if (this.mediaLoadingCounter > 0) {
        this.showMediaCurrentlyLoadingModal();
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
        // pre-fill teaser fied with the first sentence of the text.
        if (!this.form.values.initial.teaser.trim()) {
          this.form.values.current.teaser = striptags(
            this.form.values.current.content.substr(0, 250)
          );
        }
        this.publicationSettingsModal.show = true;
      }
    },
    onUnpublishClick() {
      this.savePost(STATUS_ENUM.DRAFT);
    },
    onSaveDraftClick() {
      if (!this.postFormIsValid()) {
        return Promise.reject("Form values are invalid");
      } else if (this.mediaLoadingCounter > 0) {
        Promise.reject("Media are currently loading");
        this.showMediaCurrentlyLoadingModal();
      } else {
        return this.savePost(STATUS_ENUM.DRAFT);
      }
    },
    showMediaCurrentlyLoadingModal() {
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
      post.locale = blog.contentDefaultLocale.replace("-", "_");
      return apolloClient
        .mutate({
          mutation: createPostQuery,
          variables: { post }
        })
        .then(result => {
          this.lastTimeSaved = Date.now();
          this.existingPost = result.data.createPost;
          // post is created, we are now in UPDATE mode for the form.
          if (this.existingPost.status === "PUBLISHED") {
            this.$store.commit("postJustPublished", true);
          }
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
      this.form.values.initial.image = post.image ? post.image : "";
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
        teaser: this.form.values.current.teaser,
        image: this.form.values.current.image
      };
    },
    getRandomHurrahGif() {
      return randomHurraGifs[
        Math.floor(Math.floor(Math.random() * randomHurraGifs.length))
      ];
    },
    getFormErrors() {
      const errors = {};
      // validate that slug is an url
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(this.form.values.current.slug)) {
        errors.slug = "Slug can only contains minusculs dans '-' characters.";
      }
      if (!this.form.values.current.slug.trim()) {
        errors.slug = "Slug is required";
      }
      if (!this.form.values.current.teaser.trim()) {
        errors.teaser = "Teaser is required";
      }
      return errors;
    }
  }
};
</script>

<style>
.post-form-wrapper {
  padding-top: 30px;
  padding-bottom: 30px;
}

.post-form-wrapper > form {
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  font-family: "Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
  padding: 30px;
  margin: auto;
  margin-bottom: 40px;
  max-width: 940px;
  padding: 2rem 4rem;
  font-weight: 400;
  background: white;
}
.post-form-wrapper textarea#title {
  background: transparent;
  font-family: Roslindale, serif;
  text-align: left;
  font-size: 53px;
  width: 100%;
  border: none !important;
  border-color: none;
  outline: none !important;
}
.post-form-wrapper .ck-content {
  color: #222;
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
.post-form-wrapper .ck-toolbar {
  background: white;
  border: none;
}
.post-form-wrapper .ck-editor__editable p,
.post-form-wrapper .ck-editor__editable li,
.post-form-wrapper .ck-editor__editable a {
  font-size: 21px;
}
.post-form-wrapper .ck-editor__editable h4 {
  font-size: 28px;
}
.post-form-wrapper .ck-editor__editable h3 {
  font-size: 34px;
}
.post-form-wrapper .ck-editor__editable h2 {
  font-size: 40px;
}

@media screen and (max-width: 768px) {
  .post-form-wrapper form {
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
</style>
