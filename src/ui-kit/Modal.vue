<template>
  <transition name="fade">
    <div v-if="showing">
      <div class="fixed inset-0 w-full h-screen bg-white opacity-50"></div>
      <div
        class="fixed inset-0 w-full h-screen flex items-center justify-center"
        @click.self="close"
      >
        <div class="w-1/2 bg-white shadow-lg rounded-lg">
          <div class="p-6 border-b-2 border-gray-300">
            <slot name="header" />
          </div>
          <div class="p-6">
            <slot name="body" />
          </div>
          <div class="p-6">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
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