<template>
  <AdminLayout>
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
                v-model="inputs.content"
                :config="editorConfig"
              ></ckeditor>
              <input @click="onCreateClick" class="button is-primary" type="submit" value="save">
            </form>
          </div>
          <div class="column is-2">
            <div></div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/layouts/AdminLayout";
import podClient from "../lib/podClient";
// import Editor from "@ckeditor/ckeditor5-build-classic";
// import Editor from "@ckeditor/ckeditor5-build-balloon";
import Editor from "@ckeditor/ckeditor5-build-balloon-block";
import CKEditor from "@ckeditor/ckeditor5-vue";

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
  },
  methods: {
    onEnter() {
      this.$refs.ckeditor.$el.focus();
    },

    onCreateClick() {
      const auth0_user_id = this.$auth.getUser().sub;
      const pod_id = this.$route.params.podId;

      podClient
        .request(
          `
            mutation($postInput: PostInput!) {
              createPost(postInput: $postInput) {
                _id
                user_id
                pod_id
                title
                content
              }
            }
         `,
          {
            postInput: {
              pod_id: pod_id,
              auth0_user_id: auth0_user_id,
              title: this.inputs.title,
              content: this.inputs.content
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
