<template>
  <div :class="{ 'is-active': value }" class="modal animated fadeIn">
    <div @click="onCloseClick" class="modal-background"></div>
    <div class="modal-card animated fadeInDown">
      <header v-if="this.$slots.title" class="modal-card-head">
        <p class="modal-card-title">
          <slot name="title" />
        </p>
      </header>
      <div class="modal-card-body">
        <slot name="body" />
      </div>
      <footer v-if="this.$slots.footer" style="justify-content: center;" class="modal-card-foot">
        <slot name="footer">
          <button @click="onCloseClick" class="button">Close</button>
        </slot>
      </footer>
    </div>
    <button @click="onCloseClick" class="modal-close is-large" aria-label="close"></button>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      showModal: false
    };
  },
  methods: {
    onCloseClick() {
      this.$emit("input", false);
    }
  }
};
</script>