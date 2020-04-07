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
        <header class="container" style="padding: 2rem 1rem">
          <div class="blog-title columns">
            <div class="column">
              <img class="is-hidden-mobile" src="/images/book.png" />
              <h1 class="title is-2 is-uppercase">{{ blog.name }}</h1>
            </div>
            <div class="column column-right">
              <button
                class="button is-box-shadowed is-large"
                @click="
                  $router.push({
                    name: 'blogSettings',
                    params: { blogId: $route.params.blogId }
                  })
                "
              >
                <span class="settings-icon"></span>
                <span>{{
                  $t("views.blogList.settingsButton").toUpperCase()
                }}</span>
              </button>
              <button
                class="button is-large is-outline is-primary"
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
            <AppPanel :class="{ 'is-first': isFirstPost }">
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
            <div class="tabs is-boxed is-medium">
              <ul>
                <li
                  @click="onStatusClick('PUBLISHED')"
                  :class="{ 'is-active': activeStatus == 'PUBLISHED' }"
                >
                  <a>
                    {{ $t("views.postList.publishedTab") }}
                    <span style="margin-left:10px" class="tag is-rounded">
                      {{ postsPublished.totalCount }}
                    </span>
                  </a>
                </li>
                <li
                  @click="onStatusClick('DRAFT')"
                  :class="{ 'is-active': activeStatus == 'DRAFT' }"
                >
                  <a>
                    {{ $t("views.postList.draftTab") }}
                    <span style="margin-left:10px" class="tag is-rounded">
                      {{ postsDraft.totalCount }}
                    </span>
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
    <BulmaModal
      v-model="paymentSuccessModal.show"
    >
      <template #title>
        <div class="has-text-centered">
          {{ $t("views.postList.paymentSuccess") }}
        </div>
      </template>
      <template #body>
        <div class="has-text-centered">
          <img
            style="border-radius:5px"
            src="https://camo.githubusercontent.com/581d9802c9e5716113238cc2fcaf938bf2dad338/68747470733a2f2f6d656469612e67697068792e636f6d2f6d656469612f6248757134736355373255496f2f67697068792e676966"
          />
        </div>
      </template>
      <template class="has-text-centered" #footer>
        <button
          @click="paymentSuccessModal.show = false"
          class="button is-primary is-large"
        >
          {{ $t("global.okayButton") }}
        </button>
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
import { REQUEST_STATE, toast, getSubscription } from "../utils/helpers";
import {
  getPostsQuery,
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
      paymentSuccessModal: {
        show: false
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
    this.striptags = striptags;
    if (this.$route.query.status === "success") {
      this.paymentSuccessModal.show = true;
    }
  },
  mounted() {
    this.initData();
  },
  watch: {
    $route: function(value) {
      this.initData();
    }
  },
  beforeRouteEnter(to, from, next) {
    // if use is coming from a draft post, set "DRAFT" tab by default.
    next(vm => {
      if (from.name === "postUpdate" || from.name === "postCreate") {
        if (
          vm.$store.state.global.lastVisitedPost &&
          vm.$store.state.global.lastVisitedPost.status === "DRAFT"
        ) {
          vm.activeStatus = "DRAFT";
        }
      }
    });
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
          variables: {
            blog: this.$route.params.blogId,
            last: 1,
            status: ["PUBLISHED", "DRAFT"]
          }
        })
        .then(result => {
          this.isFirstPost =
            result.data.posts.edges.length === 0 ? true : false;
          return result;
        })
        .catch(error => {
          toast(this, "Sorry, an error occured while fetching posts", "error");
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
          getSubscription(this.blog.subscription).then(result => {
            console.log("SUBSCRIPTION", result, result.trialEnd > Math.floor(Date.now() / 1000));
          });
          return result;
        });
    },
    getPostsPublished() {
      this.postsPublishedRequestState = REQUEST_STATE.PENDING;
      return apolloClient
        .query({
          query: getPostsQuery,
          variables: {
            blog: this.$route.params.blogId,
            status: ["PUBLISHED"]
          }
        })
        .then(result => {
          this.postsPublishedRequestState = REQUEST_STATE.FINISHED_OK;
          this.postsPublished = result.data.posts;
          return result;
        })
        .catch(error => {
          this.postsPublishedRequestState = REQUEST_STATE.FINISHED_ERROR;
          toast(this, "Sorry, an error occured while fetching posts", "error");
          throw new Error(error);
        });
    },
    getPostsDraft() {
      this.postsDraftRequestState = REQUEST_STATE.PENDING;
      return apolloClient
        .query({
          query: getPostsQuery,
          variables: {
            blog: this.$route.params.blogId,
            status: ["DRAFT"]
          }
        })
        .then(result => {
          this.postsDraftRequestState = REQUEST_STATE.FINISHED_OK;
          this.postsDraft = result.data.posts;
          return result;
        })
        .catch(error => {
          this.postsDraftRequestState = REQUEST_STATE.FINISHED_ERROR;
          toast(this, "Sorry, an error occured while fetching posts", "error");
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
          this.deletePostRequestState = REQUEST_STATE.FINISHED_OK;
          const post = result.data.deletePost;
        })
        .catch(error => {
          this.deletePostRequestState = REQUEST_STATE.FINISHED_ERROR;
          toast(this, "Sorry, an error occured while fetching posts", "error");
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
.app-panel:not(.is-first) {
  border-top: none;
}
.tabs {
  margin-bottom: 0;
}
#app .tabs li a {
  text-decoration: none;
}
.blog-title .column {
  display: flex;
  align-items: center;
}
.blog-title .column-right {
  justify-content: flex-end;
}
.blog-title img {
  height: 4rem;
  padding-right: 1rem;
}
.blog-title .column-right button {
  margin-left: 2rem;
}
.settings-icon {
  margin-right: 0.7rem;
  width: 30px;
  height: 30px;
  background: url("/images/icon-settings.svg") no-repeat;
}
</style>
