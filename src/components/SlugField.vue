<template>
  <div :class="{ 'is-locked': locked }">
    <div class="field">
      <label>
        {{ label }}
        <p v-if="computedHelp" class="help" v-html="computedHelp" />
      </label>
    </div>

    <div class="field has-addons">
      <div style="width:100%" class="control">
        <input
          @input="onSlugInput"
          :value="value"
          :disabled="locked"
          class="input"
          :class="computedInputClass"
          type="text"
          placeholder="slug"
        />
      </div>
      <div v-if="showToggleLockButton" class="control">
        <button
          @click="onButtonClick"
          class="button is-medium is-primary is-light"
        >
          {{
            locked
              ? $t("components.slugField.unlock") + "  🔐"
              : $t("components.slugField.lock") + "  🔓"
          }}
        </button>
      </div>
      <p class="help is-danger" v-if="error">{{ error }}</p>

      <BulmaModal :fullscreen="false" v-model="showUnlockConfirmModal">
        <template #title>
          <div class="has-text-centered">
            {{ $t("components.slugField.unlockConfirmModal.title") }}
          </div>
        </template>
        <template #body>
          <div class="has-text-centered">
            {{ $t("components.slugField.unlockConfirmModal.content") }}
          </div>
        </template>
        <template class="has-text-centered" #footer>
          <button
            @click="showUnlockConfirmModal = false"
            class="button is-light is-large"
          >
            {{ $t("components.slugField.unlockConfirmModal.cancelButton") }}
          </button>
          <button
            @click="onConfirmUnlockClick"
            class="button is-primary is-large is-danger"
          >
            {{ $t("components.slugField.unlockConfirmModal.confirmButton") }}
          </button>
        </template>
      </BulmaModal>
    </div>
  </div>
</template>

<script>
import i18n from "../i18n";
import { createSlug } from "../utils/helpers";
import BulmaModal from "../components/BulmaModal";

export default {
  components: {
    BulmaModal
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
      slug: this.value,
      showUnlockConfirmModal: false
    };
  },
  methods: {
    onSlugInput(event) {
      this.slug = createSlug(event.target.value);
      this.$emit("input", {
        source: event.target.value,
        slug: this.slug
      });
    },
    onButtonClick() {
      if (this.locked) {
        this.showUnlockConfirmModal = true;
      } else {
        this.$emit("onLock");
      }
    },
    onConfirmUnlockClick() {
      this.$emit("onUnlock");
      this.showUnlockConfirmModal = false;
    }
  },
  computed: {
    computedHelp() {
      return this.$t("components.slugField.help", {
        exampleUrl: `https://example.com/post/<mark>${this.slug}</mark>`
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