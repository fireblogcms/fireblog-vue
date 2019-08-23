<template>
  <router-link class="button" :to="to">
    <slot />
  </router-link>
</template>

<script>
export default {
  props: {
    to: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.button {
  font-weight: 400;
  box-shadow: 0px 4px 5px rgba(229, 229, 229, 1);
  text-transform: uppercase;
}
</style>
