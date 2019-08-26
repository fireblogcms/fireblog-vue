
<template>
  <div class="spinner">
    <AppLoader v-if="!error">Signing in ...</AppLoader>
    <div v-if="error" class="section">
      <h1 class="title is-1">Login error</h1>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script>
import apolloClient from "../lib/apolloClient";
import AppLoader from "../components/AppLoader";
import { auth0client, localLogin } from "../lib/auth";

export default {
  components: {
    AppLoader
  },
  data() {
    return {
      error: null
    };
  },
  created() {
    auth0client.parseHash((error, result) => {
      // @FIXME handle error gracefully
      if (error) {
        this.error = error;
      } else {
        localLogin(result)
          .then(r => {
            this.$router.push({ path: "/" });
          })
          .catch(error => {
            throw new Error(
              "Failed to sync auth0 user with the server. Error: " + error
            );
          });
      }
    });
  }
};
</script>
