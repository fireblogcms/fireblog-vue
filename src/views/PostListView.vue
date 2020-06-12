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
      <div class="container mx-auto my-10">
        <div class="flex flex-col md:flex-row justify-between">
          <div class="flex-1 flex items-center mb-8 md:mb-0">
            <h1 class="text-3xl md:text-5xl font-bold uppercase">
              <img class="w-16 h-16 mr-4 inline" src="/images/book.png" />
              {{ blog.name }}
            </h1>
          </div>
          <div class="flex flex-col md:flex-row items-center">
            <AppButton
              class="mb-4 md:mb-0 md:mr-4"
              @click="
                $router.push({
                  name: 'blogSettings',
                  params: { blogId: $route.params.blogId },
                })
              "
            >
              <img class="w-8 mr-2" src="/images/icon-settings.svg" />
              <span>
                {{ $t("views.blogList.settingsButton").toUpperCase() }}
              </span>
            </AppButton>
            <AppButton
              v-if="!isFirstPost"
              color="primary"
              @click="
                $router.push({
                  name: 'postCreate',
                  params: { blogId: $route.params.blogId },
                })
              "
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
            @click="
              $router.push({
                name: 'postCreate',
                params: { blogId: $route.params.blogId },
              })
            "
          >
            {{ $t("views.postList.firstPostWriteButton").toUpperCase() }}
          </AppButton>
        </div>
      </AppPanel>

      <template v-if="!isFirstPost">
        <ul class="container mx-auto flex">
          <li
            class="rounded-t-lg cursor-pointer relative"
            @click="onStatusClick('PUBLISHED')"
            :class="{
              'bg-white shadow-md': activeStatus == 'PUBLISHED',
            }"
          >
            <div class="flex items-center py-4 px-4 md:px-10 text-xl font-bold">
              <span>{{ $t("views.postList.publishedTab") }}</span>
              <div
                class="w-8 h-8 ml-4 flex items-center justify-center rounded-full bg-gray-100 text-sm"
              >
                {{ postsPublished.totalCount }}
              </div>
            </div>
            <div class="shadow-mask" v-show="activeStatus == 'PUBLISHED'" />
          </li>
          <li
            class="rounded-t-lg cursor-pointer relative"
            @click="onStatusClick('DRAFT')"
            :class="{ 'bg-white shadow-md': activeStatus == 'DRAFT' }"
          >
            <div class="flex items-center py-4 px-4 md:px-10 text-xl font-bold">
              <span>{{ $t("views.postList.draftTab") }}</span>
              <div
                class="w-8 h-8 ml-4 flex items-center justify-center rounded-full bg-gray-100 text-sm"
              >
                {{ postsDraft.totalCount }}
              </div>
            </div>
            <div class="shadow-mask" v-show="activeStatus == 'DRAFT'" />
          </li>
        </ul>

        <div
          class="container mx-auto mb-20 py-6 px-4 md:px-10 bg-white shadow-md rounded-lg"
        >
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

    <!-- DELETE POST MODAL -->
    <AppModal name="deletePostModal" v-if="deleteModal.post">
      <div class="text-4xl font-bold" slot="header">
        {{ deleteModal.title }}
      </div>
      <div class="flex flex-col items-center" slot="body">
        <p class="text-xl">
          {{
            $t("views.postList.deleteModal.content", {
              postTitle: deleteModal.post.title,
            })
          }}
        </p>
        <div
          class="flex flex-col md:flex-row items-center justify-center mt-10"
        >
          <AppButton class="mx-4" @click="closeDeletePostModal">
            {{ $t("global.cancel") }}
          </AppButton>
          <AppButton
            :loading="deletePostRequestState === 'PENDING'"
            class="mt-4 md:mt-0 mx-4"
            color="danger"
            @click="onDeleteModalConfirmClick"
          >
            {{ $t("views.postList.deleteModal.confirmButton") }}
          </AppButton>
        </div>
      </div>
    </AppModal>

    <!-- PAYMENT SUCCESS MODAL -->
    <AppModal name="paymentSuccessModal">
      <div class="text-4xl font-bold" slot="header">
        {{ $t("views.postList.paymentSuccess") }}
      </div>
      <div class="flex flex-col items-center" slot="body">
        <img
          class="h-64 mb-10 rounded"
          src="https://camo.githubusercontent.com/581d9802c9e5716113238cc2fcaf938bf2dad338/68747470733a2f2f6d656469612e67697068792e636f6d2f6d656469612f6248757134736355373255496f2f67697068792e676966"
        />
        <AppButton color="primary" @click="closePaymentSuccessModal">
          {{ $t("global.okayButton") }}
        </AppButton>
      </div>
    </AppModal>
  </DefaultLayout>
