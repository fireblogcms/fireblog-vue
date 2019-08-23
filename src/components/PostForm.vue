<template>
  <div class="writeForm">
    <portal to="topbar-left">
      <!--  back to the posts list for this pod. -->
      <router-link
        class="item"
        v-if="$route.params.blogId"
        :to="{name:'postList', params:{blogId: $route.params.blogId}}"
      >
        <i class="fas fa-chevron-left"></i> Posts
      </router-link>

      <span class="item button" style="border:0" v-if="lastTimeSaved">
        <em>saved at {{ lastTimeSaved | moment("HH:mm:ss") }}</em>
      </span>
    </portal>

    <Notify :errors="notifications.errors" />
    <portal to="topbar-right" v-if="operation() === 'CREATE' || this.existingPost">
      <input
        @click="onSaveClick()"
        v-if="!existingPost || (existingPost && existingPost.status === 'DRAFT')"
        class="button is-outlined item"
        :class="{ 'is-loading': savingPostState === REQUEST_STATE.PENDING }"
        type="submit"
        value="SAVE DRAFT"
      />

      <input
        @click="onUnpublishPostClick()"
        v-if="existingPost && existingPost.status === 'PUBLISHED'"
        class="button is-outlined item"
        type="submit"
        value="UNPUBLISH"
      />

      <input
        @click="onPublishPostClick()"
        v-if="!existingPost || existingPost.status.includes('DRAFT', 'BIN')"
        class="button is-outlined item is-primary"
        :class="{ 'is-loading': publishPostState === REQUEST_STATE.PENDING }"
        type="submit"
        value="PUBLISH"
      />

      <input
        @click="onPublishPostClick()"
        v-if="existingPost && existingPost.status === 'PUBLISHED'"
        class="button is-outlined item is-primary"
        :class="{ 'is-loading': publishPostState === REQUEST_STATE.PENDING }"
        type="submit"
        value="PUBLISH CHANGES"
      />
    </portal>

    <template v-if="loadingPostState === REQUEST_STATE.PENDING">
      <PodLoader />
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
import PodLoader from "../components/PodLoader";
// import Editor from "@ckeditor/ckeditor5-build-classic";
// import Editor from "@ckeditor/ckeditor5-build-balloon";
import Editor from "@ckeditor/ckeditor5-build-balloon-block";
import CKEditor from "@ckeditor/ckeditor5-vue";
import { getUser } from "@/lib/auth";
import gql from "graphql-tag";
import Notify from "./Notify";
import { REQUEST_STATE } from "../lib/helpers";
import { ckeditorUploadAdapterPlugin } from "../lib/ckeditorUploadAdapter";

const PostResponseFragment = gql`
  fragment PostResponse on Post {
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

const uploadQuery = gql`
  mutation uploadQuery($file: Upload!, $podId: ID!) {
    upload(file: $file, podId: $podId) {
      url
      filename
      mimetype
      encoding
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
    PodLoader,
    Notify
  },
  data() {
    return {
      publishPostState: REQUEST_STATE.NOT_STARTED,
      savingPostState: REQUEST_STATE.NOT_STARTED,
      loadingPostState: REQUEST_STATE.NOT_STARTED,
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
    this.REQUEST_STATE = REQUEST_STATE;
    this.OPERATION = OPERATION;
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
      extraPlugins: [ckeditorUploadAdapterPlugin],
      toolbar: ["bold", "italic", "link", "heading"],
      blockToolbar: ["imageUpload", "mediaEmbed"]
    };

    // if we are editing a post, the route
    if (this.operation() === OPERATION.UPDATE) {
      this.loadingPostState = REQUEST_STATE.PENDING;
      this.getExistingPost()
        .then(result => {
          this.existingPost = result.data.post;
          this.inputs = this.prepareInputsFromPost(this.existingPost);
          this.loadingPostState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(e => {
          this.notifications.errors.push("😞Sorry, loading post failed: " + e);
          this.loadingPostState = REQUEST_STATE.FINISHED_ERROR;
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
    createPost(post) {
      // current user as author by default
      if (!post.author) {
        // @FIXME : utiliser plutôt l'id de la base sur "sub"
        post.author = getUser().sub;
      }
      post.pod = this.$route.params.blogId;
      return apolloClient
        .mutate({
          mutation: createPostQuery,
          variables: { post }
        })
        .then(result => {
          apolloClient.clearStore();
          this.savingPostState = REQUEST_STATE.FINISHED_OK;
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
          /*
          this.$router.replace(
            `/pod/${this.$route.params.blogId}/write/post/${
              result.data.createPost._id
            }`
          );
          */
        })
        .catch(e => {
          this.notifications.errors.push(
            "😞Sorry, saving post failed with this error message: " + e
          );
          this.savingPostState = REQUEST_STATE.FINISHED_ERROR;
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
          this.savingPostState = REQUEST_STATE.FINISHED_OK;
          this.lastTimeSaved = Date.now();
          this.existingPost = result.data.updatePost;
          apolloClient.clearStore();
        })
        .catch(e => {
          this.savingPostState = REQUEST_STATE.FINISHED_ERROR;
          this.notifications.errors.push("Sorry, updatePost failed : " + e);
        });
    },
    onSaveClick() {
      if (this.operation() === OPERATION.CREATE) {
        this.createPost(this.preparePostFromInputs(this.inputs));
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
        this.updatePost(post);
      }
    },
    onPublishPostClick() {
      const status = "PUBLISHED";
      if (this.operation() === "CREATE") {
        const newPost = {
          ...this.preparePostFromInputs(this.inputs),
          status
        };
        this.createPost(newPost);
      }
      if (this.operation() === "UPDATE") {
        const post = {
          ...this.preparePostFromInputs(this.inputs),
          status
        };
        this.updatePost(post);
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
.writeForm form {
  font-family: "Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 0 2rem;
  margin: auto;
  max-width: 940px;
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
</style>
