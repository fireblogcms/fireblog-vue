<template>
  <div class="min-h-10 flex flex-col">
    <div
      v-if="tags.edges.length === 0"
      class="flex-1 flex items-center justify-center"
    >
      <p class="text-center text-xl">
        {{ $t("views.postList.noTagFound") }}
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
              {{ tag.node.name }}
            </p>
            <p class="mt-4">
              {{ striptags(tag.node.description || '') }}
            </p>

            <div class="mt-3 flex flex-wrap">
              <span :key="tag.name" v-for="tag in tag.node.tags" class="bg-gray-200 shadow-sm rounded text-current p-2 mr-2 mb-2">
                {{ tag.name }} 
              </span>
            </div>
          </div>
        </div>
        <AppButton
          size="small"
          class="self-center mt-6 md:mt-0"
          @click="onDeleteClick(tag.node)"
        >
          {{ $t("views.postList.deleteButton") }}
        </AppButton>
      </div>
    </template>
  </div>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import striptags from "striptags";
import { formatDate } from "@/utils/helpers";

export default {
  components: {
    AppButton,
  },
  props: {
    tags: {
      type: Object,
      required: true,
    },
  },
  created() {
    this.striptags = striptags;
  },
  methods: {
    onDeleteClick(post) {
      this.$emit("onDeleteClick", post);
    },
  },
};
</script>
