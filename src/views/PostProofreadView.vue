<template>
  <div class="postProofRead">
    <AppLoader v-if="initDataState === 'PENDING'">Loading post</AppLoader>

    <AppError v-if="errorMessage">{{ errorMessage }}</AppError>

    <template v-if="initDataState === 'FINISHED_OK'">
      <div style="max-width:900px" class="content container section">
        <h1 class="title is-1">{{ post.title }}</h1>
        <ckeditor
          :disabled="true"
          ref="ckeditor"
          :value="this.post.content"
          :editor="editor"
          :config="editorConfig"
        ></ckeditor>
      </div>
    </template>
  </div>
</template>

<script>
import apolloClient from "../utils/apolloClient";
import AppLoader from "../components/AppLoader";
import AppError from "../components/AppError";
import { REQUEST_STATE } from "../utils/helpers";
import gql from "graphql-tag";
import logger from "../utils/logger";
import Editor from "@ckeditor/ckeditor5-build-balloon-block";
import CKEditor from "@ckeditor/ckeditor5-vue";

export default {
  components: {
    AppLoader,
    AppError,
    ckeditor: CKEditor.component
  },
  data() {
    return {
      initDataState: REQUEST_STATE.NOT_STARTED,
      errorMessage: null,
      editorConfig: null,
      editor: null,
      post: {
        title: null,
        content: null
      }
    };
  },
  created() {
    this.editor = Editor;
    this.initData();
    // we use ckeditor to create rich links preview easily
    this.editorConfig = {
      mediaEmbed: {
        // Previews are always enabled if there’s a provider for a URL (below regex catches all URLs)
        // By default `previewsInData` are disabled, but let’s set it to `false` explicitely to be sure
        previewsInData: false,
        providers: [
          {
            // hint: this is just for previews. Get actual HTML codes by making API calls from your CMS
            name: "iframely previews",
            // Match all URLs or just the ones you need:
            url: /.+/,
            //url: new RegExp(richPreviewLinksAuthorizedDomains.join("|")),
            html: match => {
              const url = match[0];
              var iframeUrl = `//cdn.iframe.ly/api/iframe?app=1&api_key=${
                process.env.VUE_APP_IFRAMELY_API_KEY
              }&url=${encodeURIComponent(url)}`;
              // alternatively, use &key= instead of &api_key with the MD5 hash of your api_key
              // more about it: https://iframely.com/docs/allow-origins
              return (
                // If you need, set maxwidth and other styles for 'iframely-embed' class - it's yours to customize
                '<div class="iframely-embed">' +
                '<div class="iframely-responsive">' +
                "loading ..." +
                `<iframe src="${iframeUrl}" ` +
                'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
                "</iframe>" +
                "</div>" +
                "</div>"
              );
            }
          }
        ]
      }
    };
  },
  methods: {
    initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      this.getPost(this.$route.params.postId)
        .then(result => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
          this.post = result.data.post;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          this.errorMessage = error;
        });
    },
    getPost(id) {
      return apolloClient.query({
        variables: {
          id: id
        },
        query: gql`
          query postById($id: ID!) {
            post(_id: $id) {
              _id
              slug
              title
              content
              publishedAt
              author {
                name
                email
                picture
              }
            }
          }
        `
      });
    }
  }
};
</script>

<style scoped>
.content {
  background: white;
  padding: 4rem 4rem;
  box-shadow: 0 2px 4px 0 rgba(14, 30, 37, 0.12);
}
</style>
