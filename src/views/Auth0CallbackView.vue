
<template>
  <BareLayout>
    <div class="container section">
      <AppError v-if="error">
        {{error}}.
        <br />You can
        <router-link :to="{name:'login'}">Retry to login</router-link>
      </AppError>
      <LayoutBody v-if="initDataState === 'PENDING'">
        <AppLoader>Signing in ...</AppLoader>
      </LayoutBody>
    </div>
  </BareLayout>
</template>

<script>
import BareLayout from "../layouts/BareLayout";
import AppLoader from "../components/AppLoader";
import { auth0Client, syncAuth0UserWithServer } from "../utils/auth";
import { REQUEST_STATE } from "../utils/helpers";
import LayoutBody from "../components/LayoutBody";
import AppError from "../components/AppError";
import apolloClient from "../utils/apolloClient";
import logger from "../utils/logger";

export default {
  components: {
    BareLayout,
    AppLoader,
    LayoutBody,
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
          throw new Error(error);
        });
    }
  }
};
</script>
