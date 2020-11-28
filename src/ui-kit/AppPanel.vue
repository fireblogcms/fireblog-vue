<template>
  <div class="container mx-auto my-10 flex flex-col items-center">
    <div
      class="w-full md:w-8/12 py-6 md:py-16 px-4 md:px-10 shadow rounded-lg"
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
