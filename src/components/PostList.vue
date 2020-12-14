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
      v-if="posts.length === 0"
      class="flex-1 flex items-center justify-center"
    >
      <p class="text-center text-xl">
        {{ $t("views.postList.noPostFound") }}
      </p>
    </div>

    <template v-if="posts.length > 0">
      <div
        class="py-4 md:py-6 flex flex-col md:flex-row cursor-pointer border-b border-gray-300 last:border-b-0"
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
        <div class="flex flex-1 mr-2">
          <div
            v-show="post.image"
            v-lazy:background-image="post.image"
            class="w-40 mr-10 rounded bg-center bg-no-repeat bg-cover"
          ></div>
          <div>
            <p class="text-xl md:text-2xl font-bold text-gray-800">
              {{ post.title }}
            </p>

            <p class="text-gray-700 mb-2">
              {{
                striptags(
                  post.teaser.trim()
                    ? post.teaser.substring(0, 100) + "..."
                    : post.content.substring(0, 100) + "..."
                )
              }}
            </p>
            <p class="text-xs uppercase" v-if="post.status === 'DRAFT'">
              <span class="text-indigo-700">
                {{
                  $t("views.postList.updatedOn", {
                    date: updatedOnDate(post),
                  })
                }}
              </span>
              -
              <span class="text-gray-600"
                >{{ $t("views.postList.readingTime") }} :{{ post.readingTime }}
                min
              </span>
            </p>
            <p
              class="text-xs uppercase text-indigo-600"
              v-if="post.status === 'PUBLISHED'"
            >
              <span class="text-indigo-700"> {{ publishedOnDate(post) }}</span>
              -
              <span class="text-gray-600">
                {{ $t("views.postList.readingTime") }} :
                {{ post.readingTime }} min
              </span>
            </p>

            <div class="mt-3">
              <span
                :key="tag.name"
                v-for="tag in post.tags"
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
            @click="onDeleteClick(post)"
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
      type: Array,
      required: true,
    },
  },
  created() {
    this.striptags = striptags;
  },
  methods: {
    publishedOnDate(item) {
      return formatDate(new Date(item.publishedAt), "ddMyyyyhhmm");
    },
    updatedOnDate(item) {
      return formatDate(new Date(item.updatedAt), "long");
    },
    onDeleteClick(post) {
      this.$emit("onDeleteClick", post);
    },
  },
};
</script>
