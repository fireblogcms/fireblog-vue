<template>
  <div>
    <LayoutTopBar />
    <!-- error messages -->

    <portal-target name="notifications"></portal-target>

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
