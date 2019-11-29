<template>
  <div :class="{ 'is-active': value, fullscreen: fullscreen }" class="bulma-modal modal">
    <div @click="onCloseClick" class="modal-background"></div>
    <div :class="{ [animation]: animation ? true : false }" class="modal-card animated">
      <header v-if="this.$slots.title" class="modal-card-head">
        <p class="modal-card-title">
          <slot name="title" />
        </p>
      </header>
      <div class="modal-card-body">
        <slot name="body" />
      </div>
      <footer
        v-if="this.$slots.footer"
        style="justify-content: center;"
        class="modal-card-foot"
        :class="{ 'is-white': whiteFooter }"
      >
        <slot name="footer">
          <button @click="onCloseClick" class="button">Close</button>
        </slot>
      </footer>
    </div>
    <!--<button @click="onCloseClick" class="modal-close is-large" aria-label="close"></button>-->
  </div>
</template>

<script>
export default {
  props: {
    animation: {
      type: [String, null],
      default: null
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    whiteFooter: {
      type: Boolean,
      default: false
    },
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

<style>
.bulma-modal.fullscreen .modal-content,
.bulma-modal.fullscreen .modal-card {
  width: 100%;
  height: 100%;
  border-radius: 6px;
}

.bulma-modal.fullscreen .modal-card-title {
  padding: 0px 10px;
}

.bulma-modal.fullscreen .modal-card-body {
  padding: 40px 0;
}

.bulma-modal.fullscreen .modal-close {
  background: black;
}
.bulma-modal.fullscreen .modal-background {
  background: white;
}
.bulma-modal .modal-card-foot {
  background-color: white;
  border: 0;
}
.bulma-modal .modal-card-head {
  background-color: white;
}
</style>