</template>

<script>
import AppBreadcrumb from "@/ui-kit/AppBreadcrumb";
import AppButton from "@/ui-kit/AppButton";
import AppLoader from "@/ui-kit/AppLoader";
import AppModal from "@/ui-kit/AppModal";
import AppPanel from "@/ui-kit/AppPanel";
import apolloClient from "@/utils/apolloClient";
import DefaultLayout from "@/layouts/DefaultLayout";
import gql from "graphql-tag";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import {
  getPostsQuery,
  getBlogQuery,
  deletePostMutation,
} from "@/utils/queries";
import striptags from "striptags";
import PostList from "@/components/PostList";

export default {
  components: {
    AppBreadcrumb,
    AppButton,
    AppLoader,
    AppModal,
    AppPanel,
    DefaultLayout,
    PostList,
  },
  data() {
    return {
      initDataState: REQUEST_STATE.NOT_STARTED,
      postsRequestState: REQUEST_STATE.NOT_STARTED,
      postsDraftRequestState: REQUEST_STATE.NOT_STARTED,
      postsPublishedRequestState: REQUEST_STATE.NOT_STARTED,
      deletePostRequestState: REQUEST_STATE.NOT_STARTED,
      deleteModal: {
        title: null,
        data: null,
        post: null,
      },
      blog: null,
      posts: null,
      postsPublished: null,
      postsDraft: null,
      activeStatus: "PUBLISHED",
      // will be true or false, once we have counted all existing posts
      isFirstPost: null,
    };
  },
  created() {
    this.striptags = striptags;
  },
  mounted() {
    this.initData();
  },
  watch: {
    $route: function(value) {
      this.initData();
    },
  },
  beforeRouteEnter(to, from, next) {
    // if use is coming from a draft post, set "DRAFT" tab by default.
    next((vm) => {
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
        this.getPostsDraft(),
      ])
        .then(() => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
        })
        .catch((error) => {
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
            status: ["PUBLISHED", "DRAFT"],
          },
        })
        .then((result) => {
          this.isFirstPost =
            result.data.posts.edges.length === 0 ? true : false;
          return result;
        })
        .catch((error) => {
          toast(this, "Sorry, an error occured while fetching posts", "error");
          throw new Error(error);
        });
    },
    getBlog() {
      return apolloClient
        .query({
          query: getBlogQuery,
          variables: {
            _id: this.$route.params.blogId,
          },
        })
        .then((result) => {
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
            status: ["PUBLISHED"],
          },
        })
        .then((result) => {
          this.postsPublishedRequestState = REQUEST_STATE.FINISHED_OK;
          this.postsPublished = result.data.posts;
          return result;
        })
        .catch((error) => {
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
            status: ["DRAFT"],
          },
        })
        .then((result) => {
          this.postsDraftRequestState = REQUEST_STATE.FINISHED_OK;
          this.postsDraft = result.data.posts;
          return result;
        })
        .catch((error) => {
          this.postsDraftRequestState = REQUEST_STATE.FINISHED_ERROR;
          toast(this, "Sorry, an error occured while fetching posts", "error");
          throw new Error(error);
        });
    },
    closeDeletePostModal() {
      this.$store.commit("modalShowing/close", "deletePostModal");
    },
    closePaymentSuccessModal() {
      this.$store.commit("modalShowing/close", "paymentSuccessModal");
    },
    deletePost(post) {
      this.deletePostRequestState = REQUEST_STATE.PENDING;
      return apolloClient
        .mutate({
          mutation: deletePostMutation,
          variables: { id: post._id },
        })
        .then(async (result) => {
          this.deletePostRequestState = REQUEST_STATE.FINISHED_OK;
          const post = result.data.deletePost;
        })
        .catch((error) => {
          this.deletePostRequestState = REQUEST_STATE.FINISHED_ERROR;
          toast(this, "Sorry, an error occured while fetching posts", "error");
          this.closeDeletePostModal();
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
      this.deleteModal.title = this.$t("views.postList.deleteModal.title", {
        postTitle: post.title,
      });
      this.$store.commit("modalShowing/open", "deletePostModal");
    },
    onDeleteModalConfirmClick() {
      this.deletePost(this.deleteModal.post).then(() => {
        this.closeDeletePostModal();
        if (this.deleteModal.post.status === "PUBLISHED") {
          this.getPostsPublished();
        }
        if (this.deleteModal.post.status === "DRAFT") {
          this.getPostsDraft();
        }
      });
    },
  },
};
</script>

<style scoped>
.shadow-mask {
  width: 100%;
  position: absolute;
  bottom: -10px;
  height: 10px;
  display: block;
  background-color: white;
}
</style>
