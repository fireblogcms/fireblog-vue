<template>
  <div v-show="showing">
    <div class="z-30 fixed inset-0 w-full h-screen bg-white opacity-50"></div>
    <div
      class="z-30 fixed inset-0 w-full h-screen flex items-center justify-center"
      @click.self="close"
    >
      <div class="w-1/2 max-h-9/10 flex flex-col bg-white shadow-lg rounded-lg">
        <div class="p-6 flex items-center justify-between">
          <slot name="header" />
          <AppButton
            aria-label="close"
            size="small"
            class="ml-4"
            @click="close"
          >
            ×
          </AppButton>
        </div>
        <div class="p-6 overflow-y-auto">
          <slot name="body" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";

export default {
  components: {
    AppButton
  },
  props: {
    name: {
      type: String,
      required: true
    }
  },
  computed: {
    showing() {
      return this.$store.state.modalShowing.modals[this.name];
    }
  },
  methods: {
    close() {
      this.$store.commit("modalShowing/close", this.name);
    }
  }
};
</script>
