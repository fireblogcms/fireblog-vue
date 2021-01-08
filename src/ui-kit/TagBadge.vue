<template>
  <div class="bg-gray-200 px-2 py-1 rounded">
    <span
      v-show="tag.color"
      class="mr-1 h-5 w-5 rounded-full shadow-md inline-block"
      :style="{ backgroundColor: tag.color, position: 'relative', top: '3px' }"
    >
    </span>
    {{ tag.name }}
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
