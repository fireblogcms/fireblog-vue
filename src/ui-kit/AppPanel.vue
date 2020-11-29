<template>
  <div class="my-10 px-5">
    <div
      class="py-6 md:py-16 px-5 md:px-10 shadow rounded-lg"
      :class="{
        'bg-white': type === '',
        'bg-danger-light border-2 border-danger': type === 'danger',
      }"
    >
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: "",
    },
  },
};
</script>
