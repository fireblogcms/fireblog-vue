<template>
  <div class="flex items-center bg-gray-200 px-2 py-1 rounded">
    <span class="shadow-sm rounded text-gray-700"> {{ tag.name }} </span>
    <span
      v-show="tag.color"
      class="ml-2 h-5 w-5 rounded-full shadow-md"
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
