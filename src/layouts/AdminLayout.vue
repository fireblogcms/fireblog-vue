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
import TopBar from "@/components/TopBar";

export default {
  components: {
    TopBar
  }
};
</script>
