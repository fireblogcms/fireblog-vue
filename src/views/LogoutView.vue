<template>
  <DefaultLayout>
    <AppLoader />
  </DefaultLayout>
</template>

<script>
import AppLoader from "@/ui-kit/AppLoader";
import DefaultLayout from "@/layouts/DefaultLayout";
import { auth0Client } from "@/utils/auth";
import { REQUEST_STATE } from "@/utils/helpers";

export default {
  components: {
    AppLoader,
    DefaultLayout
  },
  data() {
    return {
      requestState: REQUEST_STATE.NOT_STARTED
    };
  },
  async created() {
    const auth = await auth0Client();
    auth.logout();
  }
};
</script>
