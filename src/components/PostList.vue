<template>
  <div>
    <p
      v-if="postsRequestState === 'FINISHED_OK' && posts.edges.length === 0"
      class="text-center text-xl"
    >
      {{ $t("views.postList.noPostFound") }}
    </p>

    <template
      v-if="postsRequestState === 'FINISHED_OK' && posts.edges.length > 0"
    >
      <div
        class="p-10 flex cursor-pointer border-b border-gray-300 last:border-b-0"
        v-for="post in posts.edges"
        :key="post.node._id"
        @click="$router.push({
          name: 'postUpdate',
          params: {
            blogId: $route.params.blogId,
            postId: post.node._id
          }
        })"
      >
        <div
          v-show="post.node.image"
          v-lazy:background-image="post.node.image"
          class="w-32 mr-10 rounded-md bg-center bg-no-repeat bg-cover"
        ></div>
        <div class="flex-1">
          <p class="text-3xl font-bold">
            {{ post.node.title }}
          </p>
          <p
            class="text-sm italic"
            v-if="post.node.status === 'PUBLISHED'"
          >
            {{
              $t("views.postList.publishedOn", {
                date: publishedOnDate(post)
              })
            }}
          </p>
          <p
            class="text-sm italic"
            v-if="post.node.status === 'DRAFT'"
          >
            {{
              $t("views.postList.updatedOn", {
                date: updatedOnDate(post)
              })
            }}
          </p>
          <p v-if="post.node.teaser.trim()" class="mt-4">
            {{ striptags(post.node.teaser) }}
          </p>
        </div>
        <AppButton
          size="small"
          class="self-center"
          @click="onDeleteClick(post.node)"
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
    AppButton
  },
  props: {
    posts: {
      type: Object,
      required: true
    },
    postsRequestState: {
      type: String,
      required: true
    }
  },
  created() {
    this.striptags = striptags;
  },
  methods: {
    publishedOnDate(item) {
      return formatDate(new Date(item.node.publishedAt), "long");
    },
    updatedOnDate(item) {
      return formatDate(new Date(item.node.updatedAt), "long");
    },
    onDeleteClick(post) {
      this.$emit("onDeleteClick", post);
    }
  }
};
</script>
