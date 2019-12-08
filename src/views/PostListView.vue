<template>
  <DefaultLayout>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <span class="item tag is-large">
        <router-link class="item" :to="{ name: 'blogList' }">
          <img
            class="is-hidden-mobile"
            style="position:relative;height:20px !important;top:4px;"
            src="/images/books.webp"
          />
          <IconBack />
          {{ $t("views.postList.backToBlogLink") }}
        </router-link>
      </span>
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

    <template v-if="initDataState === 'PENDING'">
      <AppLoader />
    </template>
    <template v-if="initDataState === 'FINISHED_OK'">
      <div>
        <header class="container" style="padding: 0 1rem 2rem 1rem">
          <div class="columns">
            <div class="column">
              <h1 class="title is-2 is-uppercase">
                <img
                  class="is-hidden-mobile"
                  style="height:70px !important;position:relative;top:20px;padding-right:1rem"
                  src="/images/book.png"
                />
                {{ blog.name }}
              </h1>
            </div>
            <div class="column is-4">
              <button
                class="button is-large is-primary main-call-to-action is-box-shadowed"
                v-if="!isFirstPost"
                @click="
                  $router.push({
                    name: 'postCreate',
                    params: { blogId: $route.params.blogId }
                  })
                "
              >
                {{ $t("views.postList.writeNewPostButton").toUpperCase() }}
              </button>
            </div>
          </div>
        </header>

        <template v-if="isFirstPost === true">
          <div class="container">
            <AppPanel>
              <h2 style="font-weight:200" class="title has-text-centered">
                {{ $t("views.postList.firstBlogSentence") }}
              </h2>
              <div class="has-text-centered">
                <div style="margin:2rem">
                  <button
                    class="button is-large is-primary is-box-shadowed"
                    @click="
                      $router.push({
                        name: 'postCreate',
                        params: { blogId: $route.params.blogId }
                      })
                    "
                  >
                    {{ $t("views.postList.firstPostWriteButton") }}
                  </button>
                </div>
              </div>
            </AppPanel>
          </div>
        </template>
        <template v-if="!isFirstPost">
          <section class="container">
            <div
              class="tabs is-boxed is-medium"
              style="position:relative;margin-bottom:0;"
            >
              <ul style="border-bottom:0">
                <li
                  @click="onStatusClick('PUBLISHED')"
                  :class="{ 'is-active': activeStatus == 'PUBLISHED' }"
                >
                  <a>
                    {{ $t("views.postList.publishedTab") }}
                    <span style="margin-left:10px" class="tag is-rounded">{{
                      postsPublished.totalCount
                    }}</span>
                  </a>
                </li>
                <li
                  @click="onStatusClick('DRAFT')"
                  :class="{ 'is-active': activeStatus == 'DRAFT' }"
                >
                  <a>
                    {{ $t("views.postList.draftTab") }}
                    <span style="margin-left:10px" class="tag is-rounded">{{
                      postsDraft.totalCount
                    }}</span>
                  </a>
                </li>
              </ul>
            </div>

            <AppPanel style="border-top-left-radius:0;min-height:200px">
              <PostListPane
                :postsRequestState="postsPublishedRequestState"
                @onDeleteClick="onDeleteClick"
                @onRowClick="onRowClick"
                v-show="activeStatus === 'PUBLISHED'"
                :posts="postsPublished"
              />
              <PostListPane
                @onDeleteClick="onDeleteClick"
                @onRowClick="onRowClick"
                :postsRequestState="postsDraftRequestState"
                v-show="activeStatus === 'DRAFT'"
                :posts="postsDraft"
              />
            </AppPanel>
          </section>
        </template>
      </div>
    </template>
    <BulmaModal v-if="deleteModal.show" v-model="deleteModal.show">
      <template #title>{{ deleteModal.title }}</template>
      <template #body>
        <div class="message is-danger">
          <div class="message-body">
            <p>
              {{
                $t("views.postList.deleteModal.content", {
                  postTitle: deleteModal.post.title
                })
              }}.
            </p>
          </div>
        </div>
      </template>
      <template #footer>
        <div @click="deleteModal.show = false" class="button is-primary">
          {{ $t("views.postList.deleteModal.cancelButton") }}
        </div>
        <div
          @click="onDeleteModalConfirmClick"
          class="button is-danger"
          :class="{ 'is-loading': deletePostRequestState === 'PENDING' }"
          :disabled="deletePostRequestState === 'PENDING' ? true : false"
        >
          {{ $t("views.postList.deleteModal.confirmButton") }}
        </div>
      </template>
    </BulmaModal>
  </DefaultLayout>
</template>

<script>
import apolloClient from "../utils/apolloClient";
import DefaultLayout from "../layouts/DefaultLayout";
import IconBack from "../components/IconBack";
import gql from "graphql-tag";
import AppLoader from "../components/AppLoader";
import { REQUEST_STATE, appNotification } from "../utils/helpers";
import moment from "moment";
import {
  getPostsQuery,
  getPostsByStatusQuery,
  getBlogQuery,
  deletePostMutation
} from "../utils/queries";
import AppPanel from "../components/AppPanel";
import striptags from "striptags";
import logger from "../utils/logger";
import BulmaModal from "../components/BulmaModal";
import PostListPane from "../components/PostListPane";

