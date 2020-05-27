<template>
  <div>
    <label class="font-bold">
      {{ label }}
    </label>
    <p v-if="computedHelp" v-html="computedHelp" class="text-sm italic mb-2" />

    <div class="flex">
      <AppFieldText
        class="flex-1"
        :value="value"
        @input="onSlugInput"
        :disabled="locked"
        :error="error"
        placeholder="slug"
      />
      <AppButton
        color="primary"
        @click="onButtonClick"
      >
        {{
          locked
            ? $t("components.slugField.unlock") + " 🔐"
            : $t("components.slugField.lock") + " 🔓"
        }}
      </AppButton>
    </div>

    <AppModal name="unlockConfirmModal">
      <div class="text-4xl font-bold" slot="header">
        {{ $t("components.slugField.unlockConfirmModal.title") }}
      </div>
      <template #body>
        <p>
          {{ $t("components.slugField.unlockConfirmModal.content") }}
        </p>
        <div class="flex flex-col md:flex-row items-center justify-center mt-10">
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
import { createSlug } from "@/utils/helpers";

export default {
  components: {
    AppButton,
    AppFieldText,
    AppModal
  },
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
      default: i18n.t("components.slugField.label")
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
    },
    locked: {
      type: Boolean,
      default: true
    },
    showToggleLockButton: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      source: this.value,
      slug: this.value
    };
  },
  methods: {
    closeUnlockConfirmModal() {
      this.$store.commit("modalShowing/close", "unlockConfirmModal");
    },
    onSlugInput(event) {
      this.slug = createSlug(event.target.value);
      this.$emit("input", {
        source: event.target.value,
        slug: this.slug
      });
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
    }
  },
  computed: {
    computedHelp() {
      return this.$t("components.slugField.help", {
        exampleUrl: `https://example.com/post/<mark>${this.slug}</mark>`
      });
    }
  }
};
</script>
