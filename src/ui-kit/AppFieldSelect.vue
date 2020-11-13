<template>
  <div>
    <label v-if="label" class="font-bold">
      {{ label }}
    </label>
    <select 
      class="p-4 text-xl shadow-sm border rounded w-full text-current focus:outline-none focus:shadow-outline"
      :value="value" 
      @change="$emit('change', $event.target.value)">
      <option v-for="option in options" :key="option.value">
        {{option.label}}
      </option>
    </select>
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
    // - option.value
    // - option.label
    options: {
      type: Array,
      default: () => [],
    },
  },
};
</script>


