<template>
  <div class="min-h-10 flex flex-col">
    <div v-if="loading">
      <div
        class="px-8 py-4 md:py-6 border-b border-gray-200 last:border-b-0"
        v-for="(v, i) in new Array(5)"
        :key="i"
      >
        <ContentLoader class="md:hidden" :height="200">
          <rect x="0" y="0" rx="3" ry="3" width="25%" height="55%" />
          <rect x="32%" y="10" rx="3" ry="3" width="45%" height="40" />
          <rect x="32%" y="70" rx="3" ry="3" width="65%" height="15" />
          <rect x="35%" y="75%" rx="3" ry="3" width="30%" height="40" />
        </ContentLoader>
        <ContentLoader class="hidden md:block" :height="25">
          <rect x="0" y="0" rx="3" ry="3" width="15%" height="100%" />
          <rect x="70" y="2" rx="3" ry="3" width="20%" height="10" />
          <rect x="70" y="15" rx="3" ry="3" width="35%" height="5" />
          <rect x="90%" y="5" rx="3" ry="3" width="10%" height="14" />
        </ContentLoader>
      </div>
    </div>

    <div
      v-if="posts.length === 0"
      class="flex-1 flex items-center justify-center"
    >
      <p class="text">
        <img width="150" class="mx-auto" src="/images/desert.svg" />
        <span class="text-gray-600" v-if="context.activeStatus === 'PUBLISHED'">
          {{ $t("views.postList.noPublishedPostFound") }}
        </span>
        <span class="text-gray-600" v-if="context.activeStatus === 'DRAFT'">
          {{ $t("views.postList.noDraftPostFound") }}
        </span>
      </p>
    </div>

    <template v-if="!loading && posts.length > 0">
      <div
        class="md:py-3 flex flex-col md:flex-row cursor-pointer border-b border-gray-200 last:border-b-0"
        v-for="post in posts"
        :key="post._id"
        @click="
          $router.push({
            name: 'postUpdate',
            params: {
              blogSetId: $route.params.blogSetId,
              blogId: $route.params.blogId,
              postId: post._id,
            },
          })
        "
      >
        <div class="flex flex-1 flex-col md:flex-row">
          <div
            style="flex:0 0 200px"
            v-show="post.image"
            v-lazy:background-image="post.image"
            class="md:mr-5 mb-5 md:mb-0 rounded bg-center bg-no-repeat bg-cover"
          />
          <div class="flex flex-1 justify-between items-center">
            <div class="flex-1">
              <p class="text-xl md:text-2xl font-bold text-gray-800">
                {{ post.title }}
              </p>

              <p class="text-gray-700 mb-2">
                {{ teaser(post) }}
              </p>
              <p class="text-xs uppercase" v-if="post.status === 'DRAFT'">
                <span class="text-indigo-700">
                  {{
                    $t("views.postList.updatedOn", {
                      date: updatedOnDate(post),
                    })
                  }}
                </span>
                <span class="text-gray-600 ml-2"
                  >{{ $t("views.postList.readingTime") }} :{{
                    post.readingTime
                  }}
                  min
                </span>
              </p>
              <p
                class="text-xs uppercase text-indigo-600"
                v-if="post.status === 'PUBLISHED'"
              >
                <span class="text-indigo-700">
                  {{ publishedOnDate(post) }}</span
                >
                -
                <span class="text-gray-600">
                  {{ $t("views.postList.readingTime") }} :
                  {{ post.readingTime }} min
                </span>
              </p>

              <div class="mt-4">
                <TagBadgeList :tags="post.tags" />
              </div>
            </div>
            <div class="flex justify-end">
              <AppButton class="ml-3" size="sm" @click="onDeleteClick(post)">
                <span class="">
                  <img width="20" src="/images/icon-delete.svg" />
                </span>
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- DELETE POST MODAL -->
    <AppModal width="sm" name="deletePostModal" v-if="deleteModal.post">
      <div class="text-2xl font-bold" slot="header">
        {{ deleteModal.title }}
      </div>
      <div class="flex flex-col items-center" slot="body">
        <p
          class="text-xl"
          v-html="
            $t('views.postList.deleteModal.content', {
              postTitle: deleteModal.post.title,
            })
          "
        />

        <div class="flex items-center justify-center mt-10">
          <AppButton class="mr-2" @click="closeDeletePostModal">
            {{ $t("global.cancel").toUpperCase() }}
          </AppButton>
          <AppButton
            :loading="deletePostRequestState === 'PENDING'"
            color="danger"
            @click="onDeleteModalConfirmClick"
          >
            {{ $t("views.postList.deleteModal.confirmButton").toUpperCase() }}
          </AppButton>
        </div>
      </div>
    </AppModal>

    <!-- MORE ACTIONS MODAL
    <AppModal name="moreActionsModal" width="sm" v-if="moreActionsModal.post">
      <div class="text-2xl font-bold" slot="header">
        {{ moreActionsModal.post.title }}
      </div>
      <div slot="body">
        <div class="flex items-center w-full max-w-md mx-auto">
          <div class="rounded w-full py-4 uppercase">
            <AppButton
              buttonClass="text-center"
              :fullWidth="true"
              color="danger"
              @click="onDeleteClick(moreActionsModal.post)"
            >
              {{ $t("views.postList.deleteButton") }}
            </AppButton>

            <AppButton
              v-if="moreActionsModal.post.status === 'DRAFT'"
              class="mt-3"
              buttonClass="text-center"
              color="primary"
              :fullWidth="true"
              @click="onUnpublishClick(moreActionsModal.post)"
            >
              {{ $t("views.postForm.publishButton") }}
            </AppButton>

            <AppButton
              v-if="moreActionsModal.post.status === 'PUBLISHED'"
              class="mt-3"
              buttonClass="text-center"
              :fullWidth="true"
              @click="onPublishClick(moreActionsModal.post)"
            >
              {{ $t("views.postForm.unpublishButton") }}
            </AppButton>

          </div>
        </div>
      </div>
    </AppModal>
    -->
  </div>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import striptags from "striptags";
