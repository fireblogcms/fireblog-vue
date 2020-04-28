<template>
  <router-link :to="{ name: link }" class="hover:text-current">
    <AppButton size="small">
      <img class="w-6 h-6" :src="image" />
      <img class="w-4 h-4 mx-2" src="/images/left-arrow.svg" />
      <span>{{ name }}</span>
    </AppButton>
  </router-link>
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
