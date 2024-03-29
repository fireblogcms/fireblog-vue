<template>
  <div>
    <div class="tag-auto-complete">
      <vue-tags-input
        v-model="tag"
        :tags="tags"
        :autocomplete-items="filteredItems"
        :placeholder="placeholderComputed"
        @tags-changed="newTags => (tags = newTags)"
        @before-adding-tag="beforeAddTag"
        @before-deleting-tag="beforeDeleteTag"
      />
    </div>
    <!--
    <div>
      <div
        class="cursor-pointer text-primary underline mt-3 flex justify-end"
        @click="onManageTagsClick"
      >
        Manage your tags
      </div>
    </div>
    -->
  </div>
</template>

<script>
import VueTagsInput from "@johmun/vue-tags-input";
import {
  vuexFormGetValue,
  vuexFormGetError,
  vuexFormSetValue,
  vuexFormSetError,
} from "@/utils/vuexForm";
import { toast } from "@/utils/helpers";
import apolloClient from "@/utils/apolloClient";
import gql from "graphql-tag";
import { createTagMutation } from "@/utils/queries";

export default {
  props: {
    blogId: {
      type: String,
      required: true,
    },
    formId: {
      type: String,
      required: true,
    },
  },
  components: {
    VueTagsInput,
  },
  created() {
    this.vuexFormGetError = vuexFormGetError;
    this.vuexFormGetValue = vuexFormGetValue;
    this.FORM_ID = this.formId;
    this.init();
  },
  data() {
    return {
      tag: "",
      tags: [],
      blogTags: [],
    };
  },
  computed: {
    filteredItems() {
      return this.getTagsLabels(this.blogTags)
        .filter(tag => {
          return tag.toLowerCase().indexOf(this.tag.toLowerCase()) !== -1;
        })
        .map(text => ({ text }));
    },
    placeholderComputed() {
      return this.$t("views.postForm.sectionTags.addLabel");
    },
  },
  methods: {
    async init() {
      this.getTags();
      this.tags = this.getTagsLabels(
        vuexFormGetValue(this.FORM_ID, "tags")
      ).map(tag => ({ text: tag }));
    },
    onManageTagsClick() {
      let routeData = this.$router.resolve({
        name: "tagList",
        params: {
          blogSetId: this.$route.params.blogSetId,
          blogId: this.$route.params.blogId,
        },
      });
      window.open(routeData.href, "_blank");
    },
    getTagsLabels(tags) {
      return tags.map(tag => tag.name);
    },
    async getTags() {
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
          blogId: this.blogId,
        },
      });
      // console.log(result.data.tags.edges || []).map(e => e.node.name)
      this.blogTags = (result.data.tags.edges || []).map(e => e.node);
      return this.blogTags;
    },
    beforeAddTag(obj) {
      const newTagLabel = obj.tag.text;
      const existingTag = this.blogTags.find(t => t.name === newTagLabel);
      // from auto-complete
      if (existingTag) {
        vuexFormSetValue(this.FORM_ID, "tags", [
          ...vuexFormGetValue(this.FORM_ID, "tags"),
          existingTag,
        ]);
        obj.addTag();
      }
    },
    beforeDeleteTag(obj) {
      // console.log('remove tag', obj);
      vuexFormSetValue(
        this.FORM_ID,
        "tags",
        vuexFormGetValue(this.FORM_ID, "tags").filter(
          t => t.name !== obj.tag.text
        )
      );
      obj.deleteTag();
    },
  },
};
</script>

<style>
.tag-auto-complete > .vue-tags-input {
  @apply bg-gray-100 border-0 max-w-none !important;
}

.tag-auto-complete .vue-tags-input .ti-input {
  @apply p-2 text-xl border-0 shadow-sm appearance-none rounded text-current;
}

.tag-auto-complete .vue-tags-input .ti-input:focus {
  @apply outline-none shadow-outline;
}

.tag-auto-complete .vue-tags-input .ti-tag {
  @apply bg-gray-200 p-2 rounded text-gray-800;
}

.tag-auto-complete .vue-tags-input .ti-new-tag-input {
  @apply p-2 bg-gray-100;
}

.tag-auto-complete .vue-tags-input .ti-autocomplete {
  @apply border-gray-300 rounded-b shadow-sm;
}

.tag-auto-complete .vue-tags-input .ti-item {
  @apply py-4;
}

.tag-auto-complete .vue-tags-input .ti-item:hover {
  @apply bg-primary;
}
</style>
