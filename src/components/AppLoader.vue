<template>
  <div class="app-loader-wrapper has-text-centered section">
    <div class="app-loader">
      <Circle2 />
      <slot />
    </div>
  </div>
</template>

<script>
// https://nguyenvanduocit.github.io/vue-loading-spinner/
import {
  Mikepad,
  Pencil,
  Circle2,
  Circle9,
  LetterCube
} from "vue-loading-spinner";

export default {
  components: {
    Circle2
  }
};
</script>

<style scoped>
.app-loader-wrapper {
  position: absolute;
  left: 0;
  right: 0;
}
.app-loader {
  margin: auto;
  width: 200px;
}
</style>
