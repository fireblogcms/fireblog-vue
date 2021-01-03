<template>
  <div class="flex items-center bg-gray-200 p-2 mr-2 mb-2 rounded">
    <span class="shadow-sm rounded text-current"> {{ tag.name }} </span>
    <span
      v-show="tag.color"
      class="ml-2 h-6 w-6 rounded-full shadow-md"
      :style="{ backgroundColor: tag.color }"
    >
    </span>
  </div>
</template>

<script>
export default {
  props: {
    tag: {
      type: Object,
      required: true,
    },
  },
};
</script>
