<template>
  <button
    class="flex items-center py-1 px-4 text-xl rounded-md whitespace-no-wrap focus:outline-none focus:shadow-outline"
    @click="$router.push({ name: link }).catch((err) => {})"
  >
    <img class="hidden md:inline-block w-6 h-6" :src="image" />
    <img class="w-4 h-4 md:mx-2" src="/images/left-arrow.svg" />
    <span class="hidden md:inline">{{ name }}</span>
  </button>
</template>

<script>
export default {
  props: {
    image: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }
};
</script>
