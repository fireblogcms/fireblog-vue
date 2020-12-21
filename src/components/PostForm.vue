<template>
  <div>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <AppBreadcrumb
        :routerOptions="backToPostListRouterOptions"
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
          size="sm"
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
            size="sm"
            @click="saveAsDraft"
          >
            <span class="text-sm md:text-md">
              {{ $t("views.postForm.saveDraft").toUpperCase() }}
            </span>
          </AppButton>

          <!-- ADVANCED OPTIONS BUTTON -->
          <AppButton
            v-if="existingPost && existingPost.status === 'PUBLISHED'"
            :disabled="savingPost.state === 'PENDING'"
            class="mb-4 lg:mb-0 lg:mr-4"
            size="sm"
            @click="showAdvancedSettings"
          >
            <span class="text-sm md:text-md">
              {{ $t("views.postForm.advancedSettingsButton").toUpperCase() }}
            </span>
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
            size="sm"
            @click="showAdvancedSettings"
          >
            <span class="text-sm md:text-md">
              {{ $t("views.postForm.publicationButton").toUpperCase() }}
            </span>
          </AppButton>

          <!-- UNPUBLISH BUTTON  -->
          <AppButton
            v-if="existingPost && existingPost.status === 'PUBLISHED'"
            :loading="
              savingPost.state === 'PENDING' && savingPost.status === 'DRAFT'
            "
            :disabled="savingPost.state === 'PENDING'"
            class="mb-4 lg:mb-0 lg:mr-4"
            size="sm"
            @click="onUnpublishClick"
          >
            <span class="text-sm md:text-md">
              {{ $t("views.postForm.unpublishButton").toUpperCase() }}
            </span>
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
            size="sm"
            @click="publish"
          >
            <span class="text-sm md:text-md">
              {{ $t("views.postForm.publishChangesButton").toUpperCase() }}
            </span>
          </AppButton>
        </div>
      </div>
    </portal>

    <AppLoader v-if="loadingAsyncData" />

    <div v-if="!loadingAsyncData">
      <div class="container mx-auto pt-10 pb-16 flex flex-col items-center">
        <div
          class="p-16 w-full max-w-900 border border-gray-200 rounded bg-white"
        >
          <form @submit.prevent class="bg-white">
            <textarea-autosize
              class="w-full text-5xl font-serif outline-none leading-tight"
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
              :onWordCountUpdate="onWordCountUpdate"
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
                time: formatDate(
                  new Date(existingPost.updatedAt),
                  "shortWithTime"
                ),
              })
            }}
          </span>
        </div>
        <div
          ref="wordcount"
          class="hidden md:visible post-form__document-infos__word-count"
        />
      </div>
    </footer>

    <!-- ADVANCED SETTINGS MODAL -->
    <AppModal
      v-if="!loadingAsyncData"
      name="publishingOptionsModal"
      width="fullscreen"
    >
      <div
        class="flex flex-col md:flex-row items-center justify-end flex-1"
        slot="header"
      >
        <div class="flex mt-8 md:mt-0">
          <!-- PUBLISH / PUBLISH CHANGES BUTTON -->
          <AppButton
            class="mr-4"
            @click="closePublishingOptionsModal"
            size="sm"
          >
            <span class="uppercase">
              {{ $t("views.postForm.publicationCancel") }}
            </span>
          </AppButton>
          <AppButton
            color="primary"
            size="sm"
            :loading="
              savingPost.state === 'PENDING' &&
                savingPost.status === 'PUBLISHED'
            "
            @click="publish"
          >
            <span class="uppercase">
              {{ publishModalPublishButtonText }}
            </span>
          </AppButton>
        </div>
      </div>
      <template #body>
        <PostFormAdvancedSettings
          :existingPost="existingPost"
          :savingPost="savingPost"
          @onCancelClick="closePublishingOptionsModal"
          @onUploadingStateChange="state => (uploadingState = state)"
        />
      </template>
    </AppModal>

    <!-- SUCCESS MODAL FOR FIRST PUBLICATION -->
    <AppModal width="sm" name="publishingSuccessModal">
      <div class="text-2xl font-bold" slot="header">
        {{ $t("views.postForm.firstPublicationHurralModal.title") }}
      </div>
      <div slot="body">
        <img width="100%" class="rounded" :src="getRandomHurrahGif()" />
      </div>
    </AppModal>

    <!-- SUCCESS MODAL WHEN PUBLISHING CHANGES ON ALREADY PUBLISHED POST -->
    <AppModal width="sm" name="publishingChangesSuccessModal">
      <div class="text-xl font-bold" slot="header">
        {{ $t("views.postForm.publishChangesHurralModal.title") }}
      </div>
      <div class="flex flex-col items-center" slot="body">
        <img width="100%" class="rounded" :src="getRandomHurrahGif()" />
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
import gql from "graphql-tag";
import {
  REQUEST_STATE,
  getUser,
  getBlog,
  ckeditorIframelyMediaProvider,
  validateSlug,
  toast,
  formatDate,
  generateSlugFromServer,
  getRandomGif,
  getTimeFromDateString,
  combineDateAndTime,
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
import PostFormAdvancedSettings from "./PostFormAdvancedSettings";
import striptags from "striptags";

const FORM_ID = "postForm";
let pendingActions = null;

const initFormValues = (post = {}) => {
  const formValues = {
    title: post.title ? post.title : "",
    content: post.content ? post.content : "",
    // slug is the slug value after being slugified by SlugField component
    slug: post.slug ? post.slug : "",
    title: post.title ? post.title : "",
    teaser: post.teaser ? post.teaser : "",
    image: post.image ? post.image : "",
    featured: post.featured ? post.featured : false,
    metaDescription: post.metaDescription ? post.metaDescription : "",
    metaTitle: post.metaTitle ? post.metaTitle : "",
    tags: post.tags || [],
    slugIsLocked: false,
    slugShowToggleLockButton: true,
    publishedAt: post.publishedAt ? post.publishedAt : null,

    // can be "NOW", (set publish date to now, when creating new post)
    // "KEEP", (when editing a post, do not change publication date)
    // "LATER" ( publish later )
    // "EARLIER" (anterior date)
    publishedAtType: "NOW",

    // user can enter a custom publication date.
    publishedAtCustomDate: post.publishedAt ? post.publishedAt : null,
    // use can enter a custom time (hh:mm) for publication date.
    publishedAtCustomTime: post.publishedAt
      ? getTimeFromDateString(post.publishedAt)
      : null,
  };
  if (post.status === "PUBLISHED") {
    formValues.publishedAtType = "KEEP";
  }
  vuexFormInit(FORM_ID, {
    initialValues: { ...formValues },
  });
};

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
      blogSetSubscription: null,
      wordCount: 0,
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
        this.saveAsDraft();
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
      let text = this.$t("views.postForm.publishButton");
      if (this.existingPost && this.existingPost.status === "PUBLISHED") {
        text = this.$t("views.postForm.publishChangesButton");
      }
      return text;
    },
    backToPostListRouterOptions() {
      const query = {};
      if (this.existingPost && this.existingPost.status) {
        query.getPosts = JSON.stringify({
          filter: { status: this.existingPost.status },
        });
      }
      return {
        name: "postList",
        params: { blogSetId: this.$route.params.blogSetId },
        query,
      };
    },
  },
  methods: {
    onWordCountUpdate(stats) {
      this.wordCount = stats.words;
    },
    onEditorReady(editor) {
      const wordCountPlugin = editor.plugins.get("WordCount");
      const wordCountWrapper = this.$refs.wordcount;
      wordCountWrapper.appendChild(wordCountPlugin.wordCountContainer);
      pendingActions = editor.plugins.get("PendingActions");
      editor.plugins.get("PendingActions").on("change:hasAny", actions => {});
    },
    async init() {
      this.getSubscription();

      // no existing post, we are in CREATE MODE
      if (this.$route.name === "postCreate") {
        initFormValues();
      }

      // UPDATE MODE
      if (this.$route.name === "postUpdate") {
        this.loadingAsyncData = true;
        this.existingPost = await this.getExistingPost(
          this.$route.params.postId
        );
        this.loadingAsyncData = false;
        initFormValues(this.existingPost);
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
    /**
     * return publication date value for saving.
     * Might be null if post is draft and no specific date has been specified.
     */
    preparePublishedAtValueForSave() {
      let datetime = null;
      const publishedAtType = vuexFormGetValue(FORM_ID, "publishedAtType");
      // user want to publish with the current date.
      if (publishedAtType === "NOW") {
        datetime = new Date();
      }
      // user want to publish to a different date.
      else if (publishedAtType === "EARLIER" || publishedAtType === "LATER") {
        const date = vuexFormGetValue(FORM_ID, "publishedAtCustomDate");
        const time = vuexFormGetValue(FORM_ID, "publishedAtCustomTime");
        datetime = combineDateAndTime(date, time);
      }
      // post is published and user just want to keep the current publication date
      else if (publishedAtType === "KEEP") {
        datetime = this.existingPost.publishedAt;
      }
      return datetime;
    },
    // Prepare a post object from form form.values, for a save operation
    preparePostFromCurrentFormValues(status) {
      const postToSave = {
        title: vuexFormGetValue(FORM_ID, "title"),
        content: vuexFormGetValue(FORM_ID, "content"),
        slug: vuexFormGetValue(FORM_ID, "slug"),
        teaser: vuexFormGetValue(FORM_ID, "teaser"),
        image: vuexFormGetValue(FORM_ID, "image"),
        featured: vuexFormGetValue(FORM_ID, "featured"),
        metaTitle: vuexFormGetValue(FORM_ID, "metaTitle"),
        metaDescription: vuexFormGetValue(FORM_ID, "metaDescription"),
        tags: vuexFormGetValue(FORM_ID, "tags").map(tag => tag._id),
        wordCount: this.wordCount,
        // publishedAt remains null, until we actualky publish the post.
        publishedAt:
          status === "PUBLISHED" ? this.preparePublishedAtValueForSave() : null,
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
        return Promise.reject("Abort saving, this post is currently saving.");
      }
      if (!vuexFormGetValue(FORM_ID, "title").trim()) {
        toast(
          this,
          this.$t("views.postForm.fields.title.errors.required"),
          "error"
        );
        return Promise.reject(
          this.$t("views.postForm.fields.title.errors.required")
        );
      }
      const savingPendingAction = pendingActions.add("Saving post");
      this.savingPost = {
        state: REQUEST_STATE.PENDING,
        status,
      };
      const post = {
        ...this.preparePostFromCurrentFormValues(status),
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
        .then(async result => {
          this.$emit("onEdit", false);
          pendingActions.remove(savingPendingAction);
          const post = result.data.savePost;
          // update existing post : we use it our components
          // to determine current post status for example.
          this.existingPost = {
            ...this.existingPost,
            ...post,
          };
          // update form values, some of theme are dependant from current post values.
          initFormValues(post);
          this.savingPost = {
            state: REQUEST_STATE.FINISHED_OK,
            status,
          };
          if (status === "DRAFT" && options.saveType === "manual") {
            toast(this, this.$t("views.postForm.draftSaved"), "success");
          }
          if (this.$route.name === "postCreate") {
            // goal: has created a post
            window._paq.push(["trackGoal", 2]);

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
        .catch(error => {
          pendingActions.remove(savingPendingAction);
          this.savingPost = {
            state: REQUEST_STATE.FINISHED_ERROR,
            status,
          };
          toast(this, error, "error");
          throw new Error(error);
        });
    },
    getSubscription() {
      const query = gql`
        query blogSetQuery($blogSetId: ID!) {
          blogSet(_id: $blogSetId) {
            subscription {
              id
              planId
              trialEnd
              status
            }
          }
        }
      `;
      return apolloClient
        .query({
          query,
          variables: {
            blogSetId: this.$route.params.blogSetId,
          },
        })
        .then(result => {
          this.blogSetSubscription = result.data.blogSet.subscription;
          return result.data.blogSet.subscription;
        });
    },
    getExistingPost(id) {
      return apolloClient
        .query({
          variables: {
            blogSetId: this.$route.params.blogSetId,
            postId: id,
          },
          query: gql`
            query postFormQuery($postId: ID!) {
              post(_id: $postId) {
                _id
                title
                content
                status
                slug
                teaser
                image
                publishedAt
                updatedAt
                createdAt
                image
                featured
                author {
                  _id
                  name
                  email
                }
                metaTitle
                metaDescription
                tags {
                  _id
                  name
                  slug
                }
              }
            }
          `,
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
    publish(scheduled = false) {
      // If article is published (or re-published) from draft, we display a "Hurrah modal".
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
        const status = scheduled ? "SCHEDULED_PUBLISH" : "PUBLISHED";
        // make sure there is not an autoSaveAsDraft triggered
        this.savePost(status).then(() => {
          this.closePublishingOptionsModal();
          // make sure user can not change slug anymore without confirmation.
          vuexFormSetValue(FORM_ID, "slugIsLocked", true);
          if (publishingChanges === true) {
            this.$store.commit(
              "modalShowing/open",
              "publishingChangesSuccessModal"
            );
          } else {
            // goal: has published a post
            window._paq.push(["trackGoal", 3]);
            this.$store.commit("modalShowing/open", "publishingSuccessModal");
          }
        });
      }
    },
    /**
     * Open publication modal. This is NOT the final publish operation.
     */
    showAdvancedSettings() {
      if (
        this.blogSetSubscription.status === "TRIAL" ||
        this.blogSetSubscription.status === "ACTIVE"
      ) {
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
            generateSlugFromServer({
              blogId: this.$route.params.blogId,
              source: vuexFormGetValue(FORM_ID, "title").trim(),
            }).then(response => {
              vuexFormSetValue(FORM_ID, "slug", response.slug);
            });
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
      } else {
        this.$store.commit("modalShowing/open", "freeTrialEndedModal");
      }
    },
    onUnpublishClick() {
      this.savePost("DRAFT");
    },
    getRandomHurrahGif() {
      const hurraGifs = [
        "https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/publish-man-dancing.gif",
        "https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/publish-press.gif",
        "https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/publish-too-big-newspaper.gif",
        "https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/publish-women-newspaper.gif",
      ];
      return getRandomGif(hurraGifs);
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

      // custom datetime can't be superior to now, for now.
      const customPublicationDate = vuexFormGetValue(
        FORM_ID,
        "publishedAtCustomDate"
      );
      const customPublicationTime = vuexFormGetValue(
        FORM_ID,
        "publishedAtCustomTime"
      );
      if (customPublicationDate && customPublicationTime) {
        const customPublicationDateTime = combineDateAndTime(
          customPublicationDate,
          customPublicationTime
        );
        if (customPublicationDateTime > new Date()) {
          vuexFormSetError(
            FORM_ID,
            "customPublicationDateTime",
            "publication date can't be superior to now"
          );
          toast(this, "Publication date can't be superior to now", "error");
        }
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
