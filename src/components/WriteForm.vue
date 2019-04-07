<template>
  <AdminLayout>
    <div class="writeForm">
      <div class="container">
        <form @submit.prevent>
          <textarea-autosize
            @keydown.enter.native.prevent="onEnter"
            autofocus
            rows="1"
            placeholder="Title"
            type="text"
            id="title"
            v-model="title"
          ></textarea-autosize>
          <ckeditor ref="ckeditor" :editor="editor" v-model="editorData" :config="editorConfig"></ckeditor>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/layouts/AdminLayout";
import CKEditor from "@ckeditor/ckeditor5-vue";
// import Editor from "@ckeditor/ckeditor5-build-classic";
// import Editor from "@ckeditor/ckeditor5-build-balloon";
import Editor from "@ckeditor/ckeditor5-build-balloon-block";

export default {
  components: {
    // Use the <ckeditor> component in this view.
    ckeditor: CKEditor.component,
    AdminLayout
  },
  data() {
    return {
      title: "",
      editorData: ""
    };
  },
  created() {
    this.editor = Editor;
    this.editorConfig = {
      toolbar: ["bold", "italic", "link"],
      blockToolbar: [
        "paragraph",
        "heading1",
        "heading2",
        "heading3",
        "|",
        "bulletedList",
        "numberedList",
        "|",
        "blockQuote",
        "imageUpload"
      ]
      // The configuration of the editor.
    };
  },
  methods: {
    onEnter() {
      this.$refs.ckeditor.$el.focus();
    }
  }
};
</script>

<style>
.writeForm form {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  max-width: 730px;
  margin: auto;
}

.writeForm textarea#title {
  background: transparent;
  font-family: serif;
  text-align: left;
  font-size: 40px;
  width: 100%;
  border: none !important;
  border-color: none;
  outline: none !important;
}

.writeForm .ck-editor__editable {
  padding: 0rem 2rem;
  background: transparent;
  text-align: left;
  min-height: 100vh;
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
}
</style>
