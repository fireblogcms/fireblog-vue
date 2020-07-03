<template>
  <div>
    <label v-if="label" class="font-bold">
      {{ label }}
    </label>
    <input
      class="p-4 text-xl shadow-sm appearance-none border rounded w-full text-current focus:outline-none focus:shadow-outline"
      type="text"
      :value="value"
      @input="$emit('input', $event.target.value)"
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
  },
};
</script>

<style>
input[type="text"]:disabled {
  @apply bg-gray-200 cursor-not-allowed;
}
</style>
