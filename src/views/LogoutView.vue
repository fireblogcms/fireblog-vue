<template>
  <div class="section container">
    <AppLoader>Logging out ...</AppLoader>
  </div>
</template>

<script>
import { auth0Client } from "../utils/auth";
import AppLoader from "../components/AppLoader";
import { REQUEST_STATE } from "../utils/helpers";

export default {
  components: {
    AppLoader
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

