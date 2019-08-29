
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
import { auth0Client, syncUserWithServer } from "../lib/auth";

export default {
  components: {
    AppLoader
  },
  data() {
    return {
      error: null
    };
  },
  async created() {
    const auth0 = await auth0Client();
    auth0.handleRedirectCallback().then(async r => {
      const user = await auth0.getUser();
      syncUserWithServer({
        _id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture ? user.picture : null
      });
      this.$router.push("/");
    });
  }
};
</script>
