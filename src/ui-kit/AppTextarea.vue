<template>
  <div>
    <label v-if="label" class="font-bold">
      {{ label }}
    </label>
    <div>
      <textarea
        class="min-h-10 bg-gray-100 text-xl shadow-sm appearance-none rounded w-full p-3 text-current focus:outline-none focus:shadow-outline"
        :class="{ 'border-red-500': error }"
        :value="value"
        @input="$emit('input', $event.target.value)"
        v-bind="$attrs"
      />
      <p v-if="error" class="mt-2 text-sm text-red-600">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
    },
    value: {
      type: String,
    },
    error: {
      type: String,
    },
  },
};
</script>
