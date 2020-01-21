<template>
  <div id="app">
    <AppNotifications />
    <router-view />
  </div>
</template>

<script>
import AppTopBar from "@/components/AppTopBar";
import AppNotifications from "@/components/AppNotifications";

export default {
  components: {
    AppNotifications
  }
};
</script>
