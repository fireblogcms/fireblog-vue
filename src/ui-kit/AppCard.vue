<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <div
      style="height:270px"
      class="bg-cover bg-center"
      :style="background"
      v-if="image"
    >
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    image: {
      type: String,
    },
  },
  computed: {
    background() {
      return this.image.includes("gradient")
        ? { background: this.image }
        : { backgroundImage: `url(${this.image})` };
    },
  },
};
</script>
