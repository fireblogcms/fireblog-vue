<template>
  <div>
    <label v-if="label" class="font-bold">
      {{ label }}
    </label>
    <div v-if="help" class="text-sm mb-4">
      {{ help }}
    </div>
    <div class="relative flex items-center">
      <div v-show="loading" class="absolute right-0 pr-3">
        <img width="25px" src="/images/loader-b.svg" />
      </div>
      <input
        class="p-3 text-xl bg-gray-100 border shadow-sm appearance-none rounded-lg w-full text-current focus:outline-none focus:shadow-outline"
        :class="{
          'border-red-400 bg-red-100': error,
          'border-gray-200  bg-gray-100': !error,
          'pr-10': loading,
        }"
        type="text"
        :value="value"
        @input="$emit('input', $event.target.value)"
        @change="$emit('change', $event.target.value)"
        @blur="$emit('blur', $event.target.value)"
        v-debounce="onDebounce"
        v-bind="$attrs"
      />
    </div>
    <p v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: String,
    },
    label: {
      type: String,
    },
    value: {
      type: String,
    },
    help: {
      type: String,
    },
    debounce: {
      type: Function,
      default: () => {},
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    onDebounce(value) {
      this.$emit("debounce", value);
    },
  },
};
</script>

<style>
input[type="text"]:disabled {
  @apply bg-gray-200 cursor-not-allowed;
}
</style>
