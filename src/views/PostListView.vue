<template>
  <DefaultLayout>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <AppBreadcrumb
        :routerOptions="{ name: 'blogSetList' }"
        :name="$t('views.postList.backToBlogLink')"
      />
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

    <AppLoader v-if="viewDataState === 'PENDING'" />

    <div
      v-if="viewDataState === 'FINISHED_OK'"
      class="bg-white max-w-1000 mx-auto rounded-xl my-12 p-10"
    >
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="">
          <h1 class="text-xl md:text-2xl font-bold uppercase text-primary">
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

      <div v-if="isFirstPost" class="my-20">
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
      </div>

      <template v-if="!isFirstPost">
        <div class="">
          <ul class="flex mt-10">
            <li
              class="cursor-pointer relative rounded-2xl"
              @click="onStatusClick('PUBLISHED')"
              :class="{
                'bg-gray-200': activeStatus == 'PUBLISHED',
              }"
            >
              <div class="flex items-center py-2 px-4 text-xl">
                <span>{{ $t("views.postList.publishedTab") }}</span>
                <div
                  class="w-8 h-8 ml-4 flex items-center justify-center rounded-full bg-gray-100 text-sm"
                >
                  {{ viewData.allPublishedPostsCount }}
                </div>
              </div>
            </li>
            <li
              class="cursor-pointer rounded-2xl relative"
              @click="onStatusClick('DRAFT')"
              :class="{ 'bg-gray-200': activeStatus == 'DRAFT' }"
            >
              <div class="flex items-center py-2 px-4 text-xl">
                <span>{{ $t("views.postList.draftTab") }}</span>
                <div
                  class="w-8 h-8 ml-4 flex items-center justify-center rounded-full bg-gray-100 text-sm"
                >
                  {{ viewData.allDraftPostsCount }}
                </div>
              </div>
              <div class="shadow-mask" v-show="activeStatus == 'DRAFT'" />
            </li>
          </ul>
          <div class="mb-20 mt-5">
            <PostList
              :loading="getPostsState === 'PENDING'"
              @onDeleteClick="onDeleteClick"
              :posts="posts"
            />
            <div class="mt-10">
              <AppPagination
                routeName="postList"
                :itemsTotal="postsCount"
                :itemsPerPage="ITEMS_PER_PAGE"
              />
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- DELETE POST MODAL -->
    <AppModal width="md" name="deletePostModal" v-if="deleteModal.post">
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
import AppPagination from "@/ui-kit/AppPagination";
import AppButton from "@/ui-kit/AppButton";
import AppLoader from "@/ui-kit/AppLoader";
import AppModal from "@/ui-kit/AppModal";
import apolloClient from "@/utils/apolloClient";
import DefaultLayout from "@/layouts/DefaultLayout";
import gql from "graphql-tag";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import { deletePostMutation } from "@/utils/queries";
import striptags from "striptags";
import PostList from "@/components/PostList";

const ITEMS_PER_PAGE = 20;

// if no filters are specified in the url,
// use those default filters to fetch post
const getPostsDefaultVariables = () => {
  return {
    skip: 0,
    limit: ITEMS_PER_PAGE,
    sort: {
      publishedAt: "desc",
    },
    filter: {
      status: "PUBLISHED",
    },
  };
};

export default {
  components: {
    AppBreadcrumb,
    AppButton,
    AppLoader,
    AppModal,
    DefaultLayout,
    PostList,
    AppPagination,
  },
  data() {
    return {
      viewData: null,
      posts: [],
      postsCount: 0,
      viewDataState: REQUEST_STATE.NOT_STARTED,
      getPostsState: REQUEST_STATE.NOT_STARTED,
      deletePostRequestState: REQUEST_STATE.NOT_STARTED,
      deleteModal: {
        title: null,
        data: null,
        post: null,
      },
      activeStatus: this.getPostsQueryVariables().filter.status,
      // will be true or false, once we have counted all existing posts
      isFirstPost: null,
    };
  },
  created() {
    this.striptags = striptags;
    this.ITEMS_PER_PAGE = ITEMS_PER_PAGE;
  },
  mounted() {
    this.initData();
  },
  watch: {
    // update the view from params in urls
    $route: function(value) {
      const currentPage = this.$route.query.page ? this.$route.query.page : 1;
      const skip = (currentPage - 1) * ITEMS_PER_PAGE;
      this.activeStatus = this.getPostsQueryVariables().filter.status;
      this.getPosts({ ...this.getPostsQueryVariables(), skip });
    },
  },
  methods: {
    initData() {
      const result = Promise.all([
        this.getViewData(),
        this.getPosts(this.getPostsQueryVariables()),
      ]);
      return result;
    },
    getViewData() {
      this.viewDataState = REQUEST_STATE.PENDING;
      return viewDataQuery({
        blogSetId: this.$route.params.blogSetId,
        blogId: this.$route.params.blogId,
      })
        .then(response => {
          this.viewData = response.data;
          this.isFirstPost = response.data.allPostsCount === 0 ? true : false;
          this.viewDataState = REQUEST_STATE.FINISHED_OK;
          return response;
        })
        .catch(error => {
          this.viewDataState = REQUEST_STATE.FINISHED_ERROR;
          throw new Error(error);
        });
    },
    getPostsQueryVariables() {
      return {
        ...getPostsDefaultVariables(),
        ...this.getPostsUrlVariables(),
      };
    },
    getPostsUrlVariables() {
      return this.$route.query.getPosts
        ? JSON.parse(this.$route.query.getPosts)
        : {};
    },
    getPosts(variables) {
      variables.filter.blog = this.$route.params.blogId;
      if (variables.filter.status === "DRAFT") {
        variables.sort = { updatedAt: "desc" };
      }

      this.getPostsState = REQUEST_STATE.PENDING;
      return getPostsQuery(variables)
        .then(response => {
          this.posts = response.data.posts;
          this.postsCount = response.data.postsCount;
          this.getPostsState = REQUEST_STATE.FINISHED_OK;
          return response;
        })
        .catch(error => {
          this.getPostsState = REQUEST_STATE.FINISHED_ERROR;
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
      const query = {
        getPosts: JSON.stringify({ filter: { status } }),
        page: 1,
      };
      this.$router.push({
        path: this.$router.currentRoute.path,
        query,
      });
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
        this.initData();
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

function getPostsQuery({ filter, sort, limit, skip }) {
  return apolloClient.query({
    variables: {
      filter,
      sort,
      limit,
      skip,
    },
    query: gql`
      query getPostsQuery(
        $filter: PostsFilter!
        $sort: PostsSort!
        $limit: Int!
        $skip: Int!
      ) {
        postsCount(filter: $filter)
        posts(limit: $limit, skip: $skip, filter: $filter, sort: $sort) {
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
    `,
  });
}

function viewDataQuery({
  blogSetId,
  blogId,
  limit = ITEMS_PER_PAGE,
  skip = 0,
}) {
  return apolloClient.query({
    variables: {
      blogSetId,
      blogId,
      limit,
      skip,
    },
    query: gql`
      query viewDataQuery($blogSetId: ID!, $blogId: ID!) {
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
        allPostsCount: postsCount(
          filter: { blog: $blogId, status: [PUBLISHED, DRAFT] }
        )
        allDraftPostsCount: postsCount(filter: { blog: $blogId, status: DRAFT })
        allPublishedPostsCount: postsCount(
          filter: { blog: $blogId, status: PUBLISHED }
        )
      }
    `,
  });
}
</script>
