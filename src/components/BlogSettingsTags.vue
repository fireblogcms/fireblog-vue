<template>
  <AppPanel class="pt-0">
    <h2 class="text-xl md:text-2xl font-bold mb-2">
      {{ $t("views.blogSettings.tagsSettingsForm.title") }}
    </h2>
    <label class="text-md">
      {{ $t("views.blogSettings.tagsSettingsForm.help") }}
    </label>
    <div class="flex flex-wrap my-4">
      <TagBadgeList :tags="tags" />
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
import TagBadgeList from "@/ui-kit/TagBadgeList";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import apolloClient from "@/utils/apolloClient";
import gql from "graphql-tag";

export default {
  components: {
    AppButton,
    AppPanel,
    TagBadgeList,
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
