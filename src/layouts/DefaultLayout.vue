<template>
  <div :style="style" class="flex flex-col min-h-screen">
    <AppTopbar v-show="isTopbarVisible()" />
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>

<script>
import AppTopbar from "@/ui-kit/AppTopbar";

export default {
  components: {
    AppTopbar,
  },
  methods: {
    isTopbarVisible() {
      const hideForRoutes = ["auth0Callback"];
      return !hideForRoutes.includes(this.$route.name);
    },
  },
  computed: {
    style() {
      return {
        background: `center / cover url("/illustrations/landscape-3.jpg")`,
      };
    },
  },
};
</script>
