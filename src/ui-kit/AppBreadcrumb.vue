<template>
  <button
    class="flex items-center py-1 text-xl rounded-md whitespace-no-wrap focus:outline-none focus:shadow-outline"
    @click="$router.push(routerOptions)"
  >
    <img class="w-4 h-4 mr-2" src="/images/left-arrow.svg" />
    <span class="font-bold text-indigo-600">{{ name }}</span>
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
