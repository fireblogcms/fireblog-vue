<template>
  <button
    class="flex items-center py-1 text-xl rounded-md whitespace-no-wrap focus:outline-none focus:shadow-outline"
    @click="$router.push(routerOptions)"
  >
    <span class="text-indigo-600 text-2xl mr-2 font-bold">&lsaquo;</span>
    <span class="text-indigo-600 text-md">{{ name }}</span>
  </button>
</template>

<script>
export default {
  props: {
    image: {
      type: String,
      required: false,
    },
    routerOptions: {
      type: Object,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
};
</script>
