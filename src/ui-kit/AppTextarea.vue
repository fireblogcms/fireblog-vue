<template>
  <textarea
    class="min-h-10 shadow-sm appearance-none border rounded w-full p-3 text-current focus:outline-none focus:shadow-outline"
    :value="value"
    @input="$emit('input', $event.target.value)"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  props: {
    value: {
      type: String
    }
  }
}
</script>
