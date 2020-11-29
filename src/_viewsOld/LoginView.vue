<template>
  <DefaultLayout>
    <AppLoader />
  </DefaultLayout>
</template>

<script>
import AppLoader from "@/ui-kit/AppLoader";
import DefaultLayout from "@/layouts/DefaultLayout";
import { auth0Client } from "@/utils/auth";

export default {
  components: {
    AppLoader,
    DefaultLayout,
  },
  async created() {
    const auth0 = await auth0Client();
    await auth0.loginWithRedirect({
      redirect_uri: `${process.env.VUE_APP_BASE_URL}/auth0-callback`,
    });
  },
};
</script>
