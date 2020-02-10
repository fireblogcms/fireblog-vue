<template>
  <div>
    <div class="content is-medium" id="editor" ref="editor" />
  </div>
</template>

<script>
import Editor from "fireblog-ckeditor";
import ContentEditor from "./ContentEditor";
import { ckeditorS3UploadAdapterPlugin } from "../utils/ckeditorS3UploadAdapterPlugin";
import { REQUEST_STATE, ckeditorIframelyMediaProvider } from "../utils/helpers";

export default {
  props: {
    value: {
      type: String,
      default: ""
    },
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
          return this.autosave(editor.getData());
        }
      },
      mediaEmbed: {
        previewsInData: false,
        providers: [ckeditorIframelyMediaProvider()]
      }
    }).then(editor => {
      const element = document.querySelector(
        ".ck-block-toolbar-button .ck-tooltip__text"
      );
      const toolTip = "Add media";
      element.innerHTML = toolTip;
      element.innerText = toolTip;

      editor.setData(this.value);
      this.$emit("editorReady", editor);

      editor.model.document.on("change:data", () => {
        this.$emit("change", editor.getData());
      });
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
