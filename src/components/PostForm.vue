<template>
  <div>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <AppBreadcrumb
        image="/images/book.png"
        link="postList"
        :name="$t('views.postForm.backToBlogLink')"
      />
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

    <!-- TOPBAR RIGHT BUTTONS -->
    <portal to="topbar-right" v-if="!loadingAsyncData">
      <!-- SAVE DRAFT BUTTON -->
      <button
        v-if="getPostStatus() === 'DRAFT'"
        class="button is-outlined item"
        @click="saveAsDraft"
        :class="{
          'is-loading':
            savingPost.state === 'PENDING' && savingPost.status === 'DRAFT'
        }"
        :disabled="savingPost.state === 'PENDING'"
      >
        {{ $t("views.postForm.saveDraft").toUpperCase() }}
      </button>

      <!-- ADVANCED OPTIONS BUTTON -->
      <button
        @click="showAdvancedSettings()"
        v-if="existingPost && existingPost.status === 'PUBLISHED'"
        class="button item is-outlined"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >
        {{ $t("views.postForm.advancedSettingsButton").toUpperCase() }}
      </button>

      <!-- BEGIN PUBLICATION BUTTON (launch advanced settings modal)       -->
      <button
        @click="showAdvancedSettings()"
        v-if="!existingPost || existingPost.status.includes('DRAFT', 'BIN')"
        class="button item is-primary is-light"
        :class="{
          'is-loading':
            savingPost.state === 'PENDING' && savingPost.status === 'PUBLISHED'
        }"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >
        {{ $t("views.postForm.publicationButton").toUpperCase() }}
      </button>

      <!-- UNPUBLISH BUTTON  -->
      <button
        @click="onUnpublishClick()"
        v-if="existingPost && existingPost.status === 'PUBLISHED'"
        class="button item is-outlined"
        :class="{
          'is-loading':
            savingPost.state === 'PENDING' && savingPost.status === 'DRAFT'
        }"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >
        {{ $t("views.postForm.unpublishButton").toUpperCase() }}
      </button>

      <!-- PUBLISH CHANGES BUTTON -->
      <button
        @click="publish()"
        v-if="existingPost && existingPost.status === 'PUBLISHED'"
        class="button item is-outlined is-primary"
        :class="{
          'is-loading':
            savingPost.state === 'PENDING' && savingPost.status === 'PUBLISHED'
        }"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >
        {{ $t("views.postForm.publishChangesButton").toUpperCase() }}
      </button>
    </portal>

    <AppLoader v-if="loadingAsyncData" />
    <form class="post-form" v-if="!loadingAsyncData" @submit.prevent>
      <div class="post-form__field-title">
        <textarea-autosize
          maxlength="250"
          @keydown.enter.native.prevent="onTitleEnter"
          autofocus
          rows="1"
          :placeholder="$t('views.postForm.fields.title.placeholder')"
          type="text"
          id="title"
          @input="onTitleInput"
          :value="vuexFormGetValue('postForm', 'title')"
        />
      </div>
      <!--      -->
      <ContentEditor
        ref="contentEditor"
        class="post-form__field-editor"
        :value="vuexFormGetValue('postForm', 'content')"
        @change="onContentChange"
        @editorReady="onEditorReady"
      />
    </form>

    <footer class="post-form__document-infos">
      <div class="container">
        <div class="item">
          {{ $t("global." + getPostStatus().toLowerCase()) }}
          <span v-if="savingPost.state === 'PENDING'">Saving...</span>
          <span v-if="savingPost.state !== 'PENDING' && existingPost">
            -
            {{
              $t("views.postForm.savedAt {time}", {
                time: formatDate(new Date(existingPost.updatedAt), "long")
              })
            }}
          </span>
        </div>
        <div ref="wordcount" class="post-form__document-infos__word-count" />
      </div>
    </footer>

    <BulmaModal v-model="modal.show">
      <template #title>{{ modal.title }}</template>
      <template #body>{{ modal.content }}</template>
      <template #footer>
        <div
          v-if="modal.confirmText && modal.confirmCallback"
          @click="modal.confirmCallback"
          class="button is-danger"
        >
          {{ modal.confirmText }}
        </div>
        <div
          v-if="modal.cancelText && modal.cancelCallback"
          @click="modal.cancelCallback"
          class="button is-primary"
        >
          {{ modal.cancelText }}
        </div>
      </template>
    </BulmaModal>

    <!-- ADVANCED SETTINGS MODAL -->
    <BulmaModal
      v-if="!loadingAsyncData"
      class="publication-settings-modal animated zoomIn"
      :fullscreen="true"
      v-model="publicationSettingsModal.show"
    >
      <template #body>
        <div class="container">
          <PostFormAdvancedSettings
            :existingPost="existingPost"
            :savingPost="savingPost"
            @onCancelClick="onCancelPublicationModalClick"
            @onUploadingStateChange="state => (uploadingState = state)"
          />
        </div>
      </template>
      <template #title>
        <div>
          <span class="title is-3">
            {{
            $t("views.postForm.advancedSettingsModal.title")
          }}
          </span>
          <!-- PUBLISH BUTTON -->
          <button
            class="button is-primary is-pulled-right is-medium"
            @click="publish"
            :disabled="
              savingPost.state === 'PENDING' || uploadingState === 'PENDING'
            "
            :class="{
              'is-loading':
                savingPost.state === 'PENDING' &&
                savingPost.status === 'PUBLISHED'
            }"
          >
         {{publishModalPublishButtonText}}
          </button>

          <button
            style="margin-right:20px;"
            @click="publicationSettingsModal.show = false"
            class="button is-pulled-right is-medium"
          >
            {{ $t("views.postForm.publicationCancel") }}
          </button>
        </div>
      </template>
      <template #footer />
    </BulmaModal>

    <!-- HURRAH MODAL FOR FIRST PUBLICATION -->
    <BulmaModal
      class="hurrah-modal"
      v-model="publishingHurrahModal.show"
      :whiteFooter="true"
    >
      <template #title>
        <div class="has-text-centered">
          {{ $t("views.postForm.firstPublicationHurralModal.title") }}
        </div>
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
        >
          {{ $t("global.okayButton") }}
        </button>
      </template>
    </BulmaModal>

    <!-- HURRAH MODAL WHEN PUBLISHING CHANGES ON ALREADY PUBLISHED POST -->
    <BulmaModal
      class="publishing-changes-modal"
      v-model="publishingChangesModal.show"
    >
      <template #title>
        <div class="has-text-centered">
          {{ $t("views.postForm.publishChangesHurralModal.title") }}
        </div>
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
        >
          {{ $t("global.okayButton") }}
        </button>
      </template>
    </BulmaModal>
  </div>
