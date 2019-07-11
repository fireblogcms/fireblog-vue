<template>
  <div class="writeForm">
    <template v-if="loadingPostState === 'PENDING'">
      <PodLoader />
    </template>

    <div v-show="showNotifications" class="notification is-warning">
      <button class="delete" @click="showNotifications = false"></button>
      <template v-if="savingPostState === 'FINISHED_ERROR'">{{savingPostMessage}}</template>
      <template v-if="loadingPostState === 'FINISHED_ERROR'">{{loadingPostMessage}}</template>
    </div>

    <div>
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

        <portal to="topbar-right">
          <!-- status -->
          <div class="select item">
            <select>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="BIN">Bin</option>
            </select>
          </div>

          <input
            @click="onSaveClick(post)"
            class="button is-outlined item"
            :class="{'is-loading': savingPostState === 'PENDING'}"
            type="submit"
            value="SAVE"
          />

          <!--
              <span class="navbar-item">
                <button @click="onApiClick" class="button is-outlined is-info">
                  &nbsp;&nbsp;&nbsp;
                  <img src="/logo-graphql.svg" />
                  API&nbsp;&nbsp;&nbsp;
                </button>
              </span>
          -->
        </portal>
      </form>
    </div>
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

const createPostQuery = gql`
  mutation createPostQuery($post: CreatePostInput!) {
    createPost(post: $post) {
      author {
        name
        email
      }
      pod {
        _id
        name
        description
      }
      title
      content
    }
  }
`;

const updatePostQuery = gql`
  mutation updatePostQuery($post: UpdatePostInput!) {
    updatePost(post: $post) {
      title
    }
  }
`;

const getExistingPostQuery = gql`
  query getExistingPostQuery($_id: ID!) {
    post(_id: $_id) {
      _id
      title
      content
    }
  }
`;

export default {
  components: {
    // Use the <ckeditor> component in this view.
    ckeditor: CKEditor.component,
    AdminLayout,
    PodLoader,
    BulmaButton
  },
  data() {
    return {
      savingPostState: "NOT_STARTED",
      savingPostMessage: null,
      loadingPostState: "NOT_STARTED",
      loadingPostMessage: null,
      post: null,
      showNotifications: false,
      inputs: {
        title: "",
        content: ""
      }
    };
  },
  // "heading"
  // "mediaEmbed"

  created() {
    this.editor = Editor;
    this.editorConfig = {
      toolbar: ["bold", "italic", "link", "heading"],
      blockToolbar: ["imageUpload", "mediaEmbed"]
    };
    if (this.$route.params.postId) {
      this.loadingPostMessage = null;
      this.loadingPostState = "PENDING";
      this.getExistingPost()
        .then(result => {
          this.post = result.data.post;
          this.inputs.title = this.post.title;
          this.inputs.content = this.post.content ? this.post.content : "";
          this.loadingPostState = "FINISHED_OK";
        })
        .catch(e => {
          this.loadingPostMessage =
            "😞Sorry, loading post failed with this error message: " + e;
          this.loadingPostState = "FINISHED_ERROR";
          this.showNotifications = true;
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
      this.savingPostState = "PENDING";
      if (post === null) {
        this.createPost()
          .then(r => {
            this.savingPostState = "FINISHED_OK";
          })
          .catch(e => {
            this.savingPostState = "FINISHED_ERROR";
            this.savingPostMessage =
              "Sorry, post saving failed with th following message: " + e;
            this.showNotifications = true;
          });
      }
      if (post && post._id) {
        this.updatePost()
          .then(r => {
            this.savingPostState = "FINISHED_OK";
            apolloClient.clearStore();
          })
          .catch(e => {
            this.savingPostState = "FINISHED_ERROR";
            this.savingPostMessage =
              "Sorry, post saving failed with th following message: " + e;
            this.showNotifications = true;
          });
      }
    },
    updatePost() {
      const variables = {
        post: {
          _id: this.post._id,
          title: this.inputs.title,
          content: this.inputs.content
        }
      };
      return apolloClient.mutate({
        mutation: updatePostQuery,
        variables
      });
    },
    createPost() {
      const pod_id = this.$route.params.podId;
      const user_id = getUser().sub;
      return apolloClient
        .mutate({
          mutation: createPostQuery,
          variables: {
            post: {
              pod: pod_id,
              author: user_id,
              title: this.inputs.title,
              content: this.inputs.content
            }
          }
        })
        .then(r => {
          apolloClient.clearStore();
          console.log("r", r);
        });
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
