<template>
  <div>
    <label v-if="label" class="font-bold">
      {{ label }}
    </label>
    <input
      @input="onInput"
      :value="value"
      class="p-4 text-xl bg-gray-100  border-gray-200 shadow-sm border rounded w-full text-current focus:outline-none focus:shadow-outline"
      type="time"
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
    value: {
      type: String,
    },
    label: {
      type: String,
    },
    error: {
      type: String,
    },
  },
  methods: {
    onInput(event) {
      this.$emit("input", event.target.value);
    },
  },
};
</script>
