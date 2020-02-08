<template>
  <div class="post-form">
    {{ savingPost }}
    <AppLoader v-if="loadingAsyncData" />
    <form v-if="!loadingAsyncData" @submit.prevent>
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
      <ContentEditor
        ref="contentEditor"
        :value="vuexFormGetValue('postForm', 'content')"
        class="post-form__field-editor"
        :autosave="contentAutosave"
      />
      <button class="button is-primary" type="submit" @click="onSaveClick">
        Sauvegarder
      </button>
    </form>

    <!-- TOPBAR RIGHT BUTTONS -->
    <portal to="topbar-right">
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

      <!-- ADVANCED OPTIONS BUTTON
      <button
        @click="showAdvancedSettings()"
        v-if="existingPost && existingPost.status === 'PUBLISHED'"
        class="button item is-outlined"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >
        {{ $t("views.postForm.advancedSettingsButton").toUpperCase() }}
      </button>
       -->

      <!-- BEGIN PUBLICATION BUTTON (launch advanced settings modal) 
      <button
        @click="showAdvancedSettings()"
        v-if="!existingPost || existingPost.status.includes('DRAFT', 'BIN')"
        class="button is-outlined item is-primary is-light"
        :class="{
          'is-loading':
            savingPost.state === 'PENDING' &&
            savingPost.publicationStatus === 'PUBLISHED'
        }"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >
        {{ $t("views.postForm.publicationButton").toUpperCase() }}
      </button>
      -->

      <!-- UNPUBLISH BUTTON 
      <button
        @click="onUnpublishClick()"
        v-if="existingPost && existingPost.status === 'PUBLISHED'"
        class="button item is-outlined"
        :class="{
          'is-loading':
            savingPost.state === 'PENDING' &&
            savingPost.publicationStatus === 'DRAFT'
        }"
        :disabled="savingPost.state === 'PENDING'"
        type="submit"
      >
        {{ $t("views.postForm.unpublishButton").toUpperCase() }}
      </button>
      -->

      <!-- PUBLISH CHANGES BUTTON 
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
        <span class="animated bounce" v-if="changesDetected">*</span>
      </button>
      -->
    </portal>
  </div>
</template>

<script>
import Editor from "fireblog-ckeditor";
import ContentEditor from "./ContentEditor";
import { ckeditorS3UploadAdapterPlugin } from "../utils/ckeditorS3UploadAdapterPlugin";
import AppLoader from "../components/AppLoader";
import {
  REQUEST_STATE,
  getUser,
  getBlog,
  createSlug,
  ckeditorIframelyMediaProvider,
  appNotification,
  validateSlug,
  resetAppNotifications
} from "../utils/helpers";
import {
  vuexFormInit,
  vuexFormSetValue,
  vuexFormSetError,
  vuexFormResetErrors,
  vuexFormGetValue,
  vuexFormGetErrors,
  vuexFormGetValues,
  vuexFormGetInitialValues
} from "../utils/vuexForm";
import { savePostMutation } from "../utils/queries";
import apolloClient from "../utils/apolloClient";
import { getPostQuery } from "../utils/queries";

let initialFormValues = {
  title: "",
  content: "",
  slug: "",
  teaser: "",
  image: null
};

const formId = "postForm";

