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
      <div class="relative">
        <AppButton
          class="lg:hidden mx-1"
          color="primary-outlined"
          size="small"
          @click="isActionsVisibleOnMobile = !isActionsVisibleOnMobile"
        >
          <img class="w-6" src="/images/pencil.svg" />
        </AppButton>
        <div
          v-click-outside="() => (isActionsVisibleOnMobile = false)"
          :class="{
            hidden: !isActionsVisibleOnMobile,
          }"
          class="absolute lg:relative lg:inline-block top-0 mt-16 lg:mt-0 -ml-20 p-6 lg:p-0 flex flex-col lg:flex-row items-center justify-center bg-white rounded-md shadow-around lg:shadow-none"
        >
          <!-- SAVE DRAFT BUTTON -->
          <AppButton
            v-if="getPostStatus() === 'DRAFT'"
            :loading="
              savingPost.state === 'PENDING' && savingPost.status === 'DRAFT'
            "
            :disabled="savingPost.state === 'PENDING'"
            class="mb-4 lg:mb-0 lg:mr-4"
            size="small"
            @click="saveAsDraft"
          >
            {{ $t("views.postForm.saveDraft").toUpperCase() }}
          </AppButton>

          <!-- ADVANCED OPTIONS BUTTON -->
          <AppButton
            v-if="existingPost && existingPost.status === 'PUBLISHED'"
            :disabled="savingPost.state === 'PENDING'"
            class="mb-4 lg:mb-0 lg:mr-4"
            size="small"
            @click="showAdvancedSettings"
          >
            {{ $t("views.postForm.advancedSettingsButton").toUpperCase() }}
          </AppButton>

          <!-- BEGIN PUBLICATION BUTTON (launch advanced settings modal) -->
          <AppButton
            v-if="!existingPost || existingPost.status.includes('DRAFT', 'BIN')"
            :loading="
              savingPost.state === 'PENDING' &&
                savingPost.status === 'PUBLISHED'
            "
            :disabled="savingPost.state === 'PENDING'"
            class="lg:mr-4"
            color="primary-outlined"
            size="small"
            @click="showAdvancedSettings"
          >
            {{ $t("views.postForm.publicationButton").toUpperCase() }}
          </AppButton>

          <!-- UNPUBLISH BUTTON  -->
          <AppButton
            v-if="existingPost && existingPost.status === 'PUBLISHED'"
            :loading="
              savingPost.state === 'PENDING' && savingPost.status === 'DRAFT'
            "
            :disabled="savingPost.state === 'PENDING'"
            class="mb-4 lg:mb-0 lg:mr-4"
            size="small"
            @click="onUnpublishClick"
          >
            {{ $t("views.postForm.unpublishButton").toUpperCase() }}
          </AppButton>

          <!-- PUBLISH CHANGES BUTTON -->
          <AppButton
            v-if="existingPost && existingPost.status === 'PUBLISHED'"
            :loading="
              savingPost.state === 'PENDING' &&
                savingPost.status === 'PUBLISHED'
            "
            :disabled="savingPost.state === 'PENDING'"
            class="lg:mr-4"
            color="primary-outlined"
            size="small"
            @click="publish"
          >
            {{ $t("views.postForm.publishChangesButton").toUpperCase() }}
          </AppButton>
        </div>
      </div>
    </portal>

    <AppLoader v-if="loadingAsyncData" />

    <div v-if="!loadingAsyncData">
      <div class="container mx-auto pt-10 pb-16 flex flex-col items-center">
        <div
          class="w-full max-w-850 p-12 border border-gray-200 rounded bg-white"
        >
          <form @submit.prevent class="bg-white">
            <textarea-autosize
              class="w-full text-5xl font-serif outline-none"
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
            <ContentEditor
              ref="contentEditor"
              class="post-form__field-editor"
              :value="vuexFormGetValue('postForm', 'content')"
              :autosave="saveIfDraft"
              :operation="existingPost ? 'update' : 'create'"
              @change="onContentChange"
              @editorReady="onEditorReady"
            />
          </form>
        </div>
      </div>
    </div>

    <footer
      class="flex justify-center fixed bottom-0 w-full p-1 text-sm bg-white"
    >
      <div class="w-full md:w-7/12 flex justify-between">
        <div class="item">
          {{ $t("global." + getPostStatus().toLowerCase()) }}
          <span v-if="savingPost.state === 'PENDING'">Saving...</span>
          <span v-if="savingPost.state !== 'PENDING' && existingPost">
            -
            {{
              $t("views.postForm.savedAt {time}", {
                time: formatDate(new Date(existingPost.updatedAt), "long"),
              })
            }}
          </span>
        </div>
        <div ref="wordcount" class="post-form__document-infos__word-count" />
      </div>
    </footer>

    <!-- ADVANCED SETTINGS MODAL -->
    <AppModal
      v-if="!loadingAsyncData"
      name="publishingOptionsModal"
      :fullscreen="true"
    >
      <div
        class="flex flex-col md:flex-row items-center justify-between flex-1"
        slot="header"
      >
        <span class="text-4xl font-bold">
          {{ $t("views.postForm.advancedSettingsModal.title") }}
        </span>
        <div class="flex mt-8 md:mt-0">
          <AppButton class="mr-4" @click="closePublishingOptionsModal">
            {{ $t("views.postForm.publicationCancel") }}
          </AppButton>
          <AppButton
            color="primary"
            :loading="
              savingPost.state === 'PENDING' &&
                savingPost.status === 'PUBLISHED'
            "
            @click="publish"
          >
            {{ publishModalPublishButtonText }}
          </AppButton>
        </div>
      </div>
      <template #body>
        <PostFormAdvancedSettings
          :existingPost="existingPost"
          :savingPost="savingPost"
          @onCancelClick="closePublishingOptionsModal"
          @onUploadingStateChange="(state) => (uploadingState = state)"
        />
      </template>
    </AppModal>

    <!-- SUCCESS MODAL FOR FIRST PUBLICATION -->
    <AppModal name="publishingSuccessModal">
      <div class="text-4xl font-bold" slot="header">
        {{ $t("views.postForm.firstPublicationHurralModal.title") }}
      </div>
      <div class="flex flex-col items-center" slot="body">
        <img class="h-64 mb-10 rounded" :src="getRandomHurrahGif()" />
        <AppButton color="primary" @click="closePublishingSuccessModal">
          {{ $t("global.okayButton") }}
        </AppButton>
      </div>
    </AppModal>

    <!-- SUCCESS MODAL WHEN PUBLISHING CHANGES ON ALREADY PUBLISHED POST -->
    <AppModal name="publishingChangesSuccessModal">
      <div class="text-4xl font-bold" slot="header">
        {{ $t("views.postForm.publishChangesHurralModal.title") }}
      </div>
      <div class="flex flex-col items-center" slot="body">
        <img class="h-64 mb-10 rounded" :src="getRandomHurrahGif()" />
        <AppButton color="primary" @click="closePublishingChangesSuccessModal">
          {{ $t("global.okayButton") }}
        </AppButton>
      </div>
    </AppModal>
  </div>
