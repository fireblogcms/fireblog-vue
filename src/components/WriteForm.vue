<template>
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
</template>

<script>
import CKEditor from "@ckeditor/ckeditor5-vue";
// import Editor from "@ckeditor/ckeditor5-build-classic";
// import Editor from "@ckeditor/ckeditor5-build-balloon";
import Editor from "@ckeditor/ckeditor5-build-balloon-block";

export default {
  components: {
    // Use the <ckeditor> component in this view.
    ckeditor: CKEditor.component
  },
  data() {
    return {
      title: "",
      editor: Editor,
      editorData: "",
      editorConfig: {
        toolbar: ["bold"],
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
      }
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
.writeForm .form {
  max-width: 750px;
}

.writeForm input#title {
  font-family: serif;
}

.writeForm textarea#title {
  font-family: serif;
  text-align: left;
  font-size: 40px;
  width: 100%;
  border: none !important;
  border-color: none;
  outline: none !important;
}

.writeForm .ck-editor__editable {
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
  background-color: #ffffff;
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
