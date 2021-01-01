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
        :name="$t('views.TagList.backToBlogLink')"
      />
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

    <AppLoader v-if="viewDataLoading" />
    <!-- -->
    <template v-if="!viewDataLoading">
      <div class="bg-white max-w-1000 mx-auto shadow rounded-xl my-12 p-10">
        <div
          class="flex flex-col md:flex-row justify-between items-center mb-6"
        >
          <div>
            <h1 class="text-xl md:text-2xl font-bold uppercase text-primary">
              TAGS -
              <span class="text-indigo-500">{{ viewData.blog.name }}</span>
            </h1>
          </div>
          <div
            class="mt-5 md:mt-0 flex md:flex-row md:justify-end items-center"
          >
            <AppButton @click="onCreateTagClick" color="primary"
              >CREATE TAG</AppButton
            >
            <!-- no buttons here for now -->
          </div>
        </div>
        <TagList @onDeleteClick="onDeleteClick" :tags="viewData.tags" />
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
    </template>

    <!-- DELETE POST MODAL -->
    <AppModal name="deleteTagModal" v-if="deleteModal.tag">
      <div class="text-4xl font-bold" slot="header">
        {{ deleteModal.title }}
      </div>
      <div class="flex flex-col items-center" slot="body">
        <p class="text-xl">
          {{
            $t("views.tagList.deleteModal.content", {
              tagName: deleteModal.tag.name,
            })
          }}
        </p>
        <div
          class="flex flex-col md:flex-row items-center justify-center mt-10"
        >
          <AppButton class="mx-4" @click="closeDeleteTagModal">
            {{ $t("global.cancel") }}
          </AppButton>
          <AppButton
            :loading="deleteTagRequestState === 'PENDING'"
            class="mt-4 md:mt-0 mx-4"
            color="danger"
            @click="onDeleteModalConfirmClick"
          >
            {{ $t("views.TagList.deleteModal.confirmButton") }}
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
import apolloClient from "@/utils/apolloClient";
import DefaultLayout from "@/layouts/DefaultLayout";
import gql from "graphql-tag";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import {
  getPostsQuery,
  getBlogQuery,
  deleteTagMutation,
} from "@/utils/queries";
import striptags from "striptags";
import TagList from "@/components/TagList";

export default {
  components: {
    AppBreadcrumb,
    AppButton,
    AppLoader,
    AppModal,
    DefaultLayout,
    TagList,
  },
  data() {
    return {
      viewData: null,
      viewDataLoading: false,
      deleteTagRequestState: REQUEST_STATE.NOT_STARTED,
      deleteModal: {
        title: null,
        data: null,
        tag: null,
      },
    };
  },
  created() {
    this.striptags = striptags;
  },
  mounted() {
    this.viewDataLoading = true;
    this.fetchData();
  },
  watch: {
    $route: function(value) {
      viewData();
    },
  },
  methods: {
    fetchData() {
      this.viewDataLoading = true;
      viewDataQuery({
        blogSetId: this.$route.params.blogSetId,
        blogId: this.$route.params.blogId,
      })
        .then(result => {
          this.viewData = result.data;
          this.viewDataLoading = false;
        })
        .catch(error => {
          this.viewDataLoading = false;
          throw new Error(error);
        });
    },
    closeDeleteTagModal() {
      this.$store.commit("modalShowing/close", "deleteTagModal");
    },
    deleteTag(tag) {
      this.deleteTagRequestState = REQUEST_STATE.PENDING;
      return apolloClient
        .mutate({
          mutation: deleteTagMutation,
          variables: { id: tag._id },
        })
        .then(async result => {
          this.deleteTagRequestState = REQUEST_STATE.FINISHED_OK;
          const post = result.data.deleteTag;
        })
        .catch(error => {
          this.deleteTagRequestState = REQUEST_STATE.FINISHED_ERROR;
          toast(this, "Sorry, an error occured while fetching posts", "error");
          this.closeDeleteTagModal();
          throw new Error(error);
        });
    },
    onStatusClick(status) {
      this.activeStatus = status;
    },
    onDeleteClick(tag) {
      this.deleteModal.tag = tag;
      this.deleteModal.title = this.$t("views.tagList.deleteModal.title", {
        tagName: tag.name,
      });
      this.$store.commit("modalShowing/open", "deleteTagModal");
    },
    onDeleteModalConfirmClick() {
      this.deleteTag(this.deleteModal.tag).then(() => {
        this.closeDeleteTagModal();
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
    onCreateTagClick() {
      this.$router.push({
        name: "tagCreate",
        params: {
          blogId: this.$route.params.blogId,
          blogSetId: this.$route.params.blogSetId,
        },
      });
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
              slug
              name
              description
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
