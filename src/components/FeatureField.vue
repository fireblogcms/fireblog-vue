<template>
  <div class="flex items-center justify-between">
    <div>
      <p class="font-bold mr-10">{{ $t("components.featureField.title") }}</p>
      <p class="text-sm italic">
        {{ $t("components.featureField.description") }}
      </p>
    </div>
    <AppFieldToggle :checked="checked" @change="onToggleChange" class="mr-6" />
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
      this.$emit("onFeatureChange", value);
    },
  },
};
</script>
