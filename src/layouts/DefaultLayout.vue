<template>
  <div id="default-layout" class="flex flex-col">
    <AppTopbar v-show="TopbarIsVisible()" />
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
