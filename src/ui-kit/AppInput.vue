<template>
  <div>
    <input
      class="shadow-sm appearance-none border rounded w-full p-3 text-current focus:outline-none focus:shadow-outline"
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
      type: String
    },
    value: {
      type: String
    }
  }
}
</script>
