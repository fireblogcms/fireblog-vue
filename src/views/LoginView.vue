<template>
  <div class="container">
    <div class="section">
      <AppLoader>Logging ...</AppLoader>
    </div>
  </div>
</template>

<script>
import AppLoader from "../components/AppLoader";
import { auth0Client } from "../utils/auth";

export default {
  components: {
    AppLoader
  },
  async created() {
    const auth0 = await auth0Client();
    const isAuthenticated = await auth0.isAuthenticated();
    if (!isAuthenticated) {
      await auth0.loginWithRedirect({
        redirect_uri: `${process.env.VUE_APP_BASE_URL}/auth0-callback`
      });
    } else {
      this.$router.push({ name: "blogList" });
    }
  }
};
</script>