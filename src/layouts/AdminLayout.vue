<template>
  <div id="app">
    <TopBar v-show="topBarIsVisible()" />
    <!-- notification space -->
    <portal-target v-if="this.$slots.default" name="notifications"></portal-target>
    <slot />
  </div>
</template>

<script>
import TopBar from "@/components/TopBar";

export default {
  components: {
    TopBar
  },
  methods: {
    topBarIsVisible() {
      const routes = ["postCreate", "postUpdate"];
      if (routes.includes(this.$route.name)) {
        return false;
      }
      return true;
    }
  }
};
</script>
