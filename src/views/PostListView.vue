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

    <AppError v-if="errorMessage">{{ errorMessage }}</AppError>
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
                {{ blog.name }} : {{ $t("views.postList.title") }}
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
                  <a>{{ $t("views.postList.publishedTab") }}</a>
                </li>
                <li
                  @click="onStatusClick('DRAFT')"
                  :class="{ 'is-active': activeStatus == 'DRAFT' }"
                >
                  <a>{{ $t("views.postList.draftTab") }}</a>
                </li>
              </ul>
            </div>

            <AppPanel style="border-top-left-radius:0;min-height:200px">
              <div class="container" style="border-top-left-radius:0;">
                <AppLoader v-show="postsRequestState === 'PENDING'" />
                <template
                  v-if="
                    postsRequestState === 'FINISHED_OK' &&
                      posts.edges.length === 0
                  "
                >
                  <div class="content section has-text-centered">
                    <p v-show="activeStatus === 'PUBLISHED'">
                      {{ $t("views.postList.noPublishedPostFound") }}
                    </p>
                    <p v-show="activeStatus === 'DRAFT'">
                      {{ $t("views.postList.noDraftPostFound") }}
                    </p>
                  </div>
                </template>
                <template
                  v-if="
                    postsRequestState === 'FINISHED_OK' &&
                      posts.edges.length > 0
                  "
                >
                  <AppList
                    :items="posts.edges"
                    :itemUniqueKey="item => item.node._id"
                  >
                    <template v-slot="{ item }">
                      <div class="columns">
                        <div class="column is-1">
                          <div
                            v-if="item.node.image"
                            v-lazy:background-image="item.node.image"
                            class="post-list-image"
                          />
                        </div>
                        <div
                          @click="onRowClick(item)"
                          class="column is-9 content"
                        >
                          <h2 class="post-list-title">
                            <router-link
                              class="item"
                              :to="{
                                name: 'postUpdate',
                                params: {
                                  blogId: $route.params.blogId,
                                  postId: item.node._id
                                }
                              }"
                              >{{ item.node.title + " " }}</router-link
                            >
                          </h2>
                          <span
                            style="color:rgba(0, 0, 0, 0.5);"
                            v-if="item.node.status === 'PUBLISHED'"
                          >
                            {{
                              $t("views.postList.publishedOn", {
                                date: moment(
                                  Number(item.node.publishedAt)
                                ).format("DD MMMM YYYY - HH:mm")
                              })
                            }}
                          </span>
                          <span
                            style="color:rgba(0, 0, 0, 0.5);"
                            v-if="item.node.status === 'DRAFT'"
                          >
                            {{
                              $t("views.postList.updatedOn", {
                                date: moment(
                                  Number(item.node.updatedAt)
                                ).format("DD MMMM YYYY - HH:mm")
                              })
                            }}
                          </span>

                          <p
                            style="padding-top:10px"
                            v-if="item.node.teaser.trim()"
                          >
                            {{ striptags(item.node.teaser.substr(0, 200)) }}
                          </p>
                        </div>
                        <div class="column is-2">
                          <div class="actions">
                            <!--
                            <div
                              @click="onUnpublishClick"
                              v-show="activeStatus === 'PUBLISHED'"
                              style="min-width:100px"
                              class="button is-outlined"
                            >Unpublish</div>
                            -->
                            <span
                              @click="onDeleteClick(item.node)"
                              style="min-width:100px"
                              class="button is-outlined"
                              >{{ $t("views.postList.deleteButton") }}</span
                            >
                          </div>
                        </div>
                      </div>
                    </template>
                  </AppList>
                </template>
                <!---->
              </div>
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
import { REQUEST_STATE } from "../utils/helpers";
import moment from "moment";
import {
  getPostsQuery,
  getPostsByStatusQuery,
  getBlogQuery,
  deletePostMutation
} from "../utils/queries";
import AppError from "../components/AppError";
import AppPanel from "../components/AppPanel";
import AppList from "../components/AppList";
import striptags from "striptags";
import logger from "../utils/logger";
import BulmaModal from "../components/BulmaModal";

export default {
  components: {
    AppLoader,
    AppError,
    AppPanel,
    AppList,
    BulmaModal,
    IconBack,
    DefaultLayout
  },
  data() {
    return {
      errorMessage: null,
      initDataState: REQUEST_STATE.NOT_STARTED,
      postsRequestState: REQUEST_STATE.NOT_STARTED,
      deletePostRequestState: REQUEST_STATE.NOT_STARTED,
      deleteModal: {
        show: false,
        title: null,
        data: null,
        post: null
      },
      blog: null,
      posts: null,
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
        this.getPosts(this.activeStatus),
        this.getAllPosts()
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
      this.errorMessage = null;
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
          this.errorMessage = "Sorry, an error occured while fetching posts";
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
          this.errorMessage = "Sorry, an error occured while fetching posts";
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
          return this.getPosts(this.activeStatus, "network-only");
        })
        .then(r => {
          this.deleteModal.show = false;
        })
        .catch(error => {
          this.deletePostRequestState = REQUEST_STATE.FINISHED_ERROR;
          this.errorMessage = "Sorry an error occured while deleting post";
          this.deleteModal.show = false;
          throw new Error(error);
        });
    },
    onStatusClick(status) {
      this.activeStatus = status;
      this.getPosts(status);
    },
    onDeleteClick(post) {
      this.deleteModal.post = post;
      this.deleteModal.show = true;
      this.deleteModal.title = this.$t("views.postList.deleteModal.title", {
        postTitle: post.title
      });
    },
    onUnpublishClick(status) {
      alert("unpublish");
    },
    onDeleteModalConfirmClick() {
      this.deletePost(this.deleteModal.post).then(r => {
        this.deleteModal.show = false;
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

.post-list-image {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  margin: auto;
  margin-top: 5px;
  width: 90px;
  height: 90px;
  overflow: hidden;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 3px 3px 5px rgba(229, 229, 229, 1);
}
.post-list-title {
  margin-bottom: 0;
  padding: 0;
}

@media screen and (min-width: 1024px) {
  .actions .button {
    margin-bottom: 15px;
  }
}

@media screen and (max-width: 768px) {
  .actions {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
  .actions .button {
    margin-left: 20px;
  }
  .main-call-to-action {
    margin-top: 0px;
    float: none;
  }
}
</style>
