<template>
  <BareLayout>
    <AppLoader v-if="initDataState === 'PENDING'">Loading post</AppLoader>

    <AppError v-if="errorMessage">{{errorMessage}}</AppError>

    <template v-if="initDataState === 'FINISHED_OK'">
      <div style="max-width:900px" class="container section animated fadeIn">
        <div class="content">
          <h1>{{post.title}}</h1>
          <div v-html="this.post.content" class="content"></div>
        </div>
      </div>
    </template>
  </BareLayout>
</template>

<script>
import BareLayout from "@/layouts/BareLayout";
import apolloClient from "../utils/apolloClient";
import AppLoader from "../components/AppLoader";
import AppError from "../components/AppError";
import { REQUEST_STATE } from "../utils/helpers";
import gql from "graphql-tag";
import logger from "../utils/logger";

function linkRichPreviews(text) {
  var urlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
  return text.replace(urlRegex, function(url) {
    var iframeUrl = `//cdn.iframe.ly/api/iframe?app=1&api_key=${
      process.env.VUE_APP_IFRAMELY_API_KEY
    }&url=${encodeURIComponent(url)}`;
    // alternatively, use &key= instead of &api_key with the MD5 hash of your api_key
    // more about it: https://iframely.com/docs/allow-origins

    return (
      // If you need, set maxwidth and other styles for 'iframely-embed' class - it's yours to customize
      '<div class="iframely-embed">' +
      '<div class="iframely-responsive">' +
      +'<iframe src="' +
      iframeUrl +
      '" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
      "</iframe>" +
      "</div>" +
      "</div>"
    );
  });
  // or alternatively
  // return text.replace(urlRegex, '<a href="$1">$1</a>')
}

export default {
  components: {
    BareLayout,
    AppLoader,
    AppError
  },
  data() {
    return {
      initDataState: REQUEST_STATE.NOT_STARTED,
      errorMessage: null
    };
  },
  created() {
    this.initData();
  },

  methods: {
    initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      this.getPost(this.$route.params.postId)
        .then(result => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
          this.post = result.data.post;
          //this.post.content = linkRichPreviews(this.post.content);
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
