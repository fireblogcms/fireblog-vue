<template>
  <div class="bg-white shadow-lg rounded-lg overflow-hidden">
    <div
      class="h-64 bg-cover bg-center"
      :style="background"
      v-if="image"
    >
      <slot name="header" />
    </div>
    <slot />
    <div class="p-6">
      <slot name="content" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    image: {
      type: String
    }
  },
  computed: {
    background() {
      return this.image.includes("gradient") ?
        { background: this.image } :
        { backgroundImage: `url(${this.image})` };
    }
  }
};
</script>
