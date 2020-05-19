<template>
  <DefaultLayout>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <AppBreadcrumb
        image="/images/books.png"
        link="blogList"
        :name="$t('views.postList.backToBlogLink')"
      />
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

    <AppLoader v-if="initDataState === 'PENDING'" />

    <template v-if="initDataState === 'FINISHED_OK'">
      <div class="container my-10">
        <div class="flex items-center justify-between pb-6">
          <div class="flex items-center">
            <img
              class="w-16 h-16 mr-10"
              src="/images/book.png"
            />
            <h1 class="text-5xl font-bold uppercase">
              {{ blog.name }}
            </h1>
          </div>
          <div class="flex">
            <AppButton
              class="mr-4"
              @click="$router.push({
                name: 'blogSettings',
                params: { blogId: $route.params.blogId }
              })"
            >
              <img
                class="w-8 mr-2"
                src="/images/icon-settings.svg"
              />
              <span>
                {{ $t("views.blogList.settingsButton").toUpperCase() }}
              </span>
            </AppButton>
            <AppButton
              v-if="!isFirstPost"
              color="primary"
              @click="$router.push({
                name: 'postCreate',
                params: { blogId: $route.params.blogId }
              })"
            >
              {{ $t("views.postList.writeNewPostButton").toUpperCase() }}
            </AppButton>
          </div>
        </div>
      </div>

      <AppPanel v-if="isFirstPost" class="mb-20">
        <h2 class="text-center text-3xl font-bold">
          {{ $t("views.postList.firstBlogSentence") }}
        </h2>
        <div class="mt-8 flex justify-center">
          <AppButton
            color="primary"
            @click="$router.push({
              name: 'postCreate',
              params: { blogId: $route.params.blogId }
            })"
          >
            {{ $t("views.postList.firstPostWriteButton").toUpperCase() }}
          </AppButton>
        </div>
      </AppPanel>

      <template v-if="!isFirstPost">
        <ul class="container flex">
          <li
            class="py-4 px-10 flex items-center rounded-t-lg cursor-pointer text-xl font-bold"
            @click="onStatusClick('PUBLISHED')"
            :class="{ 'bg-white': activeStatus == 'PUBLISHED' }"
          >
            <span>{{ $t("views.postList.publishedTab") }}</span>
            <div class="w-8 h-8 ml-4 flex items-center justify-center rounded-full bg-gray-400 text-sm">
              {{ postsPublished.totalCount }}
            </div>
          </li>
          <li
            class="py-4 px-10 flex items-center rounded-t-lg cursor-pointer text-xl font-bold"
            @click="onStatusClick('DRAFT')"
            :class="{ 'bg-white': activeStatus == 'DRAFT' }"
          >
            <span>{{ $t("views.postList.draftTab") }}</span>
            <div class="w-8 h-8 ml-4 flex items-center justify-center rounded-full bg-gray-400 text-sm">
              {{ postsDraft.totalCount }}
            </div>
          </li>
        </ul>

        <div class="container mb-20 py-16 px-10 bg-white shadow-lg rounded-lg rounded-tl-none">
          <PostList
            :postsRequestState="postsPublishedRequestState"
            @onDeleteClick="onDeleteClick"
            v-show="activeStatus === 'PUBLISHED'"
            :posts="postsPublished"
          />
          <PostList
            @onDeleteClick="onDeleteClick"
            :postsRequestState="postsDraftRequestState"
            v-show="activeStatus === 'DRAFT'"
            :posts="postsDraft"
          />
        </div>
      </template>
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
import AppBreadcrumb from "@/ui-kit/AppBreadcrumb";
import AppButton from "@/ui-kit/AppButton";
import AppLoader from "@/ui-kit/AppLoader";
import AppPanel from "@/ui-kit/AppPanel";
import apolloClient from "@/utils/apolloClient";
import DefaultLayout from "@/layouts/DefaultLayout";
import gql from "graphql-tag";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import {
  getPostsQuery,
  getBlogQuery,
  deletePostMutation
} from "@/utils/queries";
import striptags from "striptags";
import BulmaModal from "@/components/BulmaModal";
import PostList from "@/components/PostList";

export default {
  components: {
    AppBreadcrumb,
    AppButton,
    AppLoader,
    AppPanel,
    BulmaModal,
    PostList,
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