</template>

<script>
import AppBreadcrumb from "@/ui-kit/AppBreadcrumb";
import AppLoader from "@/ui-kit/AppLoader";
import Editor from "fireblog-ckeditor";
import ContentEditor from "./ContentEditor";
import { ckeditorS3UploadAdapterPlugin } from "@/utils/ckeditorS3UploadAdapterPlugin";
import hotkeys from "hotkeys-js";

import {
  REQUEST_STATE,
  getUser,
  getBlog,
  createSlug,
  ckeditorIframelyMediaProvider,
  validateSlug,
  toast,
  formatDate
} from "@/utils/helpers";
import {
  vuexFormInit,
  vuexFormSetValue,
  vuexFormSetError,
  vuexFormResetErrors,
  vuexFormGetValue,
  vuexFormGetErrors,
  vuexFormGetValues,
  vuexFormGetInitialValues
} from "@/utils/vuexForm";
import { savePostMutation } from "@/utils/queries";
import apolloClient from "@/utils/apolloClient";
import { getPostQuery } from "@/utils/queries";
import PostFormAdvancedSettings from "./PostFormAdvancedSettings";
import striptags from "striptags";
import BulmaModal from "./BulmaModal";

let initialFormValues = {
  title: "",
  content: "",
  slug: "",
  teaser: "",
  image: "",
  slugIsLocked: false,
  slugShowToggleLockButton: true
};

const randomHurraGifs = [
  "https://media.giphy.com/media/7IW6Jnw29TYmgkuu3M/giphy.gif",
  "https://media.giphy.com/media/Wq2xnn2ZnwiTtoD6Qk/giphy.gif",
  "http://giphygifs.s3.amazonaws.com/media/7vfhdCIn13zm8/giphy.gif",
  "https://66.media.tumblr.com/b53447fe9897178a2b4957a1ab32f6be/tumblr_n19pczDWI21ss6wowo9_250.gifv"
];

const FORM_ID = "postForm";
let pendingActions = null;

