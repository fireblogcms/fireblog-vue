<template>
  <BareLayout>
    <AppLoader>Logging ...</AppLoader>
  </BareLayout>
</template>

<script>
import AppLoader from "../components/AppLoader";
import BareLayout from "../layouts/BareLayout";
import { auth0Client } from "../utils/auth";

export default {
  components: {
    AppLoader,
    BareLayout
  },
  async created() {
    const auth0 = await auth0Client();
    await auth0.loginWithRedirect({
      redirect_uri: `${process.env.VUE_APP_BASE_URL}/auth0-callback`
    });
  }
};
</script>