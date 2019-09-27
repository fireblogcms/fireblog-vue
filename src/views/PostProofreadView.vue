<template>
  <BareLayout>
    <AppLoader v-if="initDataState === 'PENDING'">Loading post</AppLoader>

    <AppError v-if="errorMessage">{{errorMessage}}</AppError>

    <template v-if="initDataState === 'FINISHED_OK'">
      <div style="max-width:900px" class="container section animated fadeIn">
        <div v-html="this.post.content" class="content"></div>
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
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          this.errorMessage = error;
        });
    },
    getPost(id) {
      return apolloClient.query({
        query: gql`
          {
            post(_id: "5d8dc8318480fd28a9cf02ae") {
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
