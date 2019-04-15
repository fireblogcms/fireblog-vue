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
          <ckeditor
            class="content"
            ref="ckeditor"
            :editor="editor"
            v-model="editorData"
            :config="editorConfig"
          ></ckeditor>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/layouts/AdminLayout";
// import Editor from "@ckeditor/ckeditor5-build-classic";
// import Editor from "@ckeditor/ckeditor5-build-balloon";
import Editor from "@ckeditor/ckeditor5-build-balloon-block";
import CKEditor from "@ckeditor/ckeditor5-vue";

/* plugins :
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
      title: "",
      editorData: ""
    };
  },
  created() {
    this.editor = Editor;
    console.log(new Editor());
    this.editorConfig = {
      toolbar: ["bold", "italic", "link", "heading"],
      blockToolbar: ["imageUpload", "mediaEmbed"]
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
  font-family: "Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  max-width: 800px;
  margin: auto;
}

.writeForm textarea#title {
  background: transparent;
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
/*
.writeForm .ck-editor__editable p {
  font-size: 21px;
}

.writeForm .ck-editor__editable h1 {
  font-size: 41px;
}

.writeForm .ck-editor__editable h2 {
  font-size: 30px;
}

.writeForm .ck-editor__editable h3 {
  font-size: 21px;
}

.writeForm .ck-editor__editable h4 {
  font-size: 21px;
}

.writeForm .ck-editor__editable h5 {
  font-size: 21px;
}

.writeForm .ck-editor__editable h6 {
  font-size: 21px;
}
*/
</style>
