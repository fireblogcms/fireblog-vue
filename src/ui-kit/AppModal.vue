<template>
  <div v-show="showing">
    <div class="z-30 fixed inset-0 w-full h-screen bg-white opacity-90"></div>
    <div
      class="z-30 fixed inset-0 w-full h-screen flex items-center justify-center"
      @click.self="close"
    >
      <div
        class="flex flex-col bg-white"
        :class="{
          'w-11/12 md:w-1/2 max-h-9/10 shadow-around rounded-lg': !fullscreen,
          'w-full h-screen': fullscreen,
        }"
      >
        <div class="p-6 flex items-center justify-between container mx-auto">
          <div class="flex-grow text-center">
            <slot name="header" />
          </div>

          <div
            v-if="!fullscreen"
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
import AppButton from "@/ui-kit/AppButton";

export default {
  components: {
    AppButton,
  },
  props: {
    fullscreen: {
      type: Boolean,
      default: false,
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