</template>

<script>
import AppBreadcrumb from "@/ui-kit/AppBreadcrumb";
import AppButton from "@/ui-kit/AppButton";
import AppLoader from "@/ui-kit/AppLoader";
import AppModal from "@/ui-kit/AppModal";
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
  formatDate,
} from "@/utils/helpers";
import {
  vuexFormInit,
  vuexFormSetValue,
  vuexFormSetError,
  vuexFormResetErrors,
  vuexFormGetValue,
  vuexFormGetErrors,
  vuexFormGetValues,
  vuexFormGetInitialValues,
} from "@/utils/vuexForm";
import { savePostMutation } from "@/utils/queries";
import apolloClient from "@/utils/apolloClient";
import { getPostQuery } from "@/utils/queries";
import PostFormAdvancedSettings from "./PostFormAdvancedSettings";
import striptags from "striptags";

let initialFormValues = {
  title: "",
  content: "",
  slug: "",
  teaser: "",
  image: "",
  slugIsLocked: false,
  slugShowToggleLockButton: true,
};

const randomHurraGifs = [
  "https://media.giphy.com/media/7IW6Jnw29TYmgkuu3M/giphy.gif",
  "https://media.giphy.com/media/Wq2xnn2ZnwiTtoD6Qk/giphy.gif",
  "http://giphygifs.s3.amazonaws.com/media/7vfhdCIn13zm8/giphy.gif",
  "https://66.media.tumblr.com/b53447fe9897178a2b4957a1ab32f6be/tumblr_n19pczDWI21ss6wowo9_250.gifv",
];

const FORM_ID = "postForm";
let pendingActions = null;

let strokesCountIndex = 0;
const saveAfterKeyStrokesNumber = 50;

