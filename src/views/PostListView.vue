<template>
  <DefaultLayout>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <AppBreadcrumb
        image="/images/books.png"
        :routerOptions="{ name: 'blogSetList' }"
        :name="$t('views.postList.backToBlogLink')"
      />
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

    <AppLoader v-if="viewDataState === 'PENDING'" />

    <template v-if="viewDataState === 'FINISHED_OK'">
      <div class="container mx-auto my-10 px-2">
        <div class="flex flex-col md:flex-row justify-between">
          <div class="flex-1 flex items-top md:mb-0">
            <h1 class="text-xl md:text-2xl font-bold uppercase mb-4">
              {{ viewData.blog.name }}
            </h1>
          </div>
          <div
            class="flex flex-row-reverse justify-end md:flex-row md:justify-end items-center"
          >
            <AppButton
              class="mr-4"
              @click="
                $router.push({
                  name: 'blogSettings',
                  params: {
                    blogSetId: $route.params.blogSetId,
                    blogId: $route.params.blogId,
                  },
                })
              "
            >
              <!--
              <img
                class="w-8 hidden md:inline"
                src="/images/icon-settings.svg"
              />
              -->
              <span class="text-sm md:text-xl">
                {{ $t("views.blogList.settingsButton").toUpperCase() }}
              </span>
            </AppButton>
            <AppButton
              class="mr-4 md:mr-0"
              v-if="!isFirstPost"
              color="primary"
              @click="onWriteNewPostClick"
            >
              <span class="text-sm md:text-xl">
                {{ $t("views.postList.writeNewPostButton").toUpperCase() }}
              </span>
            </AppButton>
          </div>
        </div>
      </div>

      <AppPanel v-if="isFirstPost" class="mb-20 container mx-auto">
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
        <div class="container mx-auto px-2">
          <ul class="flex">
            <li
              class="rounded-t-lg cursor-pointer relative"
              @click="onStatusClick('PUBLISHED')"
              :class="{
                'bg-white shadow': activeStatus == 'PUBLISHED',
              }"
            >
              <div class="flex items-center py-4 px-4 md:px-10 text-xl">
                <span>{{ $t("views.postList.publishedTab") }}</span>
                <div
                  class="w-8 h-8 ml-4 flex items-center justify-center rounded-full bg-gray-100 text-sm"
                >
                  {{ viewData.postsPublished.totalCount }}
                </div>
              </div>
              <div class="shadow-mask" v-show="activeStatus == 'PUBLISHED'" />
            </li>
            <li
              class="rounded-t-lg cursor-pointer relative"
              @click="onStatusClick('DRAFT')"
              :class="{ 'bg-white shadow': activeStatus == 'DRAFT' }"
            >
              <div class="flex items-center py-4 px-4 md:px-10 text-xl">
                <span>{{ $t("views.postList.draftTab") }}</span>
                <div
                  class="w-8 h-8 ml-4 flex items-center justify-center rounded-full bg-gray-100 text-sm"
                >
                  {{ viewData.postsDraft.totalCount }}
                </div>
              </div>
              <div class="shadow-mask" v-show="activeStatus == 'DRAFT'" />
            </li>
          </ul>

          <div
            class="container mx-auto mb-20 py-6 px-4 md:px-10 bg-white shadow rounded-lg"
          >
            <PostList
              @onDeleteClick="onDeleteClick"
              v-show="activeStatus === 'PUBLISHED'"
              :posts="viewData.postsPublished"
            />
            <PostList
              @onDeleteClick="onDeleteClick"
              v-show="activeStatus === 'DRAFT'"
              :posts="viewData.postsDraft"
            />
          </div>
        </div>
      </template>
    </template>

    <!-- DELETE POST MODAL -->
    <AppModal name="deletePostModal" v-if="deleteModal.post">
      <div class="text-2xl font-bold" slot="header">
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
      viewData: null,
      viewDataState: "NOT_STARTED",
      deletePostRequestState: REQUEST_STATE.NOT_STARTED,
      deleteModal: {
        title: null,
        data: null,
        post: null,
      },
      activeStatus: "PUBLISHED",
      // will be true or false, once we have counted all existing posts
      isFirstPost: null,
    };
  },
  created() {
    this.striptags = striptags;
  },
  mounted() {
    this.fetchData();
  },
  watch: {
    $route: function(value) {
      this.fetchData();
    },
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
    fetchData() {
      this.viewDataState = "PENDING";
      viewDataQuery({
        blogSetId: this.$route.params.blogSetId,
        blogId: this.$route.params.blogId,
      })
        .then(r => {
          this.viewData = r.data;
          this.isFirstPost =
            this.viewData.allPosts.totalCount === 0 ? true : false;
          this.viewDataState = "FINISHED_OK";
        })
        .catch(error => {
          this.viewDataState = "FINISHED_ERROR";
          throw new Error(error);
        });
    },
    /**
     * We need to run two requests, to know what user has to see;
     * - All existing post (is this user first post ?)
     * - All published post (displayed in the "published" tab)
     * We will display a loader until this two requests are finished
     */
    closeDeletePostModal() {
      this.$store.commit("modalShowing/close", "deletePostModal");
    },
    deletePost(post) {
      this.deletePostRequestState = REQUEST_STATE.PENDING;
      return apolloClient
        .mutate({
          mutation: deletePostMutation,
          variables: { id: post._id },
        })
        .then(async result => {
          this.deletePostRequestState = REQUEST_STATE.FINISHED_OK;
          const post = result.data.deletePost;
        })
        .catch(error => {
          this.deletePostRequestState = REQUEST_STATE.FINISHED_ERROR;
          toast(this, "Sorry, an error occured while fetching posts", "error");
          this.closeDeletePostModal();
          throw new Error(error);
        });
    },
    onStatusClick(status) {
      this.activeStatus = status;
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
        this.fetchData();
      });
    },
    onWriteNewPostClick() {
      if (
        this.viewData.blogSet.subscription.status === "TRIAL" ||
        this.viewData.blogSet.subscription.status === "ACTIVE"
      ) {
        this.$router.push({
          name: "postCreate",
          params: {
            blogId: this.$route.params.blogId,
            blogSetId: this.$route.params.blogSetId,
          },
        });
      } else {
        this.$store.commit("modalShowing/open", "freeTrialEndedModal");
      }
    },
  },
};

function viewDataQuery({ blogSetId, blogId }) {
  return apolloClient.query({
    variables: {
      blogSetId,
      blogId,
    },
    query: gql`
      query postListViewQuery($blogSetId: ID!, $blogId: ID!) {
        blogSet(_id: $blogSetId) {
          subscription {
            id
            planId
            trialEnd
            status
          }
        }
        blog(_id: $blogId) {
          _id
          name
          image {
            url
          }
          deletedAt
        }
        allPosts: posts(blog: $blogId, filter: { status: [PUBLISHED, DRAFT] }) {
          totalCount
          edges {
            node {
              _id
              title
              teaser
              image
              wordCount
              readingTime
              status
              tags {
                name
              }
            }
          }
        }
        postsPublished: posts(blog: $blogId, filter: { status: PUBLISHED }) {
          totalCount
          edges {
            node {
              _id
              title
              teaser
              content
              image
              wordCount
              readingTime
              status
              tags {
                name
              }
              updatedAt
              publishedAt
            }
          }
        }
        postsDraft: posts(blog: $blogId, filter: { status: DRAFT }) {
          totalCount
          edges {
            node {
              _id
              title
              teaser
              content
              image
              wordCount
              readingTime
              status
              tags {
                name
              }
              updatedAt
            }
          }
        }
      }
    `,
  });
}
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
