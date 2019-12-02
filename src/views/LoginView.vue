<template>
  <div>
    <AppLoader>Logging ...</AppLoader>
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
    await auth0.loginWithRedirect({
      redirect_uri: `${process.env.VUE_APP_BASE_URL}/auth0-callback`
    });
  }
};
</script>
