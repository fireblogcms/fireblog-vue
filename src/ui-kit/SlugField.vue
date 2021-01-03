<template>
  <div>
    <label class="font-bold">
      {{ label }}
    </label>

    <div class="flex">
      <AppFieldText
        class="flex-1 mr-1"
        :value="value"
        @change="onSlugChange"
        @input="$emit('input', value)"
        @inputDebounced="onInputDebounced"
        :disabled="locked"
        :error="error"
        :loading="loading"
        placeholder="slug"
      />
      <AppButton v-show="showToggleLockButton" @click="onButtonClick">
        {{
          locked
            ? $t("components.slugField.unlock") + " 🔐"
            : $t("components.slugField.lock") + " 🔓"
        }}
      </AppButton>
    </div>
    <p v-if="help" v-html="help" class="text-sm italic mt-2" />

    <AppModal name="unlockConfirmModal">
      <div class="text-xl font-bold" slot="header">
        {{ $t("components.slugField.unlockConfirmModal.title") }}
      </div>
      <template #body>
        <p>
          {{ $t("components.slugField.unlockConfirmModal.content") }}
        </p>
        <div
          class="flex flex-col md:flex-row items-center justify-center mt-10"
        >
          <AppButton
            class="mx-4"
            color="primary-outlined"
            @click="closeUnlockConfirmModal"
          >
            {{ $t("global.cancel") }}
          </AppButton>
          <AppButton
            class="mt-4 md:mt-0 mx-4"
            color="primary"
            @click="onConfirmUnlockClick"
          >
            {{ $t("components.slugField.unlockConfirmModal.confirmButton") }}
          </AppButton>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppFieldText from "@/ui-kit/AppFieldText";
import AppModal from "@/ui-kit/AppModal";
import i18n from "@/i18n";

export default {
  components: {
    AppButton,
    AppFieldText,
    AppModal,
  },
  props: {
    value: {
      type: String,
      required: true,
    },
    error: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: i18n.t("components.slugField.label"),
    },
    help: {
      type: String,
    },
    inputClass: {
      type: String,
      default: "is-medium",
    },
    locked: {
      type: Boolean,
      default: true,
    },
    showToggleLockButton: {
      type: Boolean,
      default: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      slug: this.value,
    };
  },
  beforeUpdate() {
    if (this.slug === "") {
      this.onSlugInput(this.value);
    }
  },
  methods: {
    closeUnlockConfirmModal() {
      this.$store.commit("modalShowing/close", "unlockConfirmModal");
    },
    onInputDebounced(value) {
      this.$emit("inputDebounced", value);
    },
    onSlugChange(value) {
      this.$emit("change", value);
    },
    onSlugInput(event) {
      this.$emit("input", this.slug);
    },
    onButtonClick() {
      if (this.locked) {
        this.$store.commit("modalShowing/open", "unlockConfirmModal");
      } else {
        this.$emit("onLock");
      }
    },
    onConfirmUnlockClick() {
      this.$emit("onUnlock");
      this.closeUnlockConfirmModal();
    },
  },
  computed: {
    computedHelp() {
      return this.$t("components.slugField.help", {
        exampleUrl: `https://example.com/post/<span class="font-bold text-primary">${this.slug}</span>`,
      });
    },
  },
};
</script>
