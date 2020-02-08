<template>
  <div>
    <div class="content" id="editor" ref="editor" />
    <div id="word-count" />
  </div>
</template>

<script>
import Editor from "fireblog-ckeditor";
import ContentEditor from "./ContentEditor";
import { ckeditorS3UploadAdapterPlugin } from "../utils/ckeditorS3UploadAdapterPlugin";
import { REQUEST_STATE } from "../utils/helpers";
let editorInstance;

export default {
  props: {
    autosave: {
      type: Function,
      default: data => {
        return Promise.resolve(data);
      }
    }
  },
  mounted() {
    Editor.create(this.$refs.editor, {
      heading: {
        options: [
          {
            model: "paragraph",
            title: "Paragraph",
            class: "ck-heading_paragraph"
          },
          {
            model: "heading1",
            view: "h2",
            title: "Heading 2",
            class: "ck-heading_heading2"
          },
          {
            model: "heading3",
            view: "h3",
            title: "Heading 3",
            class: "ck-heading_heading3"
          },
          {
            model: "heading4",
            view: "h4",
            title: "Heading 4",
            class: "ck-heading_heading4"
          }
        ]
      },
      extraPlugins: [
        ckeditorS3UploadAdapterPlugin({
          blogId: this.$route.params.blogId,
          onRequestStateChange: ({ state, file }) => {}
        })
      ],
      autosave: {
        save: editor => {
          this.autosave(editor.getData());
        }
      }
    })
      .then(editor => {
        const wordCountPlugin = editor.plugins.get("WordCount");
        const wordCountWrapper = document.getElementById("word-count");
        wordCountWrapper.appendChild(wordCountPlugin.wordCountContainer);
        editorInstance = editor;
        // The "change" event is fired whenever a change is made in the editor.
        editorInstance.model.document.on("change:data", () => {
          this.$emit("change", editorInstance.getData());
          //console.log("change", editorInstance.getData());
        });
      })
      .catch(error => {
        console.error(error);
      });
  }
};
</script>

<style>
/**
 * Replace "P" paragraph icon to a "+" to add media
 */
button.ck-block-toolbar-button {
  background-image: url("/images/editor-button-plus.svg") !important;
  background-repeat: no-repeat !important;
  cursor: pointer !important;
}
button.ck-block-toolbar-button:hover {
  background-color: transparent;
}
.ck-block-toolbar-button svg {
  display: none;
}
.ck-block-toolbar-button .ck.ck-icon {
  font-size: 2em !important;
}
</style>