import { formatDate, REQUEST_STATE, toast } from "@/utils/helpers";
import { ContentLoader } from "vue-content-loader";
import AppModal from "@/ui-kit/AppModal";
import apolloClient from "@/utils/apolloClient";
import { deletePostMutation } from "@/utils/queries";
import gql from "graphql-tag";
import TagBadgeList from "@/ui-kit/TagBadgeList";

export default {
  components: {
    AppButton,
    ContentLoader,
    AppModal,
    TagBadgeList,
  },
  props: {
    posts: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    context: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      deletePostRequestState: REQUEST_STATE.NOT_STARTED,
      changePostPublicationState: REQUEST_STATE.NOT_STARTED,
      unchangePostPublicationState: REQUEST_STATE.NOT_STARTED,
      moreActionsModal: {
        post: null,
      },
      deleteModal: {
        title: null,
        data: null,
        post: null,
      },
    };
  },
  created() {
    this.striptags = striptags;
  },
  methods: {
    teaser(post) {
      const limit = 150;
      let content;
      if (post.teaser.trim()) {
        content = striptags(post.teaser.trim());
      } else {
        content = post.content ? striptags(post.content.trim()) : "";
      }
      const contentLength = content.length;
      const truncatedContent = content.substr(0, limit);
      const ellipsis = contentLength > limit ? "..." : "";
      return truncatedContent + ellipsis;
    },
    publishedOnDate(item) {
      return formatDate(new Date(item.publishedAt), "ddMyyyyhhmm");
    },
    updatedOnDate(item) {
      return formatDate(new Date(item.updatedAt), "long");
    },
    onMoreActionsClick(post) {
      this.moreActionsModal.post = post;
      this.$store.commit("modalShowing/open", "moreActionsModal");
    },
    closeMoreActionsModal() {
      this.moreActionsModal.post = null;
      this.$store.commit("modalShowing/close", "moreActionsModal");
    },
    onDeleteClick(post) {
      this.deleteModal.post = post;
      this.deleteModal.title = this.$t("views.postList.deleteModal.title");
      this.$store.commit("modalShowing/open", "deletePostModal");
    },
    onDeleteModalConfirmClick() {
      this.deletePost(this.deleteModal.post).then(() => {
        this.closeDeletePostModal();
      });
    },
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
          this.$emit("onPostDelete", post);
          return result;
        })
        .catch(error => {
          this.deletePostRequestState = REQUEST_STATE.FINISHED_ERROR;
          toast(this, "Sorry, an error occured while deleting post", "error");
          this.closeDeletePostModal();
          throw new Error(error);
        });
    },
    onUnpublishClick(post) {
      this.changePostPublicationStatus({ post, status: "DRAFT" });
    },
    onPublishClick(post) {
      this.changePostPublicationStatus({ post, status: "PUBLISHED" });
    },
    changePostPublicationStatus({ post, status }) {
      return apolloClient
        .mutate({
          mutation: gql`
            mutation changePostPublicationStatus(
              $blogId: ID!
              $postId: ID!
              $status: PostPublicationStatus
            ) {
              savePost(blog: $blogId, post: { _id: $postId, status: $status }) {
                _id
                title
              }
            }
          `,
          variables: {
            blogId: this.$route.params.blogId,
            postId: post._id,
            status: status,
          },
        })
        .then(async result => {
          this.changePostPublicationState = REQUEST_STATE.FINISHED_OK;
          const post = result.data.savePost;
          this.$emit("onPostPublicationStatusChange", post);
          return result;
        })
        .catch(error => {
          this.changePostPublicationState = REQUEST_STATE.FINISHED_ERROR;
          toast(this, "Sorry, an error occured while publishing post", "error");
          this.$store.commit("modalShowing/close", "moreActionsModal");
          throw new Error(error);
        });
    },
  },
};
</script>
