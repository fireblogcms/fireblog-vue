<template>
  <button
    class="flex items-center border-2 border-solid rounded-md focus:outline-none focus:shadow-outline"
    :class="{
      'py-3 px-6 text-2xl': size === '',
      'py-1 px-4 text-xl': size === 'small',
      'bg-white border-gray-200': type === '',
      'bg-primary border-primary text-white hover:bg-primary-darker hover:border-primary-darker active:bg-primary-dark active:border-primary-dark': type === 'primary',
      'bg-white border-primary text-primary hover:border-primary-darker hover:text-primary-darker active:border-primary-dark active:text-primary-dark': type === 'primary-outlined'
    }"
    @click="onClick"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: ""
    },
    size: {
      type: String,
      default: ""
    }
  },
  methods: {
    onClick() {
      this.$emit("click");
    }
  }
};
</script>
