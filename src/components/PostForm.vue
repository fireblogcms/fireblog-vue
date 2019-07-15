<template>
  <div class="writeForm">
    <portal to="topbar-left">
      <router-link class="item" v-if="$route.params.podId" :to="`/pod/${$route.params.podId}`">
        <i class="fas fa-chevron-left"></i> Posts
      </router-link>
    </portal>
    <Notify :errors="notifications.errors" :info="notifications.info" />
    <portal to="topbar-right">
      <span class="item button" style="border:0" v-if="lastTimeSaved">
        <em>saved at {{ lastTimeSaved | moment("HH:mm:ss") }}</em>
      </span>

      <input
        @click="onSaveClick()"
        v-if="
          operation === 'CREATE' ||
            (existingPost && existingPost.status === 'DRAFT')
        "
        class="button is-outlined item"
        :class="{ 'is-loading': savingPostState === 'PENDING' }"
        type="submit"
        value="SAVE"
      />

      <input
        @click="onPublishPostClick()"
        class="button is-outlined item"
        :class="{ 'is-loading': publishPostState === 'PENDING' }"
        type="submit"
        value="PUBLISH"
      />
    </portal>

    <template v-if="loadingPostState === 'PENDING'">
      <PodLoader />
    </template>

    <form @submit.prevent>
      <textarea-autosize
        @keydown.enter.native.prevent="onEnter"
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
import AdminLayout from "@/layouts/AdminLayout";
import apolloClient from "../lib/apolloClient";
import PodLoader from "../components/PodLoader";
// import Editor from "@ckeditor/ckeditor5-build-classic";
// import Editor from "@ckeditor/ckeditor5-build-balloon";
import Editor from "@ckeditor/ckeditor5-build-balloon-block";
import CKEditor from "@ckeditor/ckeditor5-vue";
import { getUser } from "@/lib/auth";
import gql from "graphql-tag";
import BulmaButton from "./BulmaButton";
import Notify from "./Notify";
import { REQUEST_STATE } from "../lib/helpers";

const createPostQuery = gql`
  mutation createPostQuery($post: CreatePostInput!) {
    createPost(post: $post) {
      _id
      author {
        _id
        name
        email
      }
      title
      content
      status
    }
  }
`;

const updatePostQuery = gql`
  mutation updatePostQuery($post: UpdatePostInput!) {
    updatePost(post: $post) {
      _id
      title
      content
      status
      author {
        _id
        name
        email
      }
    }
  }
`;

const getExistingPostQuery = gql`
  query getExistingPostQuery($_id: ID!) {
    post(_id: $_id) {
      _id
      title
      content
      status
    }
  }
`;

export default {
  components: {
    // Use the <ckeditor> component in this view.
    ckeditor: CKEditor.component,
    AdminLayout,
    PodLoader,
    BulmaButton,
    Notify
  },
  data() {
    return {
      operation: "CREATE",
      publishPostState: REQUEST_STATE.NOT_STARTED,
      savingPostState: REQUEST_STATE.NOT_STARTED,
      savingPostMessage: null,
      loadingPostState: REQUEST_STATE.NOT_STARTED,
      loadingPostMessage: null,
      lastTimeSaved: null,
      existingPost: null,
      notifications: {
        errors: [],
        info: []
      },
      inputs: {
        title: "",
        content: "",
        status: "DRAFT"
      },
      publishDropdownIsActive: false
    };
  },
  // "heading"
  // "mediaEmbed"

  created() {
    // if there is a postId in the url, we are updating an existing post.
    if (this.$route.params.postId) {
      this.operation = "UPDATE";
    }
    this.editor = Editor;
    /*
    0: "heading"
    1: "|"
    2: "bulletedList"
    3: "numberedList"
    4: "imageUpload"
    5: "blockQuote"
    6: "insertTable"
    7: "mediaEmbed"
    items: (5) ["bold", "italic", "link", "undo", "redo"]
    */
    this.editorConfig = {
      toolbar: ["bold", "italic", "link", "heading"],
      blockToolbar: ["imageUpload", "mediaEmbed"]
    };

    // if we are editing a post, the route
    if (this.operation === "UPDATE") {
      this.loadingPostMessage = null;
      this.loadingPostState = REQUEST_STATE.PENDING;
      this.getExistingPost()
        .then(result => {
          this.existingPost = result.data.post;
          this.inputs.title = this.existingPost.title;
          this.inputs.content = this.existingPost.content
            ? this.existingPost.content
            : "";
          this.inputs.status = this.existingPost.status
            ? this.existingPost.status
            : this.inputs.status;
          this.loadingPostState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(e => {
          this.notifications.errors.push(
            "😞Sorry, loading post failed with this error message: " + e
          );
          this.loadingPostState = REQUEST_STATE.FINISHED_ERROR;
        });
    }
  },

  methods: {
    onEnter() {
      this.$refs.ckeditor.$el.focus();
    },
    onApiClick() {
      this.$router.push(`/pod/${this.$route.params.podId}/write/post/api`);
    },
    getExistingPost() {
      return apolloClient.query({
        query: getExistingPostQuery,
        variables: { _id: this.$route.params.postId }
      });
    },
    onSaveClick(post) {
      this.savingPostState = REQUEST_STATE.PENDING;
      //
      // CREATE
      //
      if (this.operation === "CREATE") {
        const pod_id = this.$route.params.podId;
        const user_id = getUser().sub;
        const newPost = {
          pod: pod_id,
          author: user_id,
          title: this.inputs.title,
          content: this.inputs.content,
          status: this.inputs.status
        };
        apolloClient
          .mutate({
            mutation: createPostQuery,
            variables: { post: newPost }
          })
          .then(result => {
            apolloClient.clearStore();
            this.savingPostState = REQUEST_STATE.FINISHED_OK;
            this.lastTimeSaved = Date.now();
            // post is created, we are now in UPDATE mode for the form.
            this.operation = "UPDATE";
            this.existingPost = result.data.createPost;
            this.$router.replace(
              `/pod/${this.$route.params.podId}/write/post/${
                result.data.createPost._id
              }`
            );
          })
          .catch(e => {
            this.notifications.errors.push(
              "😞Sorry, saving post failed with this error message: " + e
            );
            this.savingPostState = REQUEST_STATE.FINISHED_ERROR;
          });
      }
      //
      // UPDATE
      //
      if (this.operation === "UPDATE") {
        const variables = {
          post: {
            _id: this.existingPost._id,
            title: this.inputs.title,
            content: this.inputs.content
          }
        };
        apolloClient
          .mutate({
            mutation: updatePostQuery,
            variables
          })
          .then(r => {
            this.savingPostState = REQUEST_STATE.FINISHED_OK;
            this.lastTimeSaved = Date.now();
            apolloClient.clearStore();
          })
          .catch(e => {
            this.savingPostState = REQUEST_STATE.FINISHED_ERROR;
            this.savingPostMessage =
              "Sorry, post saving failed with th following message: " + e;
          });
      }
    },
    onPublishPostClick() {
      this.savingPostState = REQUEST_STATE.FINISHED_OK;
      alert("publish now ?");
    }
  }
};
</script>

<style>
.writeForm form {
  font-family: "Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 0 2rem;
  margin: auto;
  max-width: 840px;
  padding: 2rem 4rem;
}

.writeForm textarea#title {
  background: transparent;
  /*font-family: serif;*/

  text-align: left;
  font-size: 50px;
  width: 100%;
  border: none !important;
  border-color: none;
  outline: none !important;
}

.writeForm .ck-editor__editable {
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
</style>
