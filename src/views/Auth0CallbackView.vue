<template>
  <div class="container section">
    <AppError v-if="error">
      {{ error }}.
      <br />You can
      <router-link :to="{ name: 'login' }">Retry to login</router-link>
    </AppError>
    <AppPanel v-if="initDataState === 'PENDING'">
      <AppLoader>Signing in ...</AppLoader>
    </AppPanel>
  </div>
</template>

<script>
import AppLoader from "../components/AppLoader";
import { auth0Client, syncAuth0UserWithServer } from "../utils/auth";
import { REQUEST_STATE } from "../utils/helpers";
import AppPanel from "../components/AppPanel";
import AppError from "../components/AppError";
import apolloClient from "../utils/apolloClient";
import logger from "../utils/logger";

export default {
  components: {
    AppLoader,
    AppPanel,
    AppError
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
          throw new Error(error);
        });
    }
  }
};
</script>
