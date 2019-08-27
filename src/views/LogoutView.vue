<template>
  <div class="section container">
    <AppLoader>Logging out ...</AppLoader>
  </div>
</template>

<script>
import { logout } from "../lib/auth";
import AppLoader from "../components/AppLoader";

export default {
  components: {
    AppLoader
  },
  async created() {
    logout();
    window.location.replace(process.env.VUE_APP_SITE_BASE_URL);
  }
};
</script>