export default {
  components: {
    ContentEditor,
    AppLoader
  },
  props: {
    // UPDATE or CREATE.
    operation: {
      type: String,
      required: true
    },
    blogId: {
      type: String,
      required: true
    },
    postId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      // post from database. So it's NOT present for postCreate route,
      // only for postUpdate route.
      existingPost: null,
      loadingAsyncData: false,
      savingPost: {
        state: REQUEST_STATE.NOT_STARTED,
        status: null
      }
    };
  },
  created() {
    console.log("postForm - created");
    this.formId = formId;
    this.vuexFormGetValue = vuexFormGetValue;
    this.vuexFormGetValues = vuexFormGetValues;
    this.init();
  },
  mounted() {
    console.log("postForm - mounted");
  },
  watch: {
    post: {
      handler: function(post) {
        this.postFormInit();
      }
    }
  },
  methods: {
    async init() {
      if (this.operation === "CREATE") {
        this.postFormInit(initialFormValues);
      }
      // if update mode, we need to load existing post first.
      // UNLESS we are coming from create page after first saving : all our values
      // are already in our form so no need to rerender all the component.
      // Yhis is because we DONT want to interrupt writing in this particular case,
      // this could lead to data loss when autosave is enabled.
      if (this.operation === "UPDATE") {
        if (!this.comingFromPostCreateRoute()) {
          this.loadingAsyncData = true;
          this.existingPost = await this.getExistingPost(this.postId);
          this.loadingAsyncData = false;
          const formValues = this.prepareFormValuesFromPost(this.existingPost);
          this.postFormInit(formValues);
        }
      }
    },
    onTitleInput(value) {
      vuexFormSetValue(formId, "title", value);
    },
    contentAutosave(value) {
      // we hack ckeditor autosave to update our form value
      // We are not using "change" event  because it is triggered on every key stroke.
      vuexFormSetValue(formId, "content", value);
      // save post automatically as DRAFT when post is DRAFT
      if (
        vuexFormGetValue(formId, "title").trim() &&
        this.getPostStatus() === "DRAFT"
      ) {
        return this.savePost("DRAFT");
      } else {
        return Promise.resolve("nothing to save.");
      }
    },
    // when user click "enter" in the title input,
    // automically move cursor to the textarea
    onTitleEnter() {
      this.$refs.contentEditor.$refs.editor.focus();
    },
    postFormInit(formValues) {
      vuexFormInit(formId, {
        initialValues: { ...formValues },
        onFormValueChange: ({ name, value }) => {
          // @TODO that's the right place to autosave something on the server,
          // with some deboucing :).
          //console.log("name:", name, "value changed:", value);
        }
      });
    },
    // fill form fields from a post object
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
    // Prepare a post object from form form.values, for a save operation
    preparePostFromCurrentFormValues() {
      const postToSave = {
        title: vuexFormGetValue(formId, "title"),
        content: vuexFormGetValue(formId, "content"),
        slug: vuexFormGetValue(formId, "slug"),
        teaser: vuexFormGetValue(formId, "teaser"),
        image: vuexFormGetValue(formId, "image")
      };
      // if there is an id, API will know this is an UPDATE and not a CREATE operation
      if (this.post && this.post._id) {
        postToSave._id = this.post._id;
      }
      return postToSave;
    },
    onSaveClick() {
      this.savePost("DRAFT");
    },
    savePost(status) {
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
            blog: this.blogId
          }
        })
        .then(async result => {
          const post = result.data.savePost;
          this.savingPost = {
            state: REQUEST_STATE.FINISHED_OK,
            status
          };
          // if post does not exist yet in database, we are in create mode.
          // And we want to redirect user to its update url in a fluid way
          // while he is still writing.
          if (!this.post) {
            this.$router.replace(
              {
                name: "postUpdate",
                params: {
                  blogId: this.blogId,
                  postId: post._id
                }
              },
              () => {
                this.$store.commit("comingFromPostCreateRoute", post._id);
              }
            );
          }
          return post;
        })
        .catch(error => {
          this.savingPost = {
            state: REQUEST_STATE.FINISHED_ERROR,
            status
          };
          appNotification(
            "😞Sorry, an error occured while creating post : " + error,
            "error"
          );
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
          this.post = result.data.post;
          return result.data.post;
        })
        .catch(error => {
          appNotification("getExistingPost(): " + error, "error");
        });
    },
    getPostStatus() {
      let status = this.existingPost ? this.existingPost.status : "DRAFT";
      return status;
    },
    comingFromPostCreateRoute() {
      return this.$store.state.global.comingFromPostCreateRoute === this.postId;
    },
    saveAsDraft() {
      this.savePost("DRAFT");
    }
  }
};
</script>

<style>
.post-form__field-title {
  text-align: center;
  max-width: 812px;
  margin: auto;
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
  min-height: 100vh;
  max-width: 812px;
  padding: 32px;
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.05);
  margin: auto;
  background: white;
}
</style>
