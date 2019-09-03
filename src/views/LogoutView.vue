<template>
  <div class="section container">
    <AppLoader>Logging out ...</AppLoader>
  </div>
</template>

<script>
import { auth0Client } from "../lib/auth";
import AppLoader from "../components/AppLoader";
import { LOADING_STATE } from "../lib/helpers";

export default {
  components: {
    AppLoader
  },
  data() {
    return {
      requestState: LOADING_STATE.NOT_STARTED
    };
  },
  async created() {
    const auth = await auth0Client();
    auth.logout({ returnTo: process.env.VUE_APP_SITE_BASE_URL });
  }
};
</script>

