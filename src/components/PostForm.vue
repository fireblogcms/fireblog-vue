<template>
  <div class="writeForm">
    <AppNotify :errors="notifications.errors" />
    <portal to="topbar-left">
      <span class="item button" style="border:0" v-if="lastTimeSaved">
        <em>saved at {{ lastTimeSaved | moment("HH:mm:ss") }}</em>
      </span>
    </portal>
    <portal to="topbar-right" v-if="operation() === 'CREATE' || this.existingPost">
      <button
        @click="onSaveDraftClick()"
        v-if="!existingPost || (existingPost && existingPost.status === 'DRAFT')"
        class="button is-outlined item"
        :class="{ 'is-loading': savingDraftState === LOADING_STATE.PENDING }"
        type="submit"
      >SAVE DRAFT</button>

      <button
        @click="onUnpublishPostClick()"
        v-if="existingPost && existingPost.status === 'PUBLISHED'"
        class="button is-outlined item"
        type="submit"
        value="UNPUBLISH"
      >UNPUBLISH</button>

      <button
        @click="onPublishPostClick()"
        v-if="!existingPost || existingPost.status.includes('DRAFT', 'BIN')"
        class="button is-outlined item is-primary"
        :class="{ 'is-loading': publishPostState === LOADING_STATE.PENDING }"
        type="submit"
      >PUBLISH</button>

      <button
        @click="onPublishPostClick()"
        v-if="existingPost && existingPost.status === 'PUBLISHED'"
        class="button is-outlined item is-primary"
        :class="{ 'is-loading': publishPostState === LOADING_STATE.PENDING }"
        type="submit"
      >PUBLISH CHANGES</button>
    </portal>

    <template v-if="loadingPostState === LOADING_STATE.PENDING">
      <AppLoader />
    </template>

    <form @submit.prevent>
      <textarea-autosize
        @keydown.enter.native.prevent="onTitleEnter"
        autofocus
        rows="1"
        placeholder="Title"
        type="text"
        id="title"
        v-model="inputs.title"
      ></textarea-autosize>
      <ckeditor ref="ckeditor" :editor="editor" v-model="inputs.content" :config="editorConfig"></ckeditor>
    </form>
  </div>
</template>

<script>
import apolloClient from "../lib/apolloClient";
import AppLoader from "../components/AppLoader";
import Editor from "@ckeditor/ckeditor5-build-balloon-block";
import CKEditor from "@ckeditor/ckeditor5-vue";
import gql from "graphql-tag";
import AppNotify from "./AppNotify";
import { LOADING_STATE, getUser, getBlog } from "../lib/helpers";
import { ckeditorUploadAdapterPlugin } from "../lib/ckeditorUploadAdapter";

