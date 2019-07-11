<template>
  <div id="app">
    <TopBar />
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
