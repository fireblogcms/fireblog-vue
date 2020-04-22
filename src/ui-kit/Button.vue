<template>
  <button
    class="py-3 px-6 text-2xl border-2 border-solid rounded-md"
    @click="onClick"
  >
    <slot></slot>
  </button>
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

<style scoped>
.btn-primary {
  @apply bg-primary border-primary text-white;
}
.btn-primary:active,
.btn-primary:hover {
  @apply bg-primary-darker border-primary-darker;
}
.btn-primary:focus {
  @apply outline-none;
}
.btn-primary-outlined {
  @apply border-primary text-primary;
}
.btn-primary-outlined:active,
.btn-primary-outlined:hover {
  @apply border-primary-darker text-primary-darker;
}
.btn-primary-outlined:focus {
  @apply outline-none;
}
</style>
