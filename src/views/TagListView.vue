<template>
  <DefaultLayout>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <AppBreadcrumb
        image="/images/books.png"
        :routerOptions="{
          name: 'blogSettings',
          params: {
            blogId: $route.params.blogId,
            blogSetId: $route.params.blogSetId,
          },
        }"
        :name="$t('views.tagList.backToBlogLink')"
      />
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

    <AppLoader v-if="fetchDataRequestState === 'PENDING'" />

    <div
      v-if="fetchDataRequestState === 'FINISHED_OK'"
      class="bg-white max-w-1000 mx-auto shadow rounded-xl my-12 p-10"
    >
      <div class="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 class="text-xl md:text-2xl font-bold uppercase text-primary">
            TAGS -
            <span class="text-indigo-500">{{ viewData.blog.name }}</span>
          </h1>
        </div>
        <div class="mt-5 md:mt-0 flex md:flex-row md:justify-end items-center">
          <AppButton @click="onCreateTagClick" color="primary">
            CREATE TAG
          </AppButton>
        </div>
      </div>

      <TagList :tags="viewData.tags" @tagDeleted="onTagDeleted" />

      <!--
 
        <div class="flex flex-col md:flex-row justify-between">
          <div class="flex-1 flex items-center mb-8 md:mb-0">
            <h1 class="text-2xl md:text-4xl font-bold uppercase">
              <img class="w-10 h-10 mr-4 inline" src="/images/book.png" />
              {{ viewData.blog.name }}
            </h1>
          </div>
          <div class="flex flex-col md:flex-row items-center">
            <AppButton
              v-if="!isFirstPost"
              color="primary"
              @click="onWriteNewPostClick"
            >
              {{ $t("views.tagList.writeNewPostButton").toUpperCase() }}
            </AppButton>
          </div>
        </div>
        -->
    </div>
  </DefaultLayout>
</template>

<script>
import AppBreadcrumb from "@/ui-kit/AppBreadcrumb";
import AppButton from "@/ui-kit/AppButton";
import AppLoader from "@/ui-kit/AppLoader";
import apolloClient from "@/utils/apolloClient";
import DefaultLayout from "@/layouts/DefaultLayout";
import gql from "graphql-tag";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import striptags from "striptags";
import TagList from "@/components/TagList";

export default {
  components: {
    AppBreadcrumb,
    AppButton,
    AppLoader,
    DefaultLayout,
    TagList,
  },
  data() {
    return {
      viewData: null,
      fetchDataRequestState: REQUEST_STATE.NOT_STARTED,
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
      viewData();
    },
  },
  methods: {
    fetchData() {
      this.fetchDataRequestState = REQUEST_STATE.PENDING;
      viewDataQuery({
        blogSetId: this.$route.params.blogSetId,
        blogId: this.$route.params.blogId,
      })
        .then(result => {
          this.viewData = result.data;
          this.fetchDataRequestState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.fetchDataRequestState = REQUEST_STATE.FINISHED_ERROR;
          toast(this, error, "error");
          throw new Error(error);
        });
    },
    onCreateTagClick() {
      this.$router.push({
        name: "tagCreate",
        params: {
          blogId: this.$route.params.blogId,
          blogSetId: this.$route.params.blogSetId,
        },
      });
    },
    onTagDeleted() {
      this.fetchData();
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
      query blogTagsQuery($blogId: ID!) {
        blog(_id: $blogId) {
          _id
          name
          deletedAt
        }
        tags(blog: $blogId) {
          edges {
            node {
              _id
              name
              slug
              description
              color
              image
            }
          }
        }
      }
    `,
  });
}
</script>
