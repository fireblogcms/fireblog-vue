<template>
  <div class="app-loader-wrapper has-text-centered section">
    <Circle2 style="display:inline-block" />
    <div>
      <slot />
    </div>
  </div>
</template>

<script>
// https://nguyenvanduocit.github.io/vue-loading-spinner/
import { Circle2 } from "vue-loading-spinner";

export default {
  components: {
    Circle2
  }
};
</script>

<style scoped>
.app-loader {
  margin: auto;
  width: 200px;
}
</style>
