<template>
  <div id="app">
    <TopBar />
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
  }
};
</script>
