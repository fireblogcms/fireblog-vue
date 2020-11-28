<template>
  <div>
    <label v-if="label" class="font-bold">
      {{ label }}
    </label>
    <div v-if="help" class="text-sm mb-4">
      {{ help }}
    </div>
    <input
      class="p-4 text-xl bg-gray-100 border border-gray-200 shadow-sm appearance-none rounded-lg w-full text-current focus:outline-none focus:shadow-outline"
      type="text"
      :value="value"
      @input="$emit('input', $event.target.value)"
      @change="$emit('change', $event.target.value)"
      v-debounce="onDebounce"
      v-bind="$attrs"
    />
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
