<template>
  <div class="root">
    <div class="content" ref="editor" id="editor"></div>
    <button class="button is-primary" @click="onSubmit" type="submit">
      Save
    </button>
    <footer class="footer">
      <div id="word-count"></div>
    </footer>
  </div>
</template>

<script>
import Editor from "fireblog-ckeditor";
import { ckeditorS3UploadAdapterPlugin } from "../utils/ckeditorS3UploadAdapterPlugin";
import {
  REQUEST_STATE,
  getUser,
  getBlog,
  createSlug,
  ckeditorIframelyMediaProvider,
  appNotification,
  validateSlug,
  resetAppNotifications
} from "../utils/helpers";

let editorInstance;
export default {
  mounted() {
    Editor.create(this.$refs.editor, {
      extraPlugins: [
        ckeditorS3UploadAdapterPlugin({
          blogId: this.$route.params.blogId,
          onRequestStateChange: ({ state, file }) => {
            if (state === REQUEST_STATE.PENDING) {
              this.mediaLoadingCounter = this.mediaLoadingCounter + 1;
            }
            if (
              state === REQUEST_STATE.FINISHED_OK ||
              state === REQUEST_STATE.FINISHED_ERROR
            ) {
              this.mediaLoadingCounter = this.mediaLoadingCounter - 1;
            }
            if (state === REQUEST_STATE.ABORTED) {
              this.mediaLoadingCounter = this.mediaLoadingCounter - 1;
            }
          }
        })
      ],
      autosave: {
        save(editor) {
          console.log("autosaving");
        }
      }
    })
      .then(editor => {
        const wordCountPlugin = editor.plugins.get("WordCount");
        const wordCountWrapper = document.getElementById("word-count");
        wordCountWrapper.appendChild(wordCountPlugin.wordCountContainer);
        editorInstance = editor;
      })
      .catch(error => {
        console.error(error);
      });
  },
  methods: {
    onSubmit() {
      const editorData = editorInstance.getData();
      console.log("editorData", editorData);
    }
  }
};
</script>

<style scoped>
.root {
  margin-top: 30px;
}
#editor {
  min-height: 100vh;
  max-width: 800px;
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.05);
  margin: auto;
}
</style>
