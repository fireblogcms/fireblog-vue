<template>
  <div>
    <label v-if="label" class="font-bold">
      {{ label }}
    </label>
    <div>
      <textarea
        class="min-h-10 bg-gray-100 border border-gray-200 text-lg shadow-sm appearance-none rounded-lg w-full p-3 text-current focus:outline-none focus:shadow-outline"
        :class="{
          'border-red-400 bg-red-100': error,
          'border-gray-200  bg-gray-100': !error,
        }"
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
