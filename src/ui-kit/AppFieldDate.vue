<template>
  <div>
    <label v-if="label" class="font-bold">
      {{ label }}
    </label>
    <DatePicker
      v-bind="$attrs"
      @input="value => $emit('input', value)"
      @selected="value => $emit('selected', value)"
      @cleared="value => $emit('cleared', value)"
      @closed="value => $emit('closed', value)"
      @opened="value => $emit('opened', value)"
      input-class="p-4 bg-gray-100 border-gray-200 text-xl shadow-sm appearance-none border rounded w-full text-current focus:outline-none focus:shadow-outline"
    >
    </DatePicker>
    <p v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script>
import DatePicker from "vuejs-datepicker";

export default {
  components: {
    DatePicker,
  },
  props: {
    label: {
      type: String,
    },
    error: {
      type: String,
    },
  },
};
</script>
