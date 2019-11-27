<template>
  <span @click="onClick" target="_blank" class="item button is-outlined">
    <img
      style="height:20px !important;padding-right:10px"
      src="/images/graphql.svg"
    />API
  </span>
</template>

<script>
export default {
  methods: {
    onClick() {
      this.$emit("click");
    }
  }
};
</script>
