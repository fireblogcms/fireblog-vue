<template>
  <AppPanel class="pt-0">
    <h2 class="text-4xl font-bold">
      {{ $t("views.blogSettings.tagsSettingsForm.title") }}
    </h2>
    <label class="text-md font-bold">
      {{ $t("views.blogSettings.tagsSettingsForm.label") }}
    </label>
    <div class="flex flex-wrap my-4">
      <div
        v-for="tag in tags"
        :key="tag._id"
        class="flex items-center bg-gray-200 p-2 mr-2 mb-2 rounded"
      >
        <span class="shadow-sm rounded text-current"> {{ tag.name }} </span>
        <span
          v-show="tag.color"
          class="ml-2 h-6 w-6 rounded-full shadow-md"
          :style="{ backgroundColor: tag.color }"
        >
        </span>
      </div>
    </div>
    <AppButton
      color="primary-outlined"
      @click="
        $router.push({
          name: 'tagList',
          params: {
            blogSetId: $route.params.blogSetId,
            blogId: $route.params.blogId,
          },
        })
      "
    >
      {{ $t("views.blogSettings.tagsSettingsForm.saveButton") }}
    </AppButton>
  </AppPanel>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppPanel from "@/ui-kit/AppPanel";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import apolloClient from "@/utils/apolloClient";
import gql from "graphql-tag";

export default {
  components: {
    AppButton,
    AppPanel,
  },
  props: {
    blog: {
      type: Object,
      required: true,
    },
  },
  async created() {
    console.log(this.blog);
    const query = gql`
      query blogTagsQuery($blogId: ID!) {
        tags(blog: $blogId) {
          edges {
            node {
              _id
              slug
              name
              color
            }
          }
        }
      }
    `;
    const result = await apolloClient.query({
      query,
      variables: {
        blogId: this.blog._id,
      },
    });
    this.tags = (result.data.tags.edges || []).map(e => e.node);
  },
  data() {
    return {
      tags: [],
    };
  },
};
</script>