const PostResponseFragment = gql`
  fragment PostResponse on Post {
    _id
    title
    content
    status
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

const OPERATION = {
  CREATE: "CREATE",
  UPDATE: "UPDATE"
};

export default {
  components: {
    // Use the <ckeditor> component in this view.
    ckeditor: CKEditor.component,
    AppLoader,
    AppNotify
  },
  data() {
    return {
      publishPostState: LOADING_STATE.NOT_STARTED,
      savingPostState: LOADING_STATE.NOT_STARTED,
      savingDraftState: LOADING_STATE.NOT_STARTED,
      lastTimeSaved: null,
      existingPost: null,
      notifications: {
        errors: [],
        info: []
      },
      inputs: {
        title: "",
        content: ""
      }
    };
  },
  created() {
    this.editor = Editor;
    this.LOADING_STATE = LOADING_STATE;
    this.OPERATION = OPERATION;
    this.editorConfig = {
      extraPlugins: [ckeditorUploadAdapterPlugin],
      toolbar: ["bold", "italic", "link", "heading", "blockQuote"],
      blockToolbar: ["imageUpload", "mediaEmbed"]
    };

    // if we are editing a post, the route
    if (this.operation() === OPERATION.UPDATE) {
      this.loadingPostState = LOADING_STATE.PENDING;
      this.getExistingPost()
        .then(result => {
          this.existingPost = result.data.post;
          this.inputs = this.prepareInputsFromPost(this.existingPost);
          this.loadingPostState = LOADING_STATE.COMPLETED_OK;
        })
        .catch(e => {
          this.notifications.errors.push("😞Sorry, loading post failed: " + e);
          this.loadingPostState = LOADING_STATE.COMPLETED_ERROR;
        });
    }
  },
  methods: {
    onTitleEnter() {
      this.$refs.ckeditor.$el.focus();
    },
    operation() {
      // if there is a postId in the url, we are updating an existing post.
      return this.$route.params.postId ? OPERATION.UPDATE : OPERATION.CREATE;
    },
    getExistingPost() {
      return apolloClient.query({
        query: getExistingPostQuery,
        variables: { _id: this.$route.params.postId }
      });
    },
    // prepare form inputs from a post object
    prepareInputsFromPost(post) {
      return {
        title: post.title,
        content: post.content ? post.content : ""
      };
    },
    // prepare a post object from form inputs
    preparePostFromInputs(inputs) {
      return {
        title: inputs.title,
        content: inputs.content,
        status: "DRAFT"
      };
    },
    async createPost(post) {
      const user = await getUser();
      const blog = await getBlog(this.$route.params.blogId);
      console.log("debug:createPost:user", user);
      console.log("debug:createPost:post", post);
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
          apolloClient.resetStore();
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
        .catch(e => {
          this.notifications.errors.push(
            "😞Sorry, saving post failed with this error message: " + e
          );
          return e;
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
          apolloClient.clearStore();
          return result;
        });
    },
    onSaveDraftClick() {
      if (!this.inputs.title.trim()) {
        alert("A title is required");
        return;
      }
      this.savingDraftState = LOADING_STATE.PENDING;
      if (this.operation() === OPERATION.CREATE) {
        this.createPost(this.preparePostFromInputs(this.inputs))
          .then(() => {
            this.savingDraftState = LOADING_STATE.COMPLETED_OK;
          })
          .catch(e => {
            this.savingDraftState = LOADING_STATE.COMPLETED_ERROR;
          });
      }
      //
      // UPDATE
      //
      if (this.operation() === OPERATION.UPDATE) {
        const post = {
          _id: this.$route.params.postId,
          title: this.inputs.title,
          content: this.inputs.content
        };
        this.updatePost(post)
          .then(() => {
            this.savingDraftState = LOADING_STATE.COMPLETED_OK;
          })
          .catch(e => {
            this.savingDraftState = LOADING_STATE.COMPLETED_ERROR;
          });
      }
    },
    onPublishPostClick() {
      if (!this.inputs.title.trim()) {
        alert("A title is required");
        return;
      }
      const status = "PUBLISHED";
      if (this.operation() === "CREATE") {
        this.publishPostState = LOADING_STATE.PENDING;
        const newPost = {
          ...this.preparePostFromInputs(this.inputs),
          publishedAt: new Date(),
          status
        };
        this.createPost(newPost)
          .then(() => {
            this.publishPostState = LOADING_STATE.COMPLETED_OK;
          })
          .catch(e => {
            this.publishPostState = LOADING_STATE.COMPLETED_ERROR;
          });
      }
      if (this.operation() === "UPDATE") {
        this.publishPostState = LOADING_STATE.PENDING;
        const post = {
          ...this.preparePostFromInputs(this.inputs),
          publishedAt: new Date(),
          status
        };
        this.updatePost(post)
          .then(() => {
            this.publishPostState = LOADING_STATE.COMPLETED_OK;
          })
          .catch(e => {
            this.publishPostState = LOADING_STATE.COMPLETED_ERROR;
          });
      }
    },
    onUnpublishPostClick() {
      const post = {
        ...this.preparePostFromInputs(this.inputs),
        status: "DRAFT"
      };
      this.updatePost(post);
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
.writeForm .ck-editor__editable p {
  font-size: 21px;
  padding: 0.7rem 0;
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
</style>
