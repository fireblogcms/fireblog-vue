<template>
  <span class="relative">
    <button
      class="flex items-center border-2 rounded-md focus:outline-none focus:shadow-outline"
      :class="{
        'py-3 px-6 text-2xl': size === '',
        'py-1 px-4 text-xl': size === 'small',
        'bg-white border-gray-200': type === '',
        'bg-primary border-primary text-white active:bg-primary-dark active:border-primary-dark': type === 'primary',
        'bg-white border-primary text-primary active:border-primary-dark active:text-primary-dark': type === 'primary-outlined',
        'hover:bg-primary-darker hover:border-primary-darker': type === 'primary' && !$attrs.disabled,
        'hover:border-primary-darker hover:text-primary-darker': type === 'primary-outlined' && !$attrs.disabled,
        'cursor-default opacity-50': $attrs.disabled
      }"
      v-bind="$attrs"
      @click="onClick"
    >
      <slot></slot>
    </button>
    <div
      class="absolute inset-0 flex items-center justify-center border-2 rounded-md"
      :class="{
        'bg-primary border-primary': type === 'primary',
        'bg-white border-primary': type === 'primary-outlined'
      }"
      v-if="loading"
    >
      <img class="w-10 h-10" :src="`/images/${loader}.svg`" />
    </div>
  </span>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: ""
    },
    size: {
      type: String,
      default: ""
    }
  },
  computed: {
    loader() {
      return this.type === "primary" ?
        "loader" : "loader-primary";
    }
  },
  methods: {
    onClick() {
      this.$emit("click");
    }
  }
};
</script>
