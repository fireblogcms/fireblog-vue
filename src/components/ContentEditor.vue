<template>
  <div id="editor" ref="editor" />
</template>

<script>
import Editor from "fireblog-ckeditor";
import { ckeditorS3UploadAdapterPlugin } from "@/utils/ckeditorS3UploadAdapterPlugin";
import { REQUEST_STATE, ckeditorIframelyMediaProvider } from "@/utils/helpers";
// import CKEditorInspector from "@ckeditor/ckeditor5-inspector";

export default {
  props: {
    value: {
      type: String,
      default: "",
    },
    autosave: {
      type: Function,
      default: data => {
        return Promise.resolve(data);
      },
    },
    onWordCountUpdate: {
      type: Function,
      default: data => {
        return Promise.resolve(data);
      },
    },
    // Possible values: create or update
    operation: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      changed: false,
    };
  },
  mounted() {
    Editor.create(this.$refs.editor, {
      codeBlock: {
        languages: [
          { language: "plaintext", label: "Plain text" }, // The default language.
          { language: "javascript", label: "JavaScript" },
          { language: "typescript", label: "TypeScript" },
          { language: "graphql", label: "GraphQL" },
          { language: "php", label: "PHP" },
          { language: "ruby", label: "Ruby" },
          { language: "python", label: "Python" },
          { language: "c", label: "C" },
          { language: "cs", label: "C#" },
          { language: "cpp", label: "C++" },
          { language: "css", label: "CSS" },
          { language: "xml", label: "HTML/XML" },
          { language: "java", label: "Java" },
        ],
      },
      heading: {
        options: [
          {
            model: "paragraph",
            title: "Paragraph",
            class: "ck-heading_paragraph",
          },
          {
            model: "heading1",
            view: "h2",
            title: "Heading 2",
            class: "ck-heading_heading2",
          },
          {
            model: "heading3",
            view: "h3",
            title: "Heading 3",
            class: "ck-heading_heading3",
          },
          {
            model: "heading4",
            view: "h4",
            title: "Heading 4",
            class: "ck-heading_heading4",
          },
        ],
      },
      extraPlugins: [
        ckeditorS3UploadAdapterPlugin({
          blogId: this.$route.params.podId,
          onRequestStateChange: ({ state, file }) => {},
        }),
      ],
      autosave: {
        save: editor => {
          if (this.operation === "create" && editor.getData().length === 0) {
            return;
          }
          if (this.changed) {
            return this.autosave();
          }
        },
      },
      wordCount: {
        onUpdate: stats => {
          this.onWordCountUpdate(stats);
        },
      },
      mediaEmbed: {
        previewsInData: false,
        providers: [ckeditorIframelyMediaProvider()],
      },
    }).then(editor => {
      // when we cant reach link for a preview
      iframely.on("cancel", function(url, parentNode) {
        parentNode.innerHTML = `
        <div class="broken-link bg-gray-100 p-8">
        🤷🏻‍♂️ Fireblog can't create automatically a rich preview for this link: ${url}. 
        Create manually a link instead.
        </div>`;
      });
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
        this.changed = true;
        this.$emit("change", editor.getData());
      });

      editor.model.document.registerPostFixer(writer => {
        // Insert automatically a paragraph after an image or a block,
        // Otherwise redactors are stuck at the bottom of the page and
        // can't add a new line.
        // @see https://github.com/ckeditor/ckeditor5/issues/407#issuecomment-602111695
        const changes = editor.model.document.differ.getChanges();
        editor.model.change(writer => {
          for (const entry of changes) {
            // if an image, table, blockQuote or media is inserted.
            if (
              entry.type === "insert" &&
              ["image", "table", "blockQuote", "media"].includes(entry.name)
            ) {
              const insertedElement = entry.position.nodeAfter;
              if (!insertedElement.nextSibling) {
                writer.insertElement("paragraph", insertedElement, "after");
                // According to the ckeditor doc,  we have to return true
                // if some changes have been made by our postFixer
                return true;
              }
            }
          }
        });
      });
    });
  },
};
</script>

<style>
#editor {
  min-height: 100vh;
  box-shadow: none;
  border: none !important;
  outline: none !important;
  padding: 0;
  font-size: 1.25rem;
  line-height: 32px;
}
#editor a {
  @apply text-blue-600;
  @apply underline;
}
#editor h1,
#editor h2,
#editor h3,
#editor h4 {
  font-weight: bold;
}
#editor h2 {
  font-size: 2.25rem;
  margin-top: 2.25rem;
  margin-bottom: 2rem;
}
#editor h3 {
  font-size: 1.875rem;
  margin-top: 2rem;
}
#editor h4 {
  font-size: 1.5rem;
  margin-top: 2rem;
}

#editor p,
#editor pre {
  margin: 1rem 0;
}
#editor ul {
  list-style: disc outside;
  margin: 1rem 0 1rem 2.5rem;
}
#editor ul ul {
  list-style-type: circle;
  margin: 1rem 0 0 2.5rem;
}
#editor ul ul ul {
  list-style-type: square;
}
#editor figure {
  margin: 2rem auto;
  max-width: 99%; /* make sur we see borders when figure is select */
}

#editor .ck-progress-bar {
  height: 4px !important;
}

#editor figure:not(:last-child) {
  margin-bottom: 2em;
}

/* Replace "P" paragraph icon to a "+" to add media */
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

.iframely-responsive {
  top: 0;
  left: 0;
  width: 100%;
  height: 0;
  position: relative;
  padding-bottom: 56.25%;
}
.iframely-responsive > * {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  border: 0;
}
</style>
