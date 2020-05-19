<template>
  <div id="default-layout" class="h-full flex flex-col">
    <AppTopbar v-show="isTopbarVisible()" />
    <div class="flex-1 bg-gray-100">
      <slot />
    </div>
  </div>
</template>

<script>
import AppTopbar from "@/ui-kit/AppTopbar";

export default {
  components: {
    AppTopbar
  },
  methods: {
    isTopbarVisible() {
      const hideForRoutes = ["auth0Callback"];
      return !hideForRoutes.includes(this.$route.name);
    }
  }
};
</script>
