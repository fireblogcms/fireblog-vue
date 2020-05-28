<template>
  <div class="min-h-10 flex flex-col">
    <div class="flex-1 flex items-center justify-center">
      <p
        v-if="postsRequestState === 'FINISHED_OK' && posts.edges.length === 0"
        class="text-center text-xl"
      >
        {{ $t("views.postList.noPostFound") }}
      </p>
    </div>

    <template
      v-if="postsRequestState === 'FINISHED_OK' && posts.edges.length > 0"
    >
      <div
        class="px-8 py-4 md:py-6 flex flex-col md:flex-row cursor-pointer border-b border-gray-300 last:border-b-0"
        v-for="post in posts.edges"
        :key="post.node._id"
        @click="
          $router.push({
            name: 'postUpdate',
            params: {
              blogId: $route.params.blogId,
              postId: post.node._id
            }
          })
        "
      >
        <div class="flex flex-1">
          <div
            v-show="post.node.image"
            v-lazy:background-image="post.node.image"
            class="w-64 mr-10 rounded-md bg-center bg-no-repeat bg-contain"
          ></div>
          <div>
            <p class="text-3xl font-bold">
              {{ post.node.title }}
            </p>
            <p class="text-sm italic" v-if="post.node.status === 'PUBLISHED'">
              {{
                $t("views.postList.publishedOn", {
                  date: publishedOnDate(post)
                })
              }}
            </p>
            <p class="text-sm italic" v-if="post.node.status === 'DRAFT'">
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
        </div>
        <AppButton
          size="small"
          class="self-center mt-6 md:mt-0"
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
