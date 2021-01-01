<template>
  <div>
    <label v-if="label" class="font-bold">
      {{ label }}
    </label>
    <div class="flex">
      <div>
        <input
          type="color"
          :value="value"
          @input="$emit('input', $event.target.value)"
        />
      </div>
    </div>
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
    showValue: {
      type: Boolean,
      default: true,
    },
  },
};
</script>
