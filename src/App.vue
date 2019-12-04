<template>
  <div id="app">
    <div
      v-if="$store.state.notification"
      @click="$store.state.notification = null"
      style="margin-top:40px;"
      :class="{
        'is-primary ': $store.state.notification.type === 'notification', 
        'is-danger': $store.state.notification.type === 'error'
      }"
      class="container notification has-text-centered animated flipInX"
    >
      <button @click="$store.state.notification = null" class="delete"></button>
      {{$store.state.notification.message}}
    </div>
    <router-view :key="$route.fullPath" />
  </div>
</template>

<script>
import AppTopBar from "@/components/AppTopBar";

export default {
  components: {
    AppTopBar
  },
  methods: {
    TopbarIsVisible() {
      let visible = true;
      const hideForRoutes = ["auth0Callback"];
      if (hideForRoutes.includes(this.$route.name)) {
        visible = false;
      }
      return visible;
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


