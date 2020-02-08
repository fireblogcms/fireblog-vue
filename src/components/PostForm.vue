<template>
  <div class="post-form">
    <form @submit.prevent>
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
          :value="formGetValue('postForm', 'title')"
        />
      </div>
      <ContentEditor
        class="post-form__field-editor"
        :autosave="contentAutosave"
      />
      <button @click="onSaveClick" class="button is-primary" type="submit">
        Sauvegarder
      </button>
    </form>
  </div>
</template>

<script>
import Editor from "fireblog-ckeditor";
import ContentEditor from "./ContentEditor";
import { ckeditorS3UploadAdapterPlugin } from "../utils/ckeditorS3UploadAdapterPlugin";
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
  formInit,
  formSetValue,
  formSetError,
  formResetErrors,
  formGetValue,
  formGetErrors,
  formGetValues,
  formGetInitialValues
} from "../utils/vuexForm";
import { savePostMutation } from "../utils/queries";
import apolloClient from "../utils/apolloClient";

const initialFormValues = {
  title: "",
  content: "",
  slug: "",
  teaser: "",
  image: null
};

const formId = "postForm";

export default {
  components: {
    ContentEditor
  },
  props: {
    post: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  created() {
    this.formId = formId;
    this.formGetValue = formGetValue;
    this.formGetValues = formGetValues;
    this.REQUEST_STATE = REQUEST_STATE;

    formInit(formId, {
      initialValues: { ...initialFormValues },
      onFormValueChange: ({ name, value }) => {
        // @TODO that's the right place to autosave something on the server,
        // with some deboucing :).
        console.log("name:", name, "value changed:", value);
      }
    });
  },
  mounted() {},
  methods: {
    onTitleInput(value) {
      formSetValue(formId, "title", value);
    },
    // we hack ckeditor autosave to update our form value
    // We are not using "change" event  because it is triggered on every key stroke.
    contentAutosave(value) {
      console.log("content autosave");
      formSetValue(formId, "content", value);
      return Promise.resolve("saved.");
    },
    // Prepare a post object from form form.values, for a save operation
    preparePostFromCurrentFormValues() {
      return {
        title: formGetValue(formId, "title"),
        content: formGetValue(formId, "content"),
        slug: formGetValue(formId, "slug"),
        teaser: formGetValue(formId, "teaser"),
        image: formGetValue(formId, "image")
      };
    },
    onSaveClick() {
      const post = {
        ...this.preparePostFromCurrentFormValues(),
        status: "DRAFT",
        blog: this.$route.params.blogId
      };
      this.savePost(post);
    },
    savePost(post) {
      return apolloClient
        .mutate({
          mutation: savePostMutation,
          variables: {
            post
          }
        })
        .then(async result => {
          const post = result.data.savePost;
          this.$router.push({
            name: "postUpdate",
            params: {
              blogId: post.blog,
              postId: post._id
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
