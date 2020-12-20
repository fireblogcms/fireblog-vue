<template>
  <div v-show="showing" class="">
    <div class="z-30 fixed inset-0 w-full h-screen bg-white opacity-90"></div>
    <div
      class="z-30 fixed inset-0 w-full h-screen flex items-center justify-center"
      @click.self="close"
    >
      <div
        class="flex flex-col bg-white animate__animated animate__fadeInUpBig animate__faster"
        :class="{
          'w-11/12 max-w-md max-h-9/10 shadow-around rounded-lg':
            width === 'sm',
          'w-11/12 md:max-w-900 max-h-9/10 shadow-around rounded-lg':
            width === 'md',
          'w-full h-screen': width === 'fullscreen',
        }"
      >
        <div class="p-6 flex items-center justify-between container mx-auto">
          <div class="flex-grow text-center">
            <slot name="header" />
          </div>

          <div
            v-if="width !== 'fullscreen'"
            @click="close"
            class="font-bold cursor-pointer"
          >
            <img width="15" src="/images/icon-close.png" />
          </div>
        </div>
        <div class="p-6 overflow-y-auto">
          <slot name="body" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    width: {
      type: String,
      // "fullscreen", "md", "sm"
      default: "md",
    },
    name: {
      type: String,
      required: true,
    },
  },
  computed: {
    showing() {
      return this.$store.state.modalShowing.modals[this.name];
    },
  },
  methods: {
    close() {
      this.$store.commit("modalShowing/close", this.name);
    },
  },
};
</script>
