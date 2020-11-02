<template>
  <div class="flex items-center">
    <p class="font-bold mr-10">{{ $t("components.highlightField.title") }}</p>
    <AppFieldToggle :checked="checked" @change="onToggleChange" />
  </div>
</template>

<script>
import AppFieldToggle from "@/ui-kit/AppFieldToggle";

export default {
  components: {
    AppFieldToggle,
  },
  props: {
    checked: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    onToggleChange(value) {
      this.$emit('onHighlightChange', value);
    },
  },
}
</script>
