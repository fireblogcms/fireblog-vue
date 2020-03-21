<template>
  <div>
    <div class="content is-medium" id="editor" ref="editor" />
  </div>
</template>

<script>
import Editor from "fireblog-ckeditor";
import { ckeditorS3UploadAdapterPlugin } from "../utils/ckeditorS3UploadAdapterPlugin";
import { REQUEST_STATE, ckeditorIframelyMediaProvider } from "../utils/helpers";
// import CKEditorInspector from "@ckeditor/ckeditor5-inspector";
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
  methods: {
    onClick() {
      const position = editorInstance.model.document.selection.getFirstPosition();
      const content = "<p>test</p>";
      const viewFragment = editorInstance.data.processor.toView(content);
      const modelFragment = editorInstance.data.toModel(viewFragment);
      editorInstance.model.insertContent(modelFragment, position);
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
      // CKEditorInspector.attach(editor);
      const element = document.querySelector(
        ".ck-block-toolbar-button .ck-tooltip__text"
      );
      const toolTip = "Add media";
      element.innerHTML = toolTip;
      element.innerText = toolTip;

      editor.setData(this.value);
      this.$emit("editorReady", editor);

      editor.model.document.on("change:data", (eventInfo, data) => {
        // Insert automatically a paragraph after an image or a block,
        // Otherwise redactors are stuck at the bottom of the page and
        // can't add a new line.
        //
        // No idea what i am doing, here, i mainly copy-pasted this code:
        // https://github.com/ckeditor/ckeditor5/issues/1255#issuecomment-423499870
        // and made some little adjustements
        const changes = editor.model.document.differ.getChanges();
        editor.model.change((writer, data) => {
          for (const entry of changes) {
            // if an image, table, blockQuote or media is inserted.
            if (
              entry.type === "insert" &&
              ["image", "table", "blockQuote", "media"].includes(entry.name)
            ) {
              // Get last node of the doc
              const docNodes = entry.position.root._children._nodes;
              const lastDocNode = docNodes[docNodes.length - 1];
              // add a empty paragraph automatically if this the last node of the doc.
              if (lastDocNode.index === entry.position.index) {
                const position = entry.position.nodeAfter;
                const paragraph = writer.createElement("paragraph");
                writer.insert(paragraph, position, "after");
              }
            }
          }
        });
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
