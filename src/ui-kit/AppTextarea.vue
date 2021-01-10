<template>
  <div>
    <label v-if="label" class="font-bold">
      {{ label }}
    </label>
    <div>
      <div class="relative">
        <textarea
          class="min-h-10 bg-gray-100 border border-gray-200 text-lg shadow-sm appearance-none rounded-lg w-full p-3 text-current focus:outline-none focus:shadow-outline"
          :class="{
            'border-red-400 bg-red-100': error,
            'border-gray-200  bg-gray-100': !error,
          }"
          :value="value"
          :maxlength="maxlength"
          @input="$emit('input', $event.target.value)"
          v-bind="$attrs"
        />

        <div
          v-if="maxlength"
          class="bottom-0 right-0 text-gray-700 font-100 text-sm flex justify-end"
        >
          {{ value.length }} / {{ maxlength }}
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600">
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
      default: "",
    },
    maxlength: {
      type: String,
    },
    error: {
      type: String,
    },
  },
  data() {
    return {
      counter: this.maxlength - this.value.length,
      factor: this.value.length ? this.value.length / this.maxlength : 0,
    };
  },
  watch: {
    value: function(value) {
      this.counter = this.maxlength - this.value.length;
      this.factor = this.value.length ? this.value.length / this.maxlength : 0;
    },
  },
};
</script>
