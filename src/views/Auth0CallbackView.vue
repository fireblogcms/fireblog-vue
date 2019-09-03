
<template>
  <div class="container section">
    <LayoutBody>
      <AppLoader v-if="initState === 'PENDING'">Signing in ...</AppLoader>
      <div v-if="initState === 'COMPLETE_ERROR'" class="section">
        <p>
          Sorry, an error occured Please try again
          <router-link :to="{name:'blogList'}">to log in</router-link>
        </p>
        <br />
        <pre class="notification is-danger">{{ initStateError }}</pre>
      </div>
    </LayoutBody>
  </div>
</template>

<script>
import apolloClient from "../lib/apolloClient";
import AppLoader from "../components/AppLoader";
import { auth0Client, syncAuth0UserWithServer } from "../lib/auth";
import { LOADING_STATE } from "../lib/helpers";
import LayoutBody from "../components/LayoutBody";
import * as Sentry from "@sentry/browser";

export default {
  components: {
    AppLoader,
    LayoutBody
  },
  data() {
    return {
      error: null,
      initState: LOADING_STATE.NOT_STARTED,
      initStateError: null
    };
  },
  async created() {
    this.initState = LOADING_STATE.PENDING;
    this.initStateError = null;
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
        this.initState = LOADING_STATE.COMPLETE_OK;
        this.$router.push("/");
      })
      .catch(e => {
        this.initState = LOADING_STATE.COMPLETE_ERROR;
        this.initStateError = e;
        Sentry.captureException(new Error(e));
      });
  }
};
</script>
