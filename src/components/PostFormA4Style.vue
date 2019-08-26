<template>
  <div class="container">
    <div class="columns">
      <!--COLONNE GAUCHE-->
      <div class="column">
        <router-link
          style="margin-top:30px;border:0"
          id="back-button"
          class="button"
          :to="{name: 'postList', params:{blogId:$route.params.blogId}}"
        >
          <i style="padding-right:10px" class="fas fa-chevron-left"></i>
          Back
        </router-link>
      </div>
      <!--END COLONNE GAUCHE-->

      <!--COLONNE MILIEU-->
      <div class="column">
        <div class="writeForm">
          <AppNotify :errors="notifications.errors" />

          <template v-if="loadingPostState === REQUEST_STATE.PENDING">
            <AppLoader />
          </template>

          <form style="position:relative" @submit.prevent>
            <div style="position:absolute;right:40px;top:20px">
              <em v-if="lastTimeSaved">saved at {{ lastTimeSaved | moment("HH:mm:ss") }}</em>
            </div>
            <textarea-autosize
              @keydown.enter.native.prevent="onTitleEnter"
              autofocus
              rows="1"
              placeholder="Title"
              type="text"
              id="title"
              v-model="inputs.title"
            ></textarea-autosize>
            <ckeditor
              ref="ckeditor"
              :editor="editor"
              v-model="inputs.content"
              :config="editorConfig"
            ></ckeditor>
          </form>
        </div>
      </div>
      <!--END COLONNE MILIEU-->

      <!--COLONNE DROITE-->
      <div class="column column-actions">
        <div style="position:fixed" class="actions">
          <div>
            <input
              @click="onPublishPostClick()"
              v-if="!existingPost || existingPost.status.includes('DRAFT', 'BIN')"
              class="button item is-primary"
              :class="{ 'is-loading': publishPostState === REQUEST_STATE.PENDING }"
              type="submit"
              value="PUBLISH"
            />
          </div>

          <div v-if="existingPost && existingPost.status === 'PUBLISHED'">
            <input
              @click="onPublishPostClick()"
              class="button item is-primary"
              :class="{ 'is-loading': publishPostState === REQUEST_STATE.PENDING }"
              type="submit"
              value="PUBLISH CHANGES"
            />
          </div>

          <div v-if="!existingPost || (existingPost && existingPost.status === 'DRAFT')">
            <input
              @click="onSaveClick()"
              class="button is-outlined item"
              :class="{ 'is-loading': savingPostState === REQUEST_STATE.PENDING }"
              type="submit"
              value="SAVE DRAFT"
            />
          </div>

          <div v-if="existingPost && existingPost.status === 'PUBLISHED'">
            <input
              @click="onUnpublishPostClick()"
              class="button is-outlined item"
              type="submit"
              value="UNPUBLISH"
            />
          </div>

          <!--<ApiButton />-->
        </div>
      </div>
      <!--END COLONNE DROITE-->
    </div>
  </div>
</template>

<script>
import apolloClient from "../lib/apolloClient";
import AppLoader from "../components/AppLoader";
// import Editor from "@ckeditor/ckeditor5-build-classic";
// import Editor from "@ckeditor/ckeditor5-build-balloon";
import Editor from "@ckeditor/ckeditor5-build-balloon-block";
import CKEditor from "@ckeditor/ckeditor5-vue";
import { getLocalUser } from "@/lib/auth";
import gql from "graphql-tag";
import AppNotify from "./AppNotify";
import { REQUEST_STATE } from "../lib/helpers";
import { ckeditorUploadAdapterPlugin } from "../lib/ckeditorUploadAdapter";
//import ApiButton from "../components/ApiButton";

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
    //ApiButton
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
      toolbar: ["bold", "italic", "link", "heading", "blockQuote", "code"],
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
        post.author = getLocalUser().sub;
      }
      post.pod = this.$route.params.blogId;
      return apolloClient
        .mutate({
          mutation: createPostQuery,
          variables: { post }
        })
        .then(result => {
          apolloClient.resetStore();
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
      if (!this.inputs.title.trim()) {
        alert("A title is required");
        return;
      }
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
      if (!this.inputs.title.trim()) {
        alert("A title is required");
        return;
      }
      const status = "PUBLISHED";
      if (this.operation() === "CREATE") {
        const newPost = {
          ...this.preparePostFromInputs(this.inputs),
          publishedAt: new Date(),
          status
        };
        this.createPost(newPost);
      }
      if (this.operation() === "UPDATE") {
        const post = {
          ...this.preparePostFromInputs(this.inputs),
          publishedAt: new Date(),
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
  padding: 60px 50px;
  margin-top: 30px;
  margin-bottom: 60px;
  min-height: 100vh;
  width: 840px;
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
  line-height: 1.7;
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

.column-actions .button {
  margin-bottom: 10px;
  min-width: 130px;
}

#back-button {
  min-width: 130px;
}

.column-actions .actions {
  margin-top: 30px;
}
</style>
