<template>
  <AppPanel class="pt-0">
    <h2 class="text-4xl font-bold">
      {{ $t("views.blogSettings.tagsSettingsForm.title") }}
    </h2>
    <label class="text-md font-bold">
      {{
        $t("views.blogSettings.tagsSettingsForm.label")
      }}
    </label>
    <div class="flex flex-wrap my-4">
      <span :key="tag.name" v-for="tag in tags" class="bg-gray-200 shadow-sm rounded text-current p-2 mr-2 mb-2">
        {{ tag.name }} 
      </span>
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
                    } 
                }
            }
        }
    `
    const result = await apolloClient.query({
        query,
        variables: {
            blogId: this.blog._id,
        }
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
