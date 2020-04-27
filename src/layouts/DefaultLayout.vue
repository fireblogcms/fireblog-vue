<template>
  <div id="default-layout">
    <Topbar v-show="TopbarIsVisible()" />
    <slot />
  </div>
</template>

<script>
import AppTopBar from "@/components/AppTopBar";
import Topbar from "@/ui-kit/Topbar";

export default {
  components: {
    // AppTopBar,
    Topbar
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
