<template>
  <div class="writeForm">
    <AppNotify :errors="notifications.errors" />

    <!-- LOADER  displayed while initData are fetched -->
    <template v-if="initDataState === 'PENDING'">
      <AppLoader :absolute="true" />
    </template>

    <template v-if="initDataState === REQUEST_STATE.COMPLETED_OK">
      <!-- TOPBAR LEFT BUTTONS -->
      <portal to="topbar-left">
        <router-link :to="{ name: 'postList', params: { blogId: this.$route.params.blogId }}">
          <span style="cursor:pointer" class="item tag is-medium">
            <em>
              <img style="position:relative;height:20px !important;top:4px;" src="/images/book.png" />
              <span style="padding-left:10px;"><</span>
              posts
            </em>
          </span>
        </router-link>
        <span class="item button" style="border:0" v-if="lastTimeSaved">
          <em>saved at {{ lastTimeSaved | moment("HH:mm:ss") }}</em>
        </span>
      </portal>
      <!-- END TOPBAR LEFT BUTTONS -->

      <!-- TOPBAR RIGHT BUTTONS -->
      <portal to="topbar-right" v-if="operation() === 'CREATE' || this.existingPost">
        <button
          v-if="!existingPost || (existingPost && existingPost.status === 'DRAFT')"
          @click="onSaveDraftClick()"
          class="button is-outlined item"
          :class="{ 'is-loading': savingDraftState === REQUEST_STATE.PENDING }"
          type="submit"
        >SAVE DRAFT</button>

        <button
          @click="onUnpublishPostClick()"
          v-if="existingPost && existingPost.status === 'PUBLISHED'"
          class="button is-outlined item"
          :class="{'is-loading': unpublishPostState === REQUEST_STATE.PENDING}"
          :disabled="unpublishPostState === REQUEST_STATE.PENDING"
          type="submit"
          value="UNPUBLISH"
        >UNPUBLISH</button>

        <button
          @click="onPublishPostClick()"
          v-if="!existingPost || existingPost.status.includes('DRAFT', 'BIN')"
          class="button is-outlined item is-primary"
          :class="{ 'is-loading': publishPostState === REQUEST_STATE.PENDING }"
          :disabled="publishPostState === REQUEST_STATE.PENDING"
          type="submit"
        >PUBLISH</button>

        <button
          @click="onPublishPostClick()"
          v-if="existingPost && existingPost.status === 'PUBLISHED'"
          class="button item is-outlined is-primary"
          :class="{ 'is-loading': publishPostState === REQUEST_STATE.PENDING }"
          :disabled="publishPostState === REQUEST_STATE.PENDING"
          type="submit"
        >PUBLISH CHANGES</button>
      </portal>
      <!-- END TOPBAR RIGHT BUTTONS -->

      <!-- FORM -->
      <form @submit.prevent>
        <textarea-autosize
          maxlength="250"
          @keydown.enter.native.prevent="onTitleEnter"
          autofocus
          rows="1"
          placeholder="Title"
          type="text"
          id="title"
          :disabled="savingDraftState ===  REQUEST_STATE.PENDING"
          v-model="inputs.title"
        ></textarea-autosize>
        <ckeditor
          class="content"
          :disabled="savingDraftState ===  REQUEST_STATE.PENDING"
          ref="ckeditor"
          :editor="editor"
          v-model="inputs.content"
          :config="editorConfig"
        ></ckeditor>
      </form>
    </template>
  </div>
</template>

<script>
import apolloClient from "../lib/apolloClient";
import AppLoader from "../components/AppLoader";
import Editor from "@ckeditor/ckeditor5-build-balloon-block";
import CKEditor from "@ckeditor/ckeditor5-vue";
import gql from "graphql-tag";
import AppNotify from "./AppNotify";
import { REQUEST_STATE, getUser, getBlog } from "../lib/helpers";
import { ckeditorUploadAdapterPlugin } from "../lib/ckeditorUploadAdapter";
import hotkeys from "hotkeys-js";
import Loading from "vue-loading-overlay";

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

