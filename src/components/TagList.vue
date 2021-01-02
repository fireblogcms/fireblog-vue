<template>
  <div class="min-h-10 flex flex-col">
    <div
      v-if="tags.edges.length === 0"
      class="flex-1 flex items-center justify-center"
    >
      <p class="text">
        <img width="150" class="mx-auto" src="/images/desert.svg" />
        <span class="text-gray-600">
          {{ $t("views.tagList.noResult") }}
        </span>
      </p>
    </div>

    <template v-if="tags.edges.length > 0">
      <div
        class="py-4 md:py-6 flex flex-col md:flex-row cursor-pointer border-b border-gray-300 last:border-b-0"
        v-for="tag in tags.edges"
        :key="tag.node._id"
        @click="
          $router.push({
            name: 'tagUpdate',
            params: {
              blogSetId: $route.params.blogSetId,
              blogId: $route.params.blogId,
              tagId: tag.node._id,
            },
          })
        "
      >
        <div class="flex flex-1 mr-2">
          <div
            v-show="tag.node.image"
            v-lazy:background-image="tag.node.image"
            class="w-40 mr-10 rounded bg-center bg-no-repeat bg-cover"
          ></div>
          <div>
            <p class="text-3xl font-bold">
              {{ tag.node.name }} {{ tag.node.description }}
            </p>
            <p class="mt-4">
              {{ striptags(tag.node.description || "") }}
            </p>

            <div class="mt-3 flex flex-wrap">
              <span
                :key="tag.name"
                v-for="tag in tag.node.tags"
                class="bg-gray-200 shadow-sm rounded text-current p-2 mr-2 mb-2"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>
        </div>
        <AppButton
          size="small"
          class="self-center mt-6 md:mt-0"
          @click="onDeleteClick(tag.node)"
        >
          <img width="20" src="/images/icon-delete.svg" />
        </AppButton>
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
  </div>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import striptags from "striptags";
import { formatDate, REQUEST_STATE } from "@/utils/helpers";
import AppModal from "@/ui-kit/AppModal";
import apolloClient from "@/utils/apolloClient";
import { deleteTagMutation } from "@/utils/queries";

export default {
  components: {
    AppButton,
    AppModal,
  },
  props: {
    tags: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      deleteModal: {
        title: null,
        data: null,
        tag: null,
      },
      deleteTagRequestState: REQUEST_STATE.NOT_STARTED,
    };
  },
  created() {
    this.striptags = striptags;
  },
  methods: {
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
          this.$emit("tagDeleted", result.data.deleteTag);
          const post = result.data.deleteTag;
        })
        .catch(error => {
          this.deleteTagRequestState = REQUEST_STATE.FINISHED_ERROR;
          toast(this, "Sorry, an error occured while fetching posts", "error");
          this.closeDeleteTagModal();
          throw new Error(error);
        });
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
      });
    },
  },
};
</script>
