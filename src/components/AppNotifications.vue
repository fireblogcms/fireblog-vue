<template>
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
