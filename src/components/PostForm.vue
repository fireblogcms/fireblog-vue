<template>
  <div class="post-form">
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
      <!--      -->
      <ContentEditor
        ref="contentEditor"
        class="post-form__field-editor"
        :autosave="contentAutosave"
        :value="vuexFormGetValue('postForm', 'content')"
        :wordCountDomElement="() => $refs.wordcount"
      />
    </form>

    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <span
        @click="onBackToPostClick"
        style="cursor:pointer"
        class="item tag is-large"
      >
        <em>
          <img
            style="position:relative;height:20px !important;top:4px;"
            src="/images/book.png"
          />
          <IconBack />posts
        </em>
      </span>
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

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

      <!-- BEGIN PUBLICATION BUTTON (launch advanced settings modal)       -->
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
    <footer class="post-form__document-infos">
      <div class="container">
        <div v-if="existingPost" class="item">
          {{ $t("global." + getPostStatus().toLowerCase()) }}
          <span v-if="savingPost.state === 'PENDING'">Saving...</span>
          <span v-if="savingPost.state !== 'PENDING'"
            >-{{
              $t("views.postForm.savedAt {time}", {
                time: formatDate(new Date(existingPost.updatedAt), "long")
              })
            }}
          </span>
        </div>
        <div ref="wordcount" class="post-form__document-infos__word-count" />
      </div>
    </footer>
  </div>
</template>

<script>
import Editor from "fireblog-ckeditor";
import ContentEditor from "./ContentEditor";
import { ckeditorS3UploadAdapterPlugin } from "../utils/ckeditorS3UploadAdapterPlugin";
import AppLoader from "../components/AppLoader";
import hotkeys from "hotkeys-js";
import IconBack from "./IconBack";

import {
  REQUEST_STATE,
  getUser,
  getBlog,
  createSlug,
  ckeditorIframelyMediaProvider,
  appNotification,
  validateSlug,
  resetAppNotifications,
  toast,
  formatDate
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
    AppLoader,
    IconBack
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
        this.saveAsDraft()
          .then(() => {
            toast(this, this.$t("views.postForm.draftSaved"));
          })
          .catch(e => {
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
  methods: {
    async init() {
      // no existing post, we are in CREATE MODE
      if (this.$route.name === "postCreate") {
        this.postFormInit(initialFormValues);
      }

      // UPDATE MODE
      // if update mode, we need to load existing post first.
      // UNLESS we are coming from create page after first saving : all our values
      // are already in our form so no need to rerender all the component.
      // Yhis is because we DONT want to interrupt writing in this particular case,
      // this could lead to data loss when autosave is enabled.
      if (this.$route.name === "postUpdate") {
        if (!this.comingFromPostCreateRoute()) {
          this.loadingAsyncData = true;
          this.existingPost = await this.getExistingPost(
            this.$route.params.postId
          );
          this.$store.commit("lastVisitedPost", this.existingPost);
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
      // @FIXME : l'autosave peut techniquement se déclencher sur un AUTRE POST
      // avec les valeurs d'un autre post :-/
      // we hack ckeditor autosave to update our form value
      // We are not using "change" event  because it is triggered on every key stroke.
      vuexFormSetValue(formId, "content", value);
      /*
      if (!["postCreate", "postUpdate"].includes(this.$route.name)) {
        Promise.reject("autosave is allow only on post Form.");
      }
      // save post automatically as DRAFT when post is DRAFT
      if (
        vuexFormGetValue(formId, "title").trim() &&
        this.getPostStatus() === "DRAFT"
      ) {
        return this.savePost("DRAFT");
      } else {
        return Promise.resolve("nothing to save.");
      }
      */
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
          console.log("form value changed !");
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
      // API will know that this is an UPDATE and not a CREATE
      // if we add _id key to our post.
      if (this.$route.params.postId) {
        postToSave._id = this.$route.params.postId;
      }
      return postToSave;
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
            blog: this.$route.params.blogId
          }
        })
        .then(async result => {
          const post = result.data.savePost;
          this.existingPost = post;
          this.$store.commit("lastVisitedPost", post);
          this.savingPost = {
            state: REQUEST_STATE.FINISHED_OK,
            status
          };
          // redirect to update route if we were on "postCreate" route,
          // Now that our post exist for sure in database
          if (this.$route.name === "postCreate") {
            this.$router.replace(
              {
                name: "postUpdate",
                params: {
                  blogId: this.$route.params.blogId,
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
            "😞Sorry, an error occured while saving post, maybe an issue with the server. Please copy paste your whole text to an outside location, to ensure your work is not lost! ",
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
          this.existingPost = result.data.post;
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
      return (
        this.$store.state.global.comingFromPostCreateRoute ===
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
    }
  }
};
</script>

<style>
.post-form {
  margin-top: 30px;
}

.post-form__field-title {
  text-align: center;
  position: relative;
  background: white;
  top: 10px;
  padding: 30px;
  padding-bottom: 0px;
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
  min-height: 100vh;
  max-width: 880px;
  padding: 32px;
  box-shadow: 1px 1px 1px 0px rgba(0, 0, 0, 0.05);
  margin: auto;
  background: white;
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
  font-size: 11px;
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
