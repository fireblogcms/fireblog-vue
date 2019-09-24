<template>
  <img :style="style" src="/images/left-arrow.svg" />
</template>

<script >
export default {
  props: {
    height: {
      type: String
    },
    margin: {
      type: String
    }
  },
  computed: {
    style() {
      const style = {
        height: this.height ? this.height : "10px",
        margin: this.margin ? this.margin : "0 8px"
      };
      return style;
    }
  }
};
</script>