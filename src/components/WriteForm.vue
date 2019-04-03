<template>
  <div class="writeForm">
    <div class="container">
      <form>
        <input autofocus placeholder="Title" type="text" id="title" v-model="title">
        <ckeditor :editor="editor" v-model="editorData" :config="editorConfig"></ckeditor>
      </form>
    </div>
  </div>
</template>

<script>
import CKEditor from "@ckeditor/ckeditor5-vue";
import Editor from "@ckeditor/ckeditor5-build-classic";
//import Editor from "@ckeditor/ckeditor5-build-balloon";

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
        // The configuration of the editor.
      }
    };
  }
};
</script>

<style>
.writeForm .ck-editor__editable {
  text-align: left;
  height: 100vh;
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
</style>