const blogQuery = gql`
  query blogQuery($_id: ID!) {
    blog(_id: $_id) {
      name
      description
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
    AppNotify,
    Loading
  },
  data() {
    return {
      initDataState: REQUEST_STATE.NOT_STARTED,
      publishPostState: REQUEST_STATE.NOT_STARTED,
      unpublishPostState: REQUEST_STATE.NOT_STARTED,
      savingDraftState: REQUEST_STATE.NOT_STARTED,
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
    this.initData();
    this.REQUEST_STATE = REQUEST_STATE;
    this.OPERATION = OPERATION;
    this.editor = Editor;
    this.editorConfig = {
      extraPlugins: [ckeditorUploadAdapterPlugin],
      toolbar: [
        "bold",
        "italic",
        "link",
        "heading",
        "blockQuote",
        "bulletedList"
      ],
      blockToolbar: ["imageUpload", "mediaEmbed"],
      image: {
        toolbar: ["imageTextAlternative"]
      }
    };
    hotkeys.filter = event => {
      if (["postUpdate", "postCreate"].includes(this.$route.name)) {
        return true;
      }
      return false;
    };
    hotkeys("ctrl+s,command+s", (event, handler) => {
      // Prevent the default refresh event under WINDOWS system
      // this.onSaveDraftClick();
      event.preventDefault();
    });
  },
  methods: {
    initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      const promises = [];
      promises.push(this.getBlog());
      // if we are editing a post, the route
      if (this.operation() === OPERATION.UPDATE) {
        promises.push(this.getExistingPost());
      }
      return Promise.all(promises)
        .then(results => {
          this.initDataState = REQUEST_STATE.COMPLETED_OK;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.COMPLETED_ERROR;
          logger.error(new Error(error));
        });
    },
    getBlog() {
      return apolloClient
        .query({
          query: blogQuery,
          variables: {
            _id: this.$route.params.blogId
          }
        })
        .then(result => {
          this.blog = result.data.blog;
          return result;
        });
    },
    onTitleEnter() {
      this.$refs.ckeditor.$el.focus();
    },
    operation() {
      // if there is a postId in the url, we are updating an existing post.
      return this.$route.params.postId ? OPERATION.UPDATE : OPERATION.CREATE;
    },
    getExistingPost() {
      return apolloClient
        .query({
          query: getExistingPostQuery,
          variables: { _id: this.$route.params.postId }
        })
        .then(result => {
          this.existingPost = result.data.post;
          this.inputs = this.prepareInputsFromPost(this.existingPost);
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
      this.savingDraftState = REQUEST_STATE.PENDING;
      if (this.operation() === OPERATION.CREATE) {
        this.createPost(this.preparePostFromInputs(this.inputs))
          .then(() => {
            this.savingDraftState = REQUEST_STATE.COMPLETED_OK;
          })
          .catch(e => {
            this.savingDraftState = REQUEST_STATE.COMPLETED_ERROR;
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
            this.savingDraftState = REQUEST_STATE.COMPLETED_OK;
          })
          .catch(e => {
            this.savingDraftState = REQUEST_STATE.COMPLETED_ERROR;
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
        this.publishPostState = REQUEST_STATE.PENDING;
        const newPost = {
          ...this.preparePostFromInputs(this.inputs),
          publishedAt: new Date(),
          status
        };
        this.createPost(newPost)
          .then(() => {
            this.publishPostState = REQUEST_STATE.COMPLETED_OK;
          })
          .catch(e => {
            this.publishPostState = REQUEST_STATE.COMPLETED_ERROR;
          });
      }
      if (this.operation() === "UPDATE") {
        this.publishPostState = REQUEST_STATE.PENDING;
        const post = {
          ...this.preparePostFromInputs(this.inputs),
          publishedAt: new Date(),
          status
        };
        this.updatePost(post)
          .then(() => {
            this.publishPostState = REQUEST_STATE.COMPLETED_OK;
          })
          .catch(e => {
            this.publishPostState = REQUEST_STATE.COMPLETED_ERROR;
          });
      }
    },
    onUnpublishPostClick() {
      this.unpublishPostState = REQUEST_STATE.PENDING;
      const post = {
        ...this.preparePostFromInputs(this.inputs),
        status: "DRAFT"
      };
      this.updatePost(post)
        .then(r => {
          this.unpublishPostState = REQUEST_STATE.COMPLETED_OK;
        })
        .cath(e => {
          this.unpublishPostState = REQUEST_STATE.COMPLETED_ERROR;
        });
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
.writeForm .ck-editor__editable p,
.writeForm .ck-editor__editable li,
.writeForm .ck-editor__editable a {
  font-size: 21px;
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
