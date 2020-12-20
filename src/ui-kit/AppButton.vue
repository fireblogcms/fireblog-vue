<template>
  <span class="relative inline-block" :class="{ 'w-full': fullWidth }">
    <!-- Click stop is important for the post list for example so the parent's click is not triggered -->
    <button
      class="flex items-center border rounded whitespace-no-wrap focus:outline-none focus:shadow-outline"
      :class="{
        'py-4 px-6 text-xl': size === '',
        'py-2 px-4 text-xl': size === 'small',
        'bg-white border-gray-200': color === '',
        'bg-primary border-primary text-white active:bg-primary-dark active:border-primary-dark':
          color === 'primary',
        'bg-white border-primary text-primary active:bg-primary-darker active:border-primary-darker active:text-white':
          color === 'primary-outlined',
        'bg-secondary border-secondary text-primary-dark active:bg-secondary-dark active:border-secondary-dark':
          color === 'secondary',
        'bg-danger border-danger text-white active:bg-danger-dark active:border-danger-dark':
          color === 'danger',
        'hover:border-gray-500': color === '' && !$attrs.disabled,
        'hover:bg-primary-darker hover:border-primary-darker':
          color === 'primary' && !$attrs.disabled,
        'hover:text-white hover:bg-primary hover:border-primary':
          color === 'primary-outlined' && !$attrs.disabled,
        'hover:bg-secondary-darker hover:border-secondary-darker':
          color === 'secondary' && !$attrs.disabled,
        'hover:bg-danger-darker hover:border-danger-darker':
          color === 'danger' && !$attrs.disabled,
        'cursor-default opacity-50': $attrs.disabled,
        'w-full': fullWidth,
        [buttonClass]: buttonClass ? buttonClass : '',
      }"
      v-bind="$attrs"
      @click.stop="onClick"
    >
      <slot></slot>
    </button>
    <div
      class="absolute inset-0 flex items-center justify-center border rounded"
      :class="{
        'bg-white border-gray-200': color === '',
        'bg-primary border-primary':
          color === 'primary' || color === 'primary-outlined',
        'bg-danger border-danger': color === 'danger',
      }"
      v-if="loading"
    >
      <img class="w-6 h-6" :src="`/images/${loader}.svg`" />
    </div>
  </span>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: "",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: "",
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
    buttonClass: {
      type: String,
      default: "",
    },
  },
  computed: {
    loader() {
      let loaderImage = "loader";
      if (
        this.color === "primary" ||
        this.color === "primary-outlined" ||
        this.color === "danger"
      ) {
        loaderImage = "loader-primary";
      }
      return loaderImage;
    },
  },
  methods: {
    onClick() {
      this.$emit("click");
    },
  },
};
</script>