export default {
  components: {
    AppBreadcrumb,
    AppButton,
    AppLoader,
    AppModal,
    ContentEditor,
    PostFormAdvancedSettings,
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
        status: null,
      },
      isActionsVisibleOnMobile: false,
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
    // allow ctrl+s to be detected on inputs and textareas
    hotkeys.filter = () => true;
    // save shortcuts
    hotkeys("ctrl+s,command+s", (event, handler) => {
      // Prevent the default refresh event under WINDOWS system
      event.preventDefault();
      if (this.existingPost && this.existingPost.status === "PUBLISHED") {
        this.publish();
      } else {
        this.saveAsDraft().catch((e) => {
          console.log("Cannot be saved: form validation failed: " + e);
        });
      }
      return false;
    });
  },
  beforeDestroy() {
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
    },
  },
  methods: {
    onEditorReady(editor) {
      const wordCountPlugin = editor.plugins.get("WordCount");
      const wordCountWrapper = this.$refs.wordcount;
      wordCountWrapper.appendChild(wordCountPlugin.wordCountContainer);
      pendingActions = editor.plugins.get("PendingActions");
      editor.plugins.get("PendingActions").on("change:hasAny", (actions) => {});
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
      this.$emit("onEdit", true);
      vuexFormSetValue(FORM_ID, "content", value);
    },
    // when user click "enter" in the title input,
    // automically move cursor to the textarea
    onTitleEnter() {
      this.$refs.contentEditor.$refs.editor.focus();
    },
    closePublishingOptionsModal() {
      this.$store.commit("modalShowing/close", "publishingOptionsModal");
    },
    closePublishingChangesSuccessModal() {
      this.$store.commit("modalShowing/close", "publishingChangesSuccessModal");
    },
    closePublishingSuccessModal() {
      this.$store.commit("modalShowing/close", "publishingSuccessModal");
    },
    postFormInit(formValues) {
      vuexFormInit(FORM_ID, {
        initialValues: { ...formValues },
        onFormValueChange: ({ name, value }) => {},
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
        image: post.image ? post.image : "",
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
        image: vuexFormGetValue(FORM_ID, "image"),
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
        saveType: "manual",
      }
    ) {
      if (this.savingPost.state === REQUEST_STATE.PENDING) {
        console.log("abort saving, this post is currently saving.");
        return;
      }
      if (!vuexFormGetValue(FORM_ID, "title").trim()) {
        toast(
          this,
          this.$t("views.postForm.fields.title.errors.required"),
          "error"
        );
        return;
      }
      const savingPendingAction = pendingActions.add("Saving post");
      this.savingPost = {
        state: REQUEST_STATE.PENDING,
        status,
      };
      const post = {
        ...this.preparePostFromCurrentFormValues(),
        status,
      };
      return apolloClient
        .mutate({
          mutation: savePostMutation,
          variables: {
            post,
            blog: this.$route.params.blogId,
          },
        })
        .then(async (result) => {
          this.$emit("onEdit", false);
          pendingActions.remove(savingPendingAction);
          const post = result.data.savePost;
          this.existingPost = post;
          this.$store.commit("lastVisitedPost", post);
          this.savingPost = {
            state: REQUEST_STATE.FINISHED_OK,
            status,
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
                postId: post._id,
              },
            });
          }
          return post;
        })
        .catch((error) => {
          pendingActions.remove(savingPendingAction);
          this.savingPost = {
            state: REQUEST_STATE.FINISHED_ERROR,
            status,
          };
          toast(this, error, "error");
          throw new Error(error);
        });
    },
    getExistingPost(id) {
      return apolloClient
        .query({
          query: getPostQuery,
          variables: { _id: id },
        })
        .then((result) => {
          this.existingPost = result.data.post;
          return result.data.post;
        })
        .catch((error) => {
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
    /**
     * We have no way to save changes of a published content as "Draft" for now,
     * so autosave is only used if post is DRAFT.
     */
    saveIfDraft() {
      if (this.getPostStatus() === "DRAFT") {
        this.savePost("DRAFT", { saveType: "auto" });
      }
    },
    saveAsDraft() {
      return this.savePost("DRAFT");
    },
    onBackToPostClick() {
      this.$router.push({
        name: "postList",
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
        // make sure there is not an autoSaveAsDraft triggered
        this.savePost("PUBLISHED").then(() => {
          this.closePublishingOptionsModal();
          // make sure user can not change slug anymore without confirmation.
          vuexFormSetValue(FORM_ID, "slugIsLocked", true);
          if (publishingChanges === true) {
            this.$store.commit(
              "modalShowing/open",
              "publishingChangesSuccessModal"
            );
          } else {
            this.$store.commit("modalShowing/open", "publishingSuccessModal");
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
        toast(
          this,
          this.$t("views.postForm.fields.title.errors.required"),
          "error"
        );
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
          vuexFormSetValue(FORM_ID, "slugShowToggleLockButton", true);
          vuexFormSetValue(FORM_ID, "slugIsLocked", true);
        } else {
          vuexFormSetValue(FORM_ID, "slugShowToggleLockButton", false);
        }

        // pre-fill teaser fied with the first sentence of the text.
        if (vuexFormGetValue(FORM_ID, "teaser").trim().length === 0) {
          const teaserSuggestion = striptags(
            vuexFormGetValue(FORM_ID, "content").substr(0, 250)
          );
          vuexFormSetValue(FORM_ID, "teaser", teaserSuggestion);
        }
        this.$store.commit("modalShowing/open", "publishingOptionsModal");
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
    },
  },
};
</script>

<style>
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
