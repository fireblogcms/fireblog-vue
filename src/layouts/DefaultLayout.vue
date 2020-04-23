<template>
  <div id="default-layout">
    <AppTopbar v-show="TopbarIsVisible()" />
    <slot />
  </div>
</template>

<script>
import AppTopBar from "@/components/AppTopBar";
import AppTopbar from "@/ui-kit/AppTopbar";

export default {
  components: {
    // AppTopBar,
    AppTopbar
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
