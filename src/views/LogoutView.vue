<template>
  <DefaultLayout class="section container">
    <AppLoader>Logging out ...</AppLoader>
  </DefaultLayout>
</template>

<script>
import { auth0Client } from "@/utils/auth";
import AppLoader from "@/components/AppLoader";
import { REQUEST_STATE } from "@/utils/helpers";
import DefaultLayout from "@/layouts/DefaultLayout";

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
