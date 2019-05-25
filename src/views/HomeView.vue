<template>
  <div class="home-view">
    <div class="container header">
      <div class="content">
        <h1 class="title is-1">
          <strong>POD</strong>
        </h1>
        <h2 class="subtitle is-3">Fast headless blog engine</h2>
        <br>
        <br>
        <button @click="onWriteClick" class="button">WRITE</button>
      </div>
    </div>
  </div>
</template>

<script>
import auth from "../lib/authService";
import podClient from "../lib/podClient";
export default {
  methods: {
    onWriteClick() {
      if (!auth.isAuthenticated()) {
        auth.login({ target: "/callback" });
      } else {
        const user = this.$auth.getUser();
        console.log("user", user);
        podClient
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
                auth0_user_id: user.sub
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
  }
};
</script>
