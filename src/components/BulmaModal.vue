<template>
  <div :class="{ 'is-active': value }" class="modal animated fadeIn">
    <div @click="onCloseClick" class="modal-background"></div>
    <div class="modal-card animated fadeInDown">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <slot name="title" />
        </p>
      </header>
      <div class="modal-card-body">
        <slot name="body" />
      </div>
      <footer style="justify-content: flex-end;" class="modal-card-foot">
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