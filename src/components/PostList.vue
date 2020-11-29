<template>
  <div class="min-h-10 flex flex-col">
    <!--
    <div v-if="postsRequestState === 'PENDING'">
      <div
        class="px-8 py-4 md:py-6 border-b border-gray-300 last:border-b-0"
        v-for="(v, i) in [0, 1]"
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
    -->
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
        class="py-4 md:py-6 flex flex-col md:flex-row cursor-pointer border-b border-gray-300 last:border-b-0"
        v-for="post in posts.edges"
        :key="post.node._id"
        @click="
          $router.push({
            name: 'postUpdate',
            params: {
              blogSetId: $route.params.blogSetId,
              blogId: $route.params.blogId,
              postId: post.node._id,
            },
          })
        "
      >
        <div class="flex flex-1 mr-2">
          <div
            v-show="post.node.image"
            v-lazy:background-image="post.node.image"
            class="w-40 mr-10 rounded bg-center bg-no-repeat bg-cover"
          ></div>
          <div>
            <p
              class="text-xs uppercase text-gray-600"
              v-if="post.node.status === 'PUBLISHED'"
            >
              {{ publishedOnDate(post) }}
            </p>
            <p class="text-xl md:text-3xl font-bold">
              {{ post.node.title }}
            </p>
            <p
              class="text-sm italic text-gray-600"
              v-if="post.node.status === 'DRAFT'"
            >
              {{
                $t("views.postList.updatedOn", {
                  date: updatedOnDate(post),
                })
              }}
            </p>
            <!--
            <p class="text-sm italic text-gray-600">
              {{ $t("views.postList.readingTime") }} :
              {{ post.node.readingTime }} min
            </p>
            -->

            <p class="text-gray-600">
              {{
                striptags(
                  post.node.teaser.trim()
                    ? post.node.teaser.substring(0, 100) + "..."
                    : post.node.content.substring(0, 100) + "..."
                )
              }}
            </p>

            <div class="mt-3">
              <span
                :key="tag.name"
                v-for="tag in post.node.tags"
                class="bg-gray-200 shadow-sm rounded text-current p-2 mr-1"
              >
                {{ tag.name }}
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
