<template>
  <div class="field">
    <div class="label-wrapper">
      <label>
        <strong>{{ label }}</strong>
        <p v-if="help" class="help">{{ help }}</p>
      </label>
    </div>
    <div class="control">
      <input
        @input="onSlugInput"
        :value="value"
        class="input"
        :class="computedInputClass"
        type="text"
        placeholder="slug"
      />
    </div>
    <p class="help is-danger" v-if="error">{{ error }}</p>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      default: ""
    },
    label: {
      type: String,
      default: "Slug"
    },
    help: {
      type: String,
      default: ""
    },
    error: {
      type: String
    },
    inputClass: {
      type: String,
      default: "is-medium"
    }
  },
  methods: {
    onSlugInput(event) {
      this.$emit("input", event.target.value);
    }
  },
  computed: {
    computedInputClass() {
      return {
        "is-danger": this.error ? true : false,
        [this.inputClass]: true
      };
    }
  }
};
</script>