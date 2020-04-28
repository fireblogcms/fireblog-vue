<template>
  <div id="default-layout" class="flex flex-col">
    <AppTopbar v-show="isTopbarVisible()" />
    <div class="bg-gray-100 flex-1">
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