let stokeCountIndex = 0;
const saveAfterKeyStrokesNumber = 50;

export default {
  components: {
    AppBreadcrumb,
    AppLoader,
    BulmaModal,
    ContentEditor,
    PostFormAdvancedSettings
  },
  data() {
    return {
      // post from database. So it's NOT present for postCreate route,
      // only for postUpdate route.
      existingPost: null,
      loadingAsyncData: false,
      uploadingState: REQUEST_STATE.NOT_STARTED,
      savingPost: {
        state: REQUEST_STATE.NOT_STARTED,
        status: null
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
  created() {
    this.FORM_ID = FORM_ID;
    this.vuexFormGetValue = vuexFormGetValue;
    this.vuexFormGetValues = vuexFormGetValues;
    this.formatDate = formatDate;
    this.init();
  },
  mounted() {
   // Listen event before unload and call method confirmLeave
    window.onbeforeunload= this.confirmLeave;
    // allow ctrl+s to be detected on inputs and textareas
    hotkeys.filter = () => true;
    // save shortcuts
    hotkeys("ctrl+s,command+s", (event, handler) => {
      // Prevent the default refresh event under WINDOWS system
      event.preventDefault();
      if (this.existingPost && this.existingPost.status === "PUBLISHED") {
        this.publish();
      } else {
        this.saveAsDraft().catch(e => {
          console.log("Cannot be saved: form validation failed: " + e);
        });
      }
      return false;
    });
  },
  beforeDestroy() {
    window.onbeforeunload = null;
    hotkeys.unbind("ctrl+s");
    hotkeys.unbind("command+s");
  },
  computed: {
    publishModalPublishButtonText() {
      let text = this.$t("views.postForm.publishNowButton");
      if (this.existingPost && this.existingPost.status === "PUBLISHED") {
        text = this.$t("views.postForm.publishChangesButton");
      }
      return text;
    }
  },
  methods: {
    confirmLeave(event) {
        // Method of confirming that we are willing to leave the page.
        event.preventDefault();
        var confirmationMessage = "The changes you have made may not be saved.";
        event.returnValue = confirmationMessage;
        return confirmationMessage;
    },
    onEditorReady(editor) {
      const wordCountPlugin = editor.plugins.get("WordCount");
      const wordCountWrapper = this.$refs.wordcount;
      wordCountWrapper.appendChild(wordCountPlugin.wordCountContainer);
      pendingActions = editor.plugins.get("PendingActions");
      editor.plugins.get("PendingActions").on("change:hasAny", actions => {});
      // If the user tries to leave the page before the data is saved, ask
      // them whether they are sure they want to proceed.
      window.onbeforeunload = evt => {
        evt.preventDefault();
        /*
        if (pendingActions.hasAny) {
          evt.preventDefault();
        }
        */
      };
    },
    async init() {
      // no existing post, we are in CREATE MODE
      if (this.$route.name === "postCreate") {
        this.postFormInit(initialFormValues);
      }

      // UPDATE MODE
      if (this.$route.name === "postUpdate") {
        this.loadingAsyncData = true;
        this.existingPost = await this.getExistingPost(
          this.$route.params.postId
        );
        this.$store.commit("lastVisitedPost", this.existingPost);
        this.loadingAsyncData = false;
        const formValues = this.prepareFormValuesFromPost(this.existingPost);
        this.postFormInit(formValues);
      }
    },
    onTitleInput(value) {
      vuexFormSetValue(FORM_ID, "title", value);
    },
    onContentChange(value) {
      // Update form value on each key stroke !
      // Because if we are waiting on a debouced event like "autoSave",
      // user can save BEFORE data is registered to form, so data is lost -_-
      vuexFormSetValue(FORM_ID, "content", value);
      this.autoSave();
    },
    autoSave() {
      if (this.getPostStatus() !== "DRAFT") {
        return;
      }
      stokeCountIndex++;
      if (stokeCountIndex === saveAfterKeyStrokesNumber) {
        this.savePost("DRAFT", { saveType: "auto" });
        stokeCountIndex = 0;
      }
    },
    // when user click "enter" in the title input,
    // automically move cursor to the textarea
    onTitleEnter() {
      this.$refs.contentEditor.$refs.editor.focus();
    },
    onCancelPublicationModalClick() {
      alert("ok");
      this.publicationSettingsModal.show = false;
    },
    postFormInit(formValues) {
      vuexFormInit(FORM_ID, {
        initialValues: { ...formValues },
        onFormValueChange: ({ name, value }) => {}
      });
    },
    // fill form fields from a post object
    prepareFormValuesFromPost(post) {
      let values = {
        ...initialFormValues,
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
    // Prepare a post object from form form.values, for a save operation
    preparePostFromCurrentFormValues() {
      const postToSave = {
        title: vuexFormGetValue(FORM_ID, "title"),
        content: vuexFormGetValue(FORM_ID, "content"),
        slug: vuexFormGetValue(FORM_ID, "slug"),
        teaser: vuexFormGetValue(FORM_ID, "teaser"),
        image: vuexFormGetValue(FORM_ID, "image")
      };
      // API will know that this is an UPDATE and not a CREATE
      // if we add _id key to our post.
      if (this.$route.params.postId) {
        postToSave._id = this.$route.params.postId;
      }
      return postToSave;
    },
    savePost(
      status,
      options = {
        saveType: "manual"
      }
    ) {
      if (this.savingPost.state === REQUEST_STATE.PENDING) {
        console.log("abort saving, this post is currently saving.");
        return;
      }
      if (!vuexFormGetValue(FORM_ID, "title").trim()) {
        toast(this, this.$t("views.postForm.fields.title.errors.required"), "error");
        return;
      }
      const savingPendingAction = pendingActions.add("Saving post");
      this.savingPost = {
        state: REQUEST_STATE.PENDING,
        status
      };
      const post = {
        ...this.preparePostFromCurrentFormValues(),
        status
      };
      return apolloClient
        .mutate({
          mutation: savePostMutation,
          variables: {
            post,
            blog: this.$route.params.blogId
          }
        })
        .then(async result => {
          pendingActions.remove(savingPendingAction);
          const post = result.data.savePost;
          this.existingPost = post;
          this.$store.commit("lastVisitedPost", post);
          this.savingPost = {
            state: REQUEST_STATE.FINISHED_OK,
            status
          };
          if (status === "DRAFT" && options.saveType === "manual") {
            toast(this, this.$t("views.postForm.draftSaved"), "success");
          }
          if (this.$route.name === "postCreate") {
            // this route change WON'T retrigger this.init(), so passing from
            // postCreate to postUpdate page is a fluid experience for user
            this.$router.replace({
              name: "postUpdate",
              params: {
                blogId: this.$route.params.blogId,
                postId: post._id
              }
            });
          }
          return post;
        })
        .catch(error => {
          pendingActions.remove(savingPendingAction);
          this.savingPost = {
            state: REQUEST_STATE.FINISHED_ERROR,
            status
          };
          toast(this, error, "error");
          throw new Error(error);
        });
    },
    getExistingPost(id) {
      return apolloClient
        .query({
          query: getPostQuery,
          variables: { _id: id }
        })
        .then(result => {
          this.existingPost = result.data.post;
          return result.data.post;
        })
        .catch(error => {
          toast(this, "getExistingPost(): " + error, "error");
        });
    },
    getPostStatus() {
      let status = this.existingPost ? this.existingPost.status : "DRAFT";
      return status;
    },
    // when coming from create route, update route do NOT need
    // to load post from database, we just have to keep our current
    // form values.
    skipLoadingExistingPost() {
      return (
        this.$store.state.global.skipLoadingExistingPost &&
        this.$store.state.global.skipLoadingExistingPost ===
          this.$route.params.postId
      );
    },
    saveAsDraft() {
      return this.savePost("DRAFT");
    },
    onBackToPostClick() {
      this.$router.push({
        name: "postList"
      });
    },
    publish() {
      // disabled saving post as DRAFT, as post is now published.

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
        // make sure there is not an autoSaveAsDraft triggere
        this.savePost("PUBLISHED").then(() => {
          this.publicationSettingsModal.show = false;
          // make sure user can not change slug anymore without confirmation.
          vuexFormSetValue(FORM_ID, "slugIsLocked", true);
          if (publishingChanges === true) {
            this.publishingChangesModal.show = true;
          } else {
            this.publishingHurrahModal.show = true;
          }
        });
      }
    },
    /**
     * Open publication modal. This is NOT the final publish operation.
     */
    showAdvancedSettings() {
      // we need at least the title to autocomplete the slug field
      if (!vuexFormGetValue(FORM_ID, "title").trim()) {
        toast(this, this.$t("views.postForm.fields.title.errors.required"), "error");
        return;
      }
      if (this.mediaLoadingCounter > 0) {
        this.showMediaCurrentlyLoadingModal();
      } else {
        if (vuexFormGetValue(FORM_ID, "slug").trim().length === 0) {
          vuexFormSetValue(
            FORM_ID,
            "slug",
            createSlug(vuexFormGetValue(FORM_ID, "title"))
          );
        }
        // if post is published or has been published once, we lock slug field by default.
        // if "publishedAt" is not null, we know the post has been published or is published.
        if (this.existingPost && this.existingPost.publishedAt) {
          //vuexFormSetValue(FORM_ID, "slugShowToggleLockButton", true);
          vuexFormSetValue(FORM_ID, "slugIsLocked", true);
        }

        // pre-fill teaser fied with the first sentence of the text.
        if (vuexFormGetValue(FORM_ID, "teaser").trim().length === 0) {
          const teaserSuggestion = striptags(
            vuexFormGetValue(FORM_ID, "content").substr(0, 250)
          );
          vuexFormSetValue(FORM_ID, "teaser", teaserSuggestion);
        }
        this.publicationSettingsModal.show = true;
      }
    },
    onUnpublishClick() {
      this.savePost("DRAFT");
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
      vuexFormResetErrors(FORM_ID);
      // TITLE
      if (!vuexFormGetValue(FORM_ID, "title").trim()) {
        let message = this.$t("views.postForm.fields.title.errors.required");
        vuexFormSetError(FORM_ID, "title", message);
        toast(this, message, "error");
      }
      if (action === "PUBLISH") {
        if (!validateSlug(vuexFormGetValue(FORM_ID, "slug"))) {
          // SLUG
          let message = this.$t(
            "components.slugField.errors.invalidCharacters"
          );
          vuexFormSetError(FORM_ID, "slug", message);
          toast(this, message, "error");
        }
        if (!vuexFormGetValue(FORM_ID, "slug").trim()) {
          let message = this.$t("components.slugField.errors.required");
          vuexFormSetError(FORM_ID, "slug", message);
          toast(this, message, "error");
        }
        // TEASER
        if (!vuexFormGetValue(FORM_ID, "teaser").trim()) {
          let message = this.$t("views.postForm.fields.teaser.errors.required");
          vuexFormSetError(FORM_ID, "teaser", message);
          toast(this, message, "error");
        }
      }
      const errors = vuexFormGetErrors(FORM_ID);
      return errors;
    }
  }
};
</script>

<style>
.post-form {
  padding-top: 30px;
  padding-bottom: 70px;
}

.post-form__field-title {
  text-align: center;
  position: relative;
  background: white;
  top: 10px;
  padding: 30px;
  padding-bottom: 20px;
  max-width: 880px;
  margin: auto;
  box-shadow: 1px 0px 1px 0px rgba(0, 0, 0, 0.05);
}
.post-form__field-title textarea {
  width: 100%;
  font-family: Roslindale, serif;
  text-align: left;
  font-size: 53px;
  border: none !important;
  border-color: none;
  outline: none !important;
}

.post-form__field-editor #editor {
  color: #222;
  font-family: Source Sans Pro, Helvetica Neue, Helvetica, Arial, sans-serif;
  min-height: 100vh;
  max-width: 880px;
  padding: 32px;
  padding-top: 0;
  box-shadow: 1px 1px 1px 0px rgba(0, 0, 0, 0.05);
  margin: auto;
  background: white;
  padding-bottom: 80px;
}
.post-form__field-editor .ck-content {
  border: none !important;
  border-color: none;
  outline: none !important;
  border-color: #a0c0e4;
  border-radius: 2px;
  outline: none;
  padding: 1px;
  margin: 0;
  resize: none; /*remove the resize handle on the bottom right*/
  line-height: 1.8;
}

.post-form__document-infos {
  position: fixed;
  width: 100%;
  bottom: 0;
  background-color: white;
  text-align: right;
  font-size: 12px;
  padding: 5px;
}

.post-form__document-infos .container {
  display: flex;
  justify-content: space-between;
  width: 800px;
}

.post-form__document-infos__word-count .ck-word-count {
  display: flex;
  justify-content: space-between;
}

.post-form__document-infos__word-count .ck-word-count .ck-word-count__words {
  padding-right: 5px;
  margin-right: 5px;
  border-right: solid silver 1px;
}
</style>
