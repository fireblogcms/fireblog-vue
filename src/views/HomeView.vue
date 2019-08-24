<template>
  <div class="home-view">
    <div class="container header">
      <div class="content">
        <h1 class="title is-1">
          <strong>POD</strong>
        </h1>
        <h2 class="subtitle is-3">Fast headless blogging</h2>
        <br />
        <br />
        <button @click="onWriteClick" class="button is-large">WRITE</button>
      </div>
    </div>
  </div>
</template>

<script>
import { isAuthenticated, getUser, auth0client } from "../lib/auth";
import graphqlClient from "../lib/graphqlClient";
export default {
  methods: {
    onWriteClick() {
      //const user = getUser();
      this.$router.push({
        path: "/pods"
      });

      /*
      graphqlClient()
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
        */
    }
  }
};
</script>
