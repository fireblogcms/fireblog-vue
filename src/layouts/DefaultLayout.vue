<template>
  <div id="app">
    <AppTopBar v-show="TopbarIsVisible()" />
    <slot />
  </div>
</template>

<script>
import AppTopBar from "@/components/AppTopBar";

export default {
  components: {
    AppTopBar
  },
  methods: {
    TopbarIsVisible() {
      let visible = true;
      const hideForRoutes = ["auth0Callback"];
      if (hideForRoutes.includes(this.$route.name)) {
        visible = false;
      }
      return visible;
    }
  }
};
</script>


