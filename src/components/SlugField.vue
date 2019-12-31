<template>
  <div class="field">
    <div class="label-wrapper">
      <label>
        <strong>{{ label }}</strong>
        <p v-if="computedHelp" class="help" v-html="computedHelp" />
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
import i18n from "../i18n";
import { createSlug } from "../utils/helpers";

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
      default: i18n.t("components.fieldSlug.label")
    },
    help: {
      type: String
    },
    error: {
      type: String
    },
    inputClass: {
      type: String,
      default: "is-medium"
    }
  },
  data() {
    return {
      source: this.value,
      slug: createSlug(this.value)
    };
  },
  methods: {
    onSlugInput(event) {
      this.slug = createSlug(event.target.value);
      this.$emit("input", {
        source: event.target.value,
        slug: this.slug
      });
    }
  },
  computed: {
    computedHelp() {
      return this.$t("components.fieldSlug.help", {
        exampleUrl: `https://yourblog.com/post/<mark>${this.slug}</mark>`
      });
    },
    computedInputClass() {
      return {
        "is-danger": this.error ? true : false,
        [this.inputClass]: true
      };
    }
  }
};
</script>

<style scoped>
.slug-example {
  color: green;
}
</style>