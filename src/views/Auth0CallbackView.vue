
<template>
  <AdminLayout>
    <div class="container section">
      <AppError v-if="error">
        {{error}}.
        <br />You can
        <router-link to="/login">Retry to login</router-link>
      </AppError>
      <LayoutBody v-if="initDataState === 'PENDING'">
        <AppLoader>Signing in ...</AppLoader>
      </LayoutBody>
    </div>
  </AdminLayout>
</template>

<script>
import apolloClient from "../utils/apolloClient";
import AppLoader from "../components/AppLoader";
import { auth0Client, syncAuth0UserWithServer } from "../utils/auth";
import { REQUEST_STATE } from "../utils/helpers";
import LayoutBody from "../components/LayoutBody";
import AdminLayout from "../layouts/AdminLayout";
import AppError from "../components/AppError";
import logger from "../utils/logger";

export default {
  components: {
    AppLoader,
    LayoutBody,
    AppError,
    AdminLayout
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
          return syncAuth0UserWithServer({
            auth0Id: user.sub,
            email: user.email,
            name: user.name,
            picture: user.picture ? user.picture : null
          });
        })
        .then(() => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
          this.$router.push("/");
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          this.error = "Sorry, authentication failed";
          logger.error(error);
        });
    }
  }
};
</script>
