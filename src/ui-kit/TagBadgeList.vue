<template>
  <div>
    <TagBadge
      style="flex: 1 1 0"
      v-for="tag in tags"
      :tag="tag"
      :key="tag._id"
      class="mr-2 mb-2 float-left"
    />
  </div>
</template>

<script>
import TagBadge from "./TagBadge";

export default {
  components: {
    TagBadge,
  },
  props: {
    tags: {
      // list of full tags object, with a _id field.
      type: Array,
      required: true,
    },
  },
};
</script>
