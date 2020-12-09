<template>
  <div class="min-h-10 flex flex-col">
    <div
      v-if="posts.edges.length === 0"
      class="flex-1 flex items-center justify-center"
    >
      <p class="text-center text-xl">
        {{ $t("views.postList.noPostFound") }}
      </p>
    </div>

    <template v-if="posts.edges.length > 0">
      <div
        class="py-4 md:py-6 flex flex-col md:flex-row cursor-pointer border-b border-gray-200 last:border-b-0"
        v-for="post in posts.edges"
        :key="post.node._id"
        @click="
          $router.push({
            name: 'postUpdate',
            params: {
              spaceId: $route.params.spaceId,
              blogId: $route.params.podId,
              postId: post.node._id,
            },
          })
        "
      >
        <div class="flex flex-1 flex-col md:flex-row md:mr-10">
          <div
            style="flex:0 0 200px"
            v-show="post.node.image"
            v-lazy:background-image="post.node.image"
            class="md:mr-5 mb-5 md:mb-0 rounded bg-center bg-no-repeat bg-cover"
          />
          <div>
            <p class="text-xl md:text-2xl font-bold text-gray-800">
              {{ post.node.title }}
            </p>

            <p class="text-gray-700 font-thin mb-4">
              {{ teaser(post) }}
            </p>
            <p class="text-xs uppercase" v-if="post.node.status === 'DRAFT'">
              <span class="text-indigo-700">
                {{
                  $t("views.postList.updatedOn", {
                    date: updatedOnDate(post),
                  })
                }}
              </span>
              -
              <span class="text-gray-600"
                >{{ $t("views.postList.readingTime") }} :{{
                  post.node.readingTime
                }}
                min
              </span>
            </p>
            <p
              class="text-xs uppercase text-indigo-600"
              v-if="post.node.status === 'PUBLISHED'"
            >
              <span class="text-indigo-700"> {{ publishedOnDate(post) }}</span>
              -
              <span class="text-gray-600">
                {{ $t("views.postList.readingTime") }} :
                {{ post.node.readingTime }} min
              </span>
            </p>

            <div class="">
              <span
                :key="tag.name"
                v-for="tag in post.node.tags"
                class="text-current text-sm mr-2 font-light text-gray-600"
              >
                #{{ tag.name }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex justify-end">
          <AppButton
            size="small"
            class="mt-6 md:mt-0"
            @click="onDeleteClick(post.node)"
          >
            {{ $t("views.postList.deleteButton") }}
          </AppButton>
        </div>
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
    posts: {
      type: Object,
      required: true,
    },
  },
  created() {
    this.striptags = striptags;
  },
  methods: {
    teaser(post) {
      const limit = 150;
      let content;
      if (post.node.teaser.trim()) {
        content = striptags(post.node.teaser.trim());
      } else {
        content = post.node.content ? striptags(post.node.content.trim()) : "";
      }
      const contentLength = content.length;
      const truncatedContent = content.substr(0, limit);
      const ellipsis = contentLength > limit ? "..." : "";
      return truncatedContent + ellipsis;
    },
    publishedOnDate(item) {
      return formatDate(new Date(item.node.publishedAt), "ddMyyyyhhmm");
    },
    updatedOnDate(item) {
      return formatDate(new Date(item.node.updatedAt), "long");
    },
    onDeleteClick(post) {
      this.$emit("onDeleteClick", post);
    },
  },
};
</script>
