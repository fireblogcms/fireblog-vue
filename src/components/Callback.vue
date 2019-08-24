<template>
  <div class="spinner">
    <img v-if="!error" src="../assets/loading.svg" alt="Loading" />
    <div v-if="error" class="section">
      <h1 class="title is-1">Login error</h1>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script>
import apolloClient from "../lib/apolloClient";
import { auth0client, localLogin } from "../lib/auth";

export default {
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
            this.$router.push({path: "/"});
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

<style scoped>
.spinner {
  position: absolute;
  display: flex;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: white;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
