<template>
  <div id="app">
    <BulmaNavigation />
    <slot />
  </div>
</template>

<script>
import BulmaNavigation from "@/components/BulmaNavigation";

export default {
  components: {
    BulmaNavigation
  }
};
</script>
