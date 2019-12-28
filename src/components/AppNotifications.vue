<template>
  <div
    v-if="$store.state.global.notification"
    @click="$store.state.global.notification = null"
    style="margin-top:40px;"
    :class="{
      'is-primary ': $store.state.global.notification.type === 'info',
      'is-danger': $store.state.global.notification.type === 'error'
    }"
    class="container notification has-text-centered animated flipInX"
  >
    <button @click="$store.commit('notification', null)" class="delete"></button>
    {{ $store.state.global.notification.message }}
  </div>
</template>

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
