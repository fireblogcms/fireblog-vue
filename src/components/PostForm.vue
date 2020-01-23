<template>
  <div>
    <AppLoader v-if="false && initDataState === 'PENDING'" />
    <div class="post-form-wrapper">
      <pre v-if="false">{{ formGetValues(formId) }}</pre>
      <form @submit.prevent>
        <textarea-autosize
          maxlength="250"
          @keydown.enter.native.prevent="onTitleEnter"
          autofocus
          rows="1"
          :placeholder="$t('views.postForm.fields.title.placeholder')"
          type="text"
          id="title"
          @input="onTitleInput"
          :value="formGetValue('postForm', 'title')"
        ></textarea-autosize>
        <ckeditor
          class="content"
          ref="ckeditor"
          :editor="editor"
          @input="onContentInput"
          :value="formGetValue('postForm', 'content')"
          @ready="onEditorReady"
          :config="editorConfig"
        ></ckeditor>
      </form>
    </div>

    <BulmaModal v-model="modal.show">
      <template #title>{{ modal.title }}</template>
      <template #body>{{ modal.content }}</template>
      <template #footer>
        <div
          v-if="modal.confirmText && modal.confirmCallback"
          @click="modal.confirmCallback"
          class="button is-danger"
        >{{ modal.confirmText }}</div>
        <div
          v-if="modal.cancelText && modal.cancelCallback"
          @click="modal.cancelCallback"
          class="button is-primary"
        >{{ modal.cancelText }}</div>
      </template>
    </BulmaModal>

    <!-- ADVANCED SETTINGS MODAL -->
    <BulmaModal
      class="publication-settings-modal animated zoomIn"
      :fullscreen="true"
      v-model="publicationSettingsModal.show"
    >
      <template #body>
        <div class="container">
          <PostFormAdvancedSettings
            :existingPost="existingPost"
            :savingPost="savingPost"
            @onCancelClick="publicationSettingsModal.show = false"
            @onUploadingStateChange="state => (uploadingState = state)"
          />
        </div>
      </template>
      <template #title>
        <div>
          <span class="title is-2">{{ $t("views.postForm.advancedSettingsModal.title") }}</span>
          <!-- PUBLISH BUTTON -->
          <button
            style="margin-right:20px;"
            class="button is-primary is-pulled-right is-large"
            @click="publish"
            :disabled="
                savingPost.state === 'PENDING' || uploadingState === 'PENDING'
              "
            :class="{
                'is-loading':
                  savingPost.state === 'PENDING' &&
                  savingPost.publicationStatus === 'PUBLISHED'
              }"
          >
            {{
            existingPost && existingPost.status === "PUBLISHED"
            ? $t("views.postForm.publishNowButton")
            : $t("views.postForm.publishChangesButton")
            }}
          </button>

          <button
            style="margin-right:20px;"
            @click="publicationSettingsModal.show = false"
            class="button is-pulled-right is-large"
          >{{ $t("views.postForm.publicationCancel") }}</button>
        </div>
      </template>
      <template #footer />
    </BulmaModal>

    <!-- HURRAH MODAL FOR FIRST PUBLICATION -->
    <BulmaModal class="hurrah-modal" v-model="publishingHurrahModal.show" :whiteFooter="true">
      <template #title>
        <div class="has-text-centered">{{ $t("views.postForm.firstPublicationHurralModal.title") }}</div>
      </template>
      <template #body>
        <div class="has-text-centered">
          <img style="border-radius:5px" :src="getRandomHurrahGif()" />
        </div>
      </template>
      <template class="has-text-centered" #footer>
        <button
          @click="publishingHurrahModal.show = false"
          class="button is-primary is-large"
        >{{ $t("views.postForm.firstPublicationHurralModal.okayButton") }}</button>
      </template>
    </BulmaModal>

    <!-- HURRAH MODAL WHEN PUBLISHING CHANGES ON ALREADY PUBLISHED POST -->
    <BulmaModal class="publishing-changes-modal" v-model="publishingChangesModal.show">
      <template #title>
        <div class="has-text-centered">{{ $t("views.postForm.publishChangesHurralModal.title") }}</div>
      </template>
      <template #body>
        <div class="has-text-centered">
          <img style="border-radius:5px" :src="getRandomHurrahGif()" />
        </div>
      </template>
      <template class="has-text-centered" #footer>
        <button
          @click="publishingChangesModal.show = false"
          class="button is-primary is-large"
        >{{ $t("views.postForm.publishChangesHurralModal.okayButton") }}</button>
      </template>
    </BulmaModal>

    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <span @click="onBackToPostsClick" style="cursor:pointer" class="item tag is-large">
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
          {{ $t("global." + getCurrentPublicationStatus().toLowerCase()) }}
          <span
            v-if="existingPost && getCurrentPublicationStatus() === 'DRAFT'"
          >- {{ savedAt }}</span>
        </em>
      </span>
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

    <!-- TOPBAR RIGHT BUTTONS -->
    <portal to="topbar-right" v-if="initDataState === 'FINISHED_OK'">
      <!-- SAVE DRAFT BUTTON -->
      <button
        v-if="getCurrentPublicationStatus() === 'DRAFT'"
        @click="saveDraft()"
        class="button is-outlined item"
        :class="{
            'is-loading':
              savingPost.state === 'PENDING' &&
              savingPost.publicationStatus === 'DRAFT'
          }"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >{{ $t("views.postForm.saveDraft").toUpperCase() }}</button>

      <!-- ADVANCED OPTIONS BUTTON -->
      <button
        @click="showAdvancedSettings()"
        v-if="existingPost && existingPost.status === 'PUBLISHED'"
        class="button item is-outlined"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >{{ $t("views.postForm.advancedSettingsButton").toUpperCase() }}</button>

      <!-- BEGIN PUBLICATION BUTTON (launch advanced settings modal) -->
      <button
        @click="showAdvancedSettings()"
        v-if="!existingPost || existingPost.status.includes('DRAFT', 'BIN')"
        class="button is-outlined item is-primary"
        :class="{
            'is-loading':
              savingPost.state === 'PENDING' &&
              savingPost.publicationStatus === 'PUBLISHED'
          }"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >{{ $t("views.postForm.publicationButton").toUpperCase() }}</button>

      <!-- UNPUBLISH BUTTON -->
      <button
        @click="onUnpublishClick()"
        style="margin-right:20px;"
        v-if="existingPost && existingPost.status === 'PUBLISHED'"
        class="button is-outlined"
        :class="{
            'is-loading':
              savingPost.state === 'PENDING' &&
              savingPost.publicationStatus === 'DRAFT'
          }"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >{{ $t("views.postForm.unpublishButton").toUpperCase() }}</button>

      <!-- PUBLISH CHANGES BUTTON -->
      <button
        @click="publish()"
        v-if="existingPost && existingPost.status === 'PUBLISHED'"
        class="button item is-outlined is-primary"
        :class="{
            'is-loading':
              savingPost.state === 'PENDING' &&
              savingPost.publicationStatus === 'PUBLISHED'
          }"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >
        {{ $t("views.postForm.publishChangesButton").toUpperCase() }}
        <span
          class="animated bounce"
          v-if="changesDetected"
        >*</span>
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
import hotkeys from "hotkeys-js";
import logger from "../utils/logger";
import BulmaModal from "./BulmaModal";
import IconBack from "./IconBack";
import PostFormAdvancedSettings from "./PostFormAdvancedSettings";
import apolloClient from "../utils/apolloClient";
import { ckeditorS3UploadAdapterPlugin } from "../utils/ckeditorS3UploadAdapterPlugin";
import {
  REQUEST_STATE,
  getUser,
  getBlog,
  createSlug,
  ckeditorIframelyMediaProvider,
  appNotification,
  validateSlug,
  resetAppNotifications,
  resetApolloCache
} from "../utils/helpers";
import {
  formInit,
  formSetValue,
  formSetError,
  formResetErrors,
  formGetValue,
  formGetErrors,
  formGetValues,
  formGetInitialValues
} from "../utils/vuexForm";

