<template>
  <div>
    <label v-if="label" class="font-bold">
      {{ label }}
    </label>
    <div class="flex">
      <div>
        <input
          type="color"
          :value="internalValue"
          @input="$emit('input', $event.target.value)"
        />
      </div>
      <div v-show="internalValue" class="flex">
        <div class="mx-4 text-gray-700 flex items-center">
          <div class="w-16">
            {{ value }}
          </div>
          <div>
            <img
              @click="onClearClick"
              style="position:relative;top:-2px"
              class="inline cursor-pointer ml-2"
              width="18px"
              src="/images/icon-delete.svg"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // external value coming from parent component, do not mutate.
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
    noColorText: {
      type: String,
      default: "Please choose a color",
    },
  },
  data() {
    return {
      // internal value, always in sync with this.$props.value thanks to a watcher.
      internalValue: this.value,
    };
  },
  watch: {
    value: function(value) {
      this.internalValue = value;
    },
  },
  methods: {
    onClearClick() {
      this.internalValue = null;
      this.$emit("input", this.internalValue);
    },
  },
};
</script>
