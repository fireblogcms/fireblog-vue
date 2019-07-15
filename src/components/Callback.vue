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
import podClient from "../lib/podClient";
import { auth0client, localLogin } from "../lib/auth";

export default {
  data() {
    return {
      error: null
    };
  },
  methods: {
    /*
    handleLoginEvent(data) {
      console.log("data", data);
      if (!data.error) {
        this.$router.push(data.state.target || "/");
        // if user has no pod, redirect him to pod creation page.
        // if he already has pods, ask him in which one he wants to write
        podClient()
          .request(
            `
            query($filter: PodsFilter){
              pods(filter: $filter) {
                name, 
                description, 
                _id
              }
            }
          `,
            {
              filter: {
                auth0_user_id: data.profile.sub
              }
            }
          )
          .then(r => {
            if (r.pods.length === 0) {
              this.$router.push({
                path: "/pod/create",
                query: { first: true }
              });
            } else {
              this.$router.push("/pods");
            }
          });
      }
    }
    */
  },
  created() {
    auth0client.parseHash((error, result) => {
      // @FIXME handle error gracefully
      if (error) {
        this.error = error;
      } else {
        localLogin(result)
          .then(r => {
            console.log("r", r);
            this.$router.push({
              path: "/pods"
            });
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
