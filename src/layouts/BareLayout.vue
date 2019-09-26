<template>
  <div class="container section">
    <!-- notifications messages -->
    <portal-target v-if="this.$slots.default" name="notifications"></portal-target>
    <slot />
  </div>
</template>

<script>
import LayoutTopBar from "@/components/LayoutTopBar";

export default {
  components: {
    LayoutTopBar
  }
};
</script>
