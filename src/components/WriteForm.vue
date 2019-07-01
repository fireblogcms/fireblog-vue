<template>
  <div class="writeForm">
    <div class="container">
      <div class="columns">
        <div class="column is-2 is-hidden-mobile"></div>
        <div class="column is-8">
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
            <ckeditor
              ref="ckeditor"
              :editor="editor"
              v-model="inputs.content_rendered"
              :config="editorConfig"
            ></ckeditor>

            <portal to="navbar-end">
              <span class="navbar-item">
                <input
                  @click="onCreateClick(post)"
                  class="button is-outlined is-info"
                  type="submit"
                  value="SAVE CHANGES"
                >
              </span>
              <span class="navbar-item">
                <button @click="onApiClick" class="button is-outlined is-info">
                  &nbsp;&nbsp;&nbsp;
                  <img src="/logo-graphql.svg">
                  API&nbsp;&nbsp;&nbsp;
                </button>
              </span>
            </portal>
          </form>
        </div>
        <div class="column is-2">
          <div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminLayout from "@/layouts/AdminLayout";
import podClient from "../lib/podClient";
// import Editor from "@ckeditor/ckeditor5-build-classic";
// import Editor from "@ckeditor/ckeditor5-build-balloon";
import Editor from "@ckeditor/ckeditor5-build-balloon-block";
import CKEditor from "@ckeditor/ckeditor5-vue";
import { getUser } from "@/lib/auth";

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

export default {
  components: {
    // Use the <ckeditor> component in this view.
    ckeditor: CKEditor.component,
    AdminLayout
  },
  data() {
    return {
      post: null,
      inputs: {
        title: "",
        content_rendered: ""
      }
    };
  },
  // "heading"
  // "mediaEmbed"
  created() {
    this.operation = "NEW";
    this.editor = Editor;
    this.editorConfig = {
      toolbar: ["bold", "italic", "link", "heading"],
      blockToolbar: ["imageUpload", "mediaEmbed"]
    };
    if (this.$route.params.postId) {
      this.getExistingPost().then(result => {
        this.post = result.post;
        this.inputs.title = result.post.title;
        this.inputs.content_rendered = result.post.content_rendered
          ? result.post.content_rendered
          : "";
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
      return podClient().request(
        `
        query ($_id: ID!) {
          post(_id: $_id) {
            _id
            title
            content_rendered
          }
        }
      `,
        { _id: this.$route.params.postId }
      );
    },
    onCreateClick(post) {
      if (post === null) {
        this.createPost();
      }
      if (post && post._id) {
        this.updatePost();
      }
    },
    updatePost() {
      return podClient().request(
        `
        mutation($updatePostInput: updatePostInput!) {
          updatePost(
            updatePostInput: $updatePostInput
          ) {
            title
            pod {name}
            content_rendered
          }
        }
      `,
        {
          updatePostInput: {
            _id: this.post._id,
            title: this.inputs.title,
            content_rendered: this.inputs.content_rendered
          }
        }
      );
    },
    createPost() {
      const pod_id = this.$route.params.podId;
      const user_id = getUser().sub;
      return podClient()
        .request(
          `
            mutation($postInput: PostInput!) {
              createPost(postInput: $postInput) {
                authors {
                  name
                  email
                }
                pod {
                  _id
                  name
                  description
                }
                title
                content_rendered
              }
            }
         `,
          {
            postInput: {
              pod: pod_id,
              authors: [user_id],
              title: this.inputs.title,
              content_rendered: this.inputs.content_rendered
            }
          }
        )
        .then(r => {
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
