<template>
  <div>
    <LayoutTopBar />
    <!-- error messages -->
    <portal-target style="padding-top:40px;" v-if="this.$slots.default" name="notifications"></portal-target>
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
