<template>
  <Transition name="fade">
    <div v-if="showing">
      <div class="fixed inset-0 w-full h-screen bg-white opacity-50"></div>
      <div
        class="fixed inset-0 w-full h-screen flex items-center justify-center"
        @click.self="close"
      >
        <div class="w-1/2 bg-white shadow-lg rounded-lg">
          <div class="p-6 flex justify-between">
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
          <div class="p-6">
            <slot name="body" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";

export default {
  components: {
    AppButton
  },
  props: {
    showing: {
      required: true,
      type: Boolean
    }
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
};
</script>

<style>
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.4s;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
</style>