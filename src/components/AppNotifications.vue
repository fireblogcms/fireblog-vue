<template>
  <div
    v-if="showNotification"
    @click="closeNotification"
    style="margin-top:40px;"
    :class="classes"
    class="container notification has-text-centered animated flipInX"
  >
    <button @click="closeNotification" class="delete"></button>
    {{ notification.message }}
  </div>
</template>

<script>
import Store from "../store";

export default {
  data() {
    return {
      showNotification: false
    };
  },
  methods: {
    closeNotification() {
      this.$store.commit("notification", null);
    }
  },
  computed: {
    notification() {
      return this.$store.state.global.notification;
    },
    classes() {
      return {
        "is-primary ": this.notification.type === "info",
        "is-danger": this.notification.type === "error"
      };
    }
  },
  watch: {
    notification(value) {
      this.showNotification = value === null ? false : true;
    }
  }
};
</script>

<style scoped>
.notification {
  position: fixed;
  top: 38px;
  left: 0; /* Left edge at left for now */
  right: 0;
  z-index: 999;
  width: 100%;
}
</style>