export default {
  components: {
    AppLoader,
    AppPanel,
    BulmaModal,
    IconBack,
    PostListPane,
    DefaultLayout
  },
  data() {
    return {
      initDataState: REQUEST_STATE.NOT_STARTED,
      postsRequestState: REQUEST_STATE.NOT_STARTED,
      postsDraftRequestState: REQUEST_STATE.NOT_STARTED,
      postsPublishedRequestState: REQUEST_STATE.NOT_STARTED,
      deletePostRequestState: REQUEST_STATE.NOT_STARTED,
      deleteModal: {
        show: false,
        title: null,
        data: null,
        post: null
      },
      blog: null,
      posts: null,
      postsPublished: null,
      postsDraft: null,
      activeStatus: "PUBLISHED",
      // will be true or false, once we have counted all existing posts
      isFirstPost: null
    };
  },
  created() {
    this.moment = moment;
    this.striptags = striptags;
    this.initData();
  },
  methods: {
    /**
     * We need to run two requests, to know what user has to see;
     * - All existing post (is this user first post ?)
     * - All published post (displayed in the "published" tab)
     * We will display a loader until this two requests are finished
     */
    initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      Promise.all([
        this.getBlog(),
        this.getAllPosts(),
        this.getPostsPublished(),
        this.getPostsDraft()
      ])
        .then(() => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          throw new Error(error);
        });
    },
    buildLinkToPost(item) {
      return {
        name: "postUpdate",
        params: { blogId: this.$route.params.blogId, postId: item.node._id }
      };
    },
    onRowClick(item) {
      this.$router.push(this.buildLinkToPost(item));
    },
    async getAllPosts() {
      return apolloClient
        .query({
          query: getPostsQuery,
          variables: { blog: this.$route.params.blogId, last: 1 }
        })
        .then(result => {
          this.isFirstPost =
            result.data.posts.edges.length === 0 ? true : false;
          return result;
        })
        .catch(error => {
          appNotification(
            "Sorry, an error occured while fetching posts",
            "error"
          );
          throw new Error(error);
        });
    },
    getBlog() {
      return apolloClient
        .query({
          query: getBlogQuery,
          variables: {
            _id: this.$route.params.blogId
          }
        })
        .then(result => {
          this.blog = result.data.blog;
          return result;
        });
    },
    getPosts(status, fetchPolicy = "cache-first") {
      this.postsRequestState = REQUEST_STATE.PENDING;
      return apolloClient
        .query({
          query: getPostsByStatusQuery,
          variables: {
            blog: this.$route.params.blogId,
            status: status
          },
          fetchPolicy
        })
        .then(result => {
          this.postsRequestState = REQUEST_STATE.FINISHED_OK;
          this.posts = result.data.posts;
          return result;
        })
        .catch(error => {
          this.postsRequestState = REQUEST_STATE.FINISHED_ERROR;
          appNotification("Sorry, an error occured while fetching posts");
          throw new Error(error);
        });
    },
    getPostsPublished(status, fetchPolicy = "cache-first") {
      this.postsPublishedRequestState = REQUEST_STATE.PENDING;
      return apolloClient
        .query({
          query: getPostsByStatusQuery,
          variables: {
            blog: this.$route.params.blogId,
            status: "PUBLISHED"
          },
          fetchPolicy
        })
        .then(result => {
          this.postsPublishedRequestState = REQUEST_STATE.FINISHED_OK;
          this.postsPublished = result.data.posts;
          console.log(this.postsPublished);
          return result;
        })
        .catch(error => {
          this.postsPublishedRequestState = REQUEST_STATE.FINISHED_ERROR;
          appNotification("Sorry, an error occured while fetching posts");
          throw new Error(error);
        });
    },
    getPostsDraft(status, fetchPolicy = "cache-first") {
      this.postsDraftRequestState = REQUEST_STATE.PENDING;
      return apolloClient
        .query({
          query: getPostsByStatusQuery,
          variables: {
            blog: this.$route.params.blogId,
            status: "DRAFT"
          },
          fetchPolicy
        })
        .then(result => {
          this.postsDraftRequestState = REQUEST_STATE.FINISHED_OK;
          this.postsDraft = result.data.posts;
          return result;
        })
        .catch(error => {
          this.postsDraftRequestState = REQUEST_STATE.FINISHED_ERROR;
          appNotification("Sorry, an error occured while fetching posts");
          throw new Error(error);
        });
    },
    deletePost(post) {
      this.deletePostRequestState = REQUEST_STATE.PENDING;
      return apolloClient
        .mutate({
          mutation: deletePostMutation,
          variables: { id: post._id }
        })
        .then(async result => {
          await apolloClient.resetStore();
          this.deletePostRequestState = REQUEST_STATE.FINISHED_OK;
          const post = result.data.deletePost;
        })
        .then(r => {
          this.deleteModal.show = false;
        })
        .catch(error => {
          this.deletePostRequestState = REQUEST_STATE.FINISHED_ERROR;
          appNotification(
            "Sorry, an error occured while fetching posts",
            "error"
          );
          this.deleteModal.show = false;
          throw new Error(error);
        });
    },
    onStatusClick(status) {
      this.activeStatus = status;
      if (status === "PUBLISHED") {
        this.getPostsPublished();
      }
      if (status === "DRAFT") {
        this.getPostsDraft();
      }
    },
    onDeleteClick(post) {
      this.deleteModal.post = post;
      this.deleteModal.show = true;
      this.deleteModal.title = this.$t("views.postList.deleteModal.title", {
        postTitle: post.title
      });
    },
    onDeleteModalConfirmClick() {
      this.deletePost(this.deleteModal.post).then(() => {
        this.deleteModal.show = false;
        if (this.deleteModal.post.status === "PUBLISHED") {
          this.getPostsPublished();
        }
        if (this.deleteModal.post.status === "DRAFT") {
          this.getPostsDraft();
        }
      });
    }
  }
};
</script>

<style scoped>
#app .tabs li a {
  text-decoration: none;
}

.main-call-to-action {
  float: right;
  margin-top: 30px;
}
</style>
