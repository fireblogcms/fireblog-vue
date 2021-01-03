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
      class="bg-white max-w-1000 mx-auto shadow rounded-xl my-12 p-10"
    >
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 class="text-xl md:text-2xl font-bold uppercase text-primary">
            {{ viewData.blog.name }}
          </h1>
        </div>
        <div class="mt-5 md:mt-0 flex md:flex-row md:justify-end items-center">
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
        <h2 class="text-center text-gray-800 text-2xl">
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
        <div>
          <img width="300" class="mx-auto" src="/images/woman-writing.png" />
        </div>
      </div>

      <template v-if="!isFirstPost">
        <div class="">
          <ul class="flex mt-10">
            <li
              class="cursor-pointer relative rounded-xl"
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
              class="cursor-pointer rounded-xl relative"
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
          <div class="my-10">
            <PostList
              :loading="getPostsState === 'PENDING'"
              @onPostDelete="onPostDelete"
              @onPostPublicationStatusChange="onPostPublicationStatusChange"
              :posts="posts"
              :context="{ activeStatus }"
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
  </DefaultLayout>
</template>

<script>
import AppBreadcrumb from "@/ui-kit/AppBreadcrumb";
import AppPagination from "@/ui-kit/AppPagination";
import AppButton from "@/ui-kit/AppButton";
import AppLoader from "@/ui-kit/AppLoader";
import apolloClient from "@/utils/apolloClient";
import DefaultLayout from "@/layouts/DefaultLayout";
import gql from "graphql-tag";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import { deletePostMutation } from "@/utils/queries";
import striptags from "striptags";
import PostList from "@/components/PostList";

const ITEMS_PER_PAGE = 30;

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
    onPostDelete() {
      this.initData();
    },
    onPostPublicationStatusChange() {
      this.initData();
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
            _id
            name
            color
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
