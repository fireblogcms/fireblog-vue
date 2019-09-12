<template>
  <div :style="wrapperStyle()" class="app-loader-wrapper has-text-centered section">
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
  },
  props: {
    absolute: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    wrapperStyle() {
      const styles = {};
      if (this.absolute === true) {
        styles.position = "absolute";
        styles.margin = "auto";
        styles.width = "100vw";
      }
      return styles;
    }
  }
};
</script>


