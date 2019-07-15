<template>
  <div id="app">
    <TopBar />
    <!-- notification space -->
    <portal-target v-if="this.$slots.default" name="notifications"></portal-target>

    <!-- /notification space -->
    <slot />
  </div>
</template>

<script>
import BulmaNavigation from "@/components/BulmaNavigation";
import TopBar from "@/components/TopBar";

export default {
  components: {
    BulmaNavigation,
    TopBar
  }
};
</script>
