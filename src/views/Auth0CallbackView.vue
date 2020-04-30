<template>
  <div class="container section">
    <div class="has-text-centered" v-if="error">
      <router-link :to="{ name: 'logout' }">Retry to login</router-link>
    </div>
    <AppPanel v-if="initDataState === 'PENDING'">
      <AppLoader>Signing in ...</AppLoader>
    </AppPanel>
  </div>
</template>

<script>
import AppLoader from "@/components/AppLoader";

import { auth0Client, syncAuth0UserWithServer } from "@/utils/auth";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import AppPanel from "@/components/AppPanel";
import apolloClient from "@/utils/apolloClient";

export default {
  components: {
    AppLoader,
    AppPanel
  },
  data() {
    return {
      error: null,
      initDataState: REQUEST_STATE.NOT_STARTED
    };
  },
  async created() {
    this.initData();
  },
  methods: {
    async initData() {
      this.error = null;
      this.initDataState = REQUEST_STATE.PENDING;
      const auth0 = await auth0Client();
      auth0
        .handleRedirectCallback()
        .then(async r => {
          return auth0.getUser();
        })
        .then(user => {
          // copy auth0 user to our database
          return syncAuth0UserWithServer();
        })
        .then(() => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
          this.$router.push("/");
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          this.error = "Sorry, authentication failed";
          toast(this, this.error, "error");
          throw new Error(error);
        });
    }
  }
};
</script>
