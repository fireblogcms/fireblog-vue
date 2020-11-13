<template>
  <div
    id="default-layout"
    class="flex flex-col"
    :class="`view-${$route.name}`"
    style="min-height:100vh"
  >
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
};
</script>

<style scoped>
/*
.view-postList {
  background-image: url("/illustrations/flying-whale.jpg");
  background-attachment: fixed;
  background-size: contain;
}
*/

.view-postUpdate,
.view-postCreate {
  background-image: url("/illustrations/flying-whale.jpg");
  background-size: contain;
}
.view-blogCreate {
  background-image: url("/illustrations/flying-whale.jpg");
  background-size: cover;
}
</style>