import {
  createPostMutation,
  updatePostMutation,
  getPostQuery,
  getPostsQuery,
  getPostsByStatusQuery
} from "../utils/queries";
import striptags from "striptags";
import debounce from "lodash.debounce";

const randomHurraGifs = [
  "https://media.giphy.com/media/7IW6Jnw29TYmgkuu3M/giphy.gif",
  "https://media.giphy.com/media/Wq2xnn2ZnwiTtoD6Qk/giphy.gif",
  "http://giphygifs.s3.amazonaws.com/media/7vfhdCIn13zm8/giphy.gif",
  "https://66.media.tumblr.com/b53447fe9897178a2b4957a1ab32f6be/tumblr_n19pczDWI21ss6wowo9_250.gifv"
];

const STATUS_ENUM = {
  PUBLISHED: "PUBLISHED",
  DRAFT: "DRAFT",
  DELETED: "DELETED"
};

const formId = "postForm";

const initialFormValues = {
  title: "",
  content: "",
  slug: "",
  teaser: "",
  image: null
};

export default {
  components: {
    ckeditor: CKEditor.component,
    AppLoader,
    BulmaModal,
    IconBack,
    PostFormAdvancedSettings
  },
  data() {
    return {
      initDataState: REQUEST_STATE.NOT_STARTED,
      uploadingState: REQUEST_STATE.NOT_STARTED,
      changesDetected: false,
      mediaLoadingCounter: 0,
      lastTimeSaved: null,
      existingPost: null,
      savingPost: {
        state: REQUEST_STATE.NOT_STARTED,
        publicationStatus: null
      },
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
  mounted() {
    console.log("mounted");
    this.initData();
  },
  created() {
    console.log("created");
    this.formId = formId;
    this.formGetValue = formGetValue;
    this.formGetValues = formGetValues;
    this.REQUEST_STATE = REQUEST_STATE;
    // _.debounce is a function provided by lodash to limit how
    // often a particularly expensive operation can be run.
    this.debouncedAutoSaveDraft = debounce(this.saveDraft, 3000);

    window.onbeforeunload = function(e) {
      this.debouncedAutoSaveDraft.cancel();
      return "Are you sure you want to quit ?";
    };

    this.editor = Editor;
    this.editorConfig = {
      extraPlugins: [
        ckeditorS3UploadAdapterPlugin({
          blogId: this.$route.params.blogId,
          onRequestStateChange: ({ state, file }) => {
            if (state === REQUEST_STATE.PENDING) {
              this.mediaLoadingCounter = this.mediaLoadingCounter + 1;
            }
            if (
              state === REQUEST_STATE.FINISHED_OK ||
              state === REQUEST_STATE.FINISHED_ERROR
            ) {
              this.mediaLoadingCounter = this.mediaLoadingCounter - 1;
            }
            if (state === REQUEST_STATE.ABORTED) {
              this.mediaLoadingCounter = this.mediaLoadingCounter - 1;
            }
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
      blockToolbar: ["imageUpload", "mediaEmbed", "insertTable"],
      image: {
        toolbar: ["imageTextAlternative"]
      },
      mediaEmbed: {
        previewsInData: false,
        providers: [ckeditorIframelyMediaProvider()]
      }
    };
  },
  beforeDestroy() {
    this.debouncedAutoSaveDraft.cancel();
    window.onbeforeunload = null;
    hotkeys.unbind("ctrl+s");
    hotkeys.unbind("command+s");
  },
  /*
  watch: {
    "$store.state.forms.postForm.values": {
      deep: true,
      handler() {
        this.changesDetected = this.detectChanges().changesDetected;
      }
    }
  },
  */
  computed: {
    savedAt() {
      return this.$t("views.postForm.savedAt {time}", {
        time: new Date(this.existingPost.updatedAt).toLocaleTimeString(
          undefined,
          {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          }
        )
      });
    }
  },
  methods: {
    weAreComingFromPostCreation() {
      return (
        this.$store.state.global.postJustCreated === this.$route.params.postId
      );
    },
    /**
     * Init data and provides a fluid experience
     * when switching from "create" to "update" route; which is what happens
     * when we save a new post (/post/create => post/6789Y4HnfeihU9U8978)
     * In this case we don't want user to notice this route change and
     * bother him with loaders and such.
     */
    async initData() {
      console.log("initData()");
      this.initDataState = REQUEST_STATE.PENDING;
      let existingPost = null;

      if (this.getCurrentOperation() === "CREATE") {
        console.log("formInit CREATE", initialFormValues);
        formInit(formId, {
          initialValues: { ...initialFormValues }
        });
      }
      if (this.getCurrentOperation() === "UPDATE") {
        // We just arrived from CREATE page and are now on UPDATE page
        if (this.weAreComingFromPostCreation()) {
          // well, do nothing ih this case, to make sure writer CANNOT LOOSE CONTENT
          // because of the autosave : our form already contain
          // all the data and we don't want to override them at this moment
          // by fetching the existing post : just read our form values already in store.
        }
        // we are in update mode and not coming from creation page: we need to
        // just load existing post and init our form values with it.
        if (!this.weAreComingFromPostCreation()) {
          console.log("formInit UPDATE");
          // reset form values first, otherwise a previous post might be displayed.
          formInit(formId, {
            initialValues: { ...initialFormValues }
          });
          try {
            existingPost = await this.getExistingPost();
            const formValues = {
              ...this.prepareFormValuesFromPost(existingPost)
            };
            // update form value with existing post.
            formInit(formId, {
              initialValues: formValues
            });
          } catch (error) {
            this.initDataState = REQUEST_STATE.FINISHED_ERROR;
            throw new Error(error);
          }
        }
      }

      if (this.$store.state.global.postJustPublished === true) {
        this.$store.commit("postJustPublished", null);
        this.publishingHurrahModal.show = true;
      }

      this.initDataState = REQUEST_STATE.FINISHED_OK;
    },
    getCurrentPublicationStatus() {
      let status = this.existingPost ? this.existingPost.status : "DRAFT";
      return status;
    },
    savePost(status, operation) {
      if (this.savingPost.state === "PENDING") {
        console.log("Post is already currently saving");
      }
      if (!STATUS_ENUM[status]) {
        throw new Error(
          `Received unknown status ${status}. Status MUST be one of the following value: ` +
            Object.values(STATUS_ENUM).join(", ")
        );
      }
      this.savingPost.state = REQUEST_STATE.PENDING;
      this.savingPost.publicationStatus = status;
      console.log(
        "saving post. Current operation " + this.getCurrentOperation()
      );
      if (this.getCurrentOperation() === "CREATE") {
        const newPost = {
          ...this.preparePostFromCurrentFormValues(),
          status
        };
        return this.createPost(newPost)
          .then(result => {
            this.savingPost.state = REQUEST_STATE.FINISHED_OK;
            return result;
          })
          .catch(error => {
            this.savingPost.state = REQUEST_STATE.FINISHED_ERROR;
            appNotification("Sorry, post creation failed: " + error, "error");
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
        return this.updatePost(post)
          .then(result => {
            this.savingPost.state = REQUEST_STATE.FINISHED_OK;
            return result;
          })
          .catch(error => {
            appNotification("Sorry, post creation failed: " + error, "error");
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
          title: this.$t("views.postForm.mediaUploadingModal.title"),
          content: this.$tc(
            "views.postForm.mediaUploadingModal.content",
            this.mediaLoadingCounter
          ),
          cancelText: this.$t("views.postForm.mediaUploadingModal.cancelText"),
          confirmText: this.$t(
            "views.postForm.mediaUploadingModal.confirmText"
          ),
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
          title: this.$t("views.postForm.changesNotSavedModal.title"),
          content: this.$t("views.postForm.changesNotSavedModal.content"),
          cancelText: this.$t(
            "views.postForm.changesNotSavedModal.saveAndQuit"
          ),
          confirmText: this.$t(
            "views.postForm.changesNotSavedModal.quitWithoutSaving"
          ),
          confirmCallback: () => {
            this.$router.push({
              name: "postList",
              params: { blogId: this.$route.params.blogId }
            });
          },
          cancelCallback: () => {
            this.saveDraft().then(() => {
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
      const formValues = formGetValues(formId);
      const formInitialValues = formGetInitialValues(formId);
      Object.keys(formValues).forEach(key => {
        if (formValues[key] !== formInitialValues[key]) {
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
      formSetValue(formId, "title", value);
      if (value.trim() && this.getCurrentOperation() === "UPDATE") {
        this.autoSave();
      }
    },
    onContentInput(value) {
      formSetValue(formId, "content", value);
      this.autoSave();
    },
    onEditorReady(editor) {
      const element = document.querySelector(
        ".ck-block-toolbar-button .ck-tooltip__text"
      );
      const toolTip = "Add media";
      element.innerHTML = toolTip;
      element.innerText = toolTip;

      // allow ctrl+s to be detected on inputs and textareas
      hotkeys.filter = () => true;
      // save shortcuts
      hotkeys("ctrl+s,command+s", (event, handler) => {
        event.preventDefault();
        // Prevent the default refresh event under WINDOWS system
        if (this.existingPost && this.existingPost.status === "PUBLISHED") {
          this.publish();
        } else {
          this.saveDraft()
            .then(() => {
              //toast(this, this.$t("views.postForm.draftSaved"));
            })
            .catch(e => {
              console.log("Cannot be saved: form validation failed: " + e);
            });
        }
        return false;
      });
    },
    // when user click "enter" in the title input,
    // automically move cursor to the textarea
    onTitleEnter() {
      this.$refs.ckeditor.$el.focus();
    },
    autoSave(value) {
      if (
        this.getCurrentOperation() === "CREATE" ||
        (this.existingPost && this.existingPost.status === "DRAFT")
      ) {
        this.saveDraft();
      }
    },
    publish() {
      // If article is published or re-published from draft, we display a "Hurrah modal".
      // If we only publish changes on a already published articles, we have a more
      // sober modal.
      let publishingChanges = false;
      if (this.existingPost && this.existingPost.status === "PUBLISHED") {
        publishingChanges = true;
      }
      const errors = this.validatePostForm("PUBLISH");
      if (Object.keys(errors).length > 0) {
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
      if (this.$route.name === "postUpdate") {
        return "UPDATE";
      }
      if (this.$route.name === "postCreate") {
        return "CREATE";
      }
      return null;
    },
    getExistingPost() {
      return apolloClient
        .query({
          query: getPostQuery,
          variables: { _id: this.$route.params.postId }
        })
        .then(result => {
          this.existingPost = result.data.post;
          return result.data.post;
        })
        .catch(error => {
          appNotification("En error occured while loading post", "error");
          throw new Error(error);
        });
    },
    /**
     * Open publication modal. This is NOT the final publish operation.
     */
    showAdvancedSettings() {
      // we need at least the title to autocomplete the slug field
      if (!formGetValue(formId, "title").trim()) {
        appNotification(
          this.$t("views.postForm.fields.title.errors.required"),
          "error"
        );
      }
      if (this.mediaLoadingCounter > 0) {
        this.showMediaCurrentlyLoadingModal();
      } else {
        if (formGetValue(formId, "slug").trim().length === 0) {
          formSetValue(
            formId,
            "slug",
            createSlug(formGetValue(formId, "title"))
          );
        }
        // pre-fill teaser fied with the first sentence of the text.
        if (formGetValue(formId, "teaser").trim().length === 0) {
          const teaserSuggestion = striptags(
            formGetValue(formId, "content").substr(0, 250)
          );
          formSetValue(formId, "teaser", teaserSuggestion);
        }
        this.publicationSettingsModal.show = true;
      }
    },
    onUnpublishClick() {
      this.savePost(STATUS_ENUM.DRAFT);
    },
    saveDraft() {
      console.log("saveDraft()" + this.getCurrentOperation());
      const errors = this.validatePostForm("SAVE_DRAFT");
      if (Object.keys(errors).length > 0) {
        return Promise.reject(
          "Form values are invalid " + JSON.stringify(errors)
        );
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
      post.blog = this.$route.params.blogId;
      return apolloClient
        .mutate({
          mutation: createPostMutation,
          variables: {
            post
          }
        })
        .then(async result => {
          await resetApolloCache();
          const postId = result.data.createPost._id;
          this.$store.commit("postJustCreated", postId);
          // this flag help us to display hurrah modal after creation, when post is published
          if (result.data.createPost.status === "PUBLISHED") {
            this.$store.commit("postJustPublished", postId);
          }
          this.$router.push({
            name: "postUpdate",
            params: {
              blogId: this.$route.params.blogId,
              postId: postId
            }
          });
          return result;
        })
        .catch(error => {
          appNotification(
            "😞Sorry, an error occured while creating post.",
            "error"
          );
          throw new Error(error);
        });
    },
    updatePost(post) {
      if (!post._id) {
        post._id = this.$route.params.postId;
      }
      return apolloClient
        .mutate({
          mutation: updatePostMutation,
          variables: {
            post
          }
        })
        .then(async result => {
          await resetApolloCache();
          this.existingPost = result.data.updatePost;
          this.changesDetected = false;
          return result;
        })
        .catch(error => {
          appNotification("😞Sorry, an error occured updating post", "error");
          throw new Error(error);
        });
    },
    prepareFormValuesFromPost(post) {
      let values = {
        title: post.title ? post.title : "",
        content: post.content ? post.content : "",
        // slug is the slug value after being slugified by SlugField component
        slug: post.slug ? post.slug : "",
        title: post.title ? post.title : "",
        teaser: post.teaser ? post.teaser : "",
        image: post.image ? post.image : ""
      };
      return values;
    },
    // Prepare a post object from form form.values
    preparePostFromCurrentFormValues() {
      return {
        title: formGetValue(formId, "title"),
        content: formGetValue(formId, "content"),
        slug: formGetValue(formId, "slug"),
        teaser: formGetValue(formId, "teaser"),
        image: formGetValue(formId, "image")
      };
    },
    getRandomHurrahGif() {
      return randomHurraGifs[
        Math.floor(Math.floor(Math.random() * randomHurraGifs.length))
      ];
    },
    /**
     * Validation might differ according to what we are doing. Possibles types are:
     * - SAVE_DRAFT
     * - PUBLISH
     */
    validatePostForm(action = "SAVE_DRAFT") {
      formResetErrors(formId);
      resetAppNotifications();
      // TITLE
      if (!formGetValue(formId, "title").trim()) {
        let message = this.$t("views.postForm.fields.title.errors.required");
        formSetError(formId, "title", message);
        appNotification(message, "error");
      }
      if (action === "PUBLISH") {
        if (!validateSlug(formGetValue(formId, "slug"))) {
          // SLUG
          let message = this.$t(
            "components.slugField.errors.invalidCharacters"
          );
          formSetError(formId, "slug", message);
          appNotification(message, "error");
        }
        if (!formGetValue(formId, "slug").trim()) {
          let message = this.$t("components.slugField.errors.required");
          formSetError(formId, "slug", message);
          appNotification(message, "error");
        }
        // TEASER
        if (!formGetValue(formId, "teaser").trim()) {
          let message = this.$t("views.postForm.fields.teaser.errors.required");
          formSetError(formId, "teaser", message);
          appNotification(message, "error");
        }
      }

      const errors = formGetErrors(formId);
      return errors;
    }
  }
};
</script>

<style>
.post-form-wrapper {
  padding-top: 30px;
  padding-bottom: 30px;
  background: white;
}

.post-form-wrapper > form {
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  font-family: "Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
  padding: 30px;
  margin: auto;
  margin-bottom: 40px;
  max-width: 940px;
  min-height: 1200px;
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
