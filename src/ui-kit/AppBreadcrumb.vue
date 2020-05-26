<template>
  <AppButton
    size="small"
    @click="$router.push({ name: link })"
  >
    <img class="hidden md:inline-block w-6 h-6" :src="image" />
    <img class="w-4 h-4 md:mx-2" src="/images/left-arrow.svg" />
    <span class="hidden md:inline">{{ name }}</span>
  </AppButton>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";

export default {
  components: {
    AppButton
  },
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
