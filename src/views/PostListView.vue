<template>
  <div class="pod-list-view content container section">
    <h1>POSTS</h1>
    <hr>
    <div v-for="post in posts" :key="post._id">
      <h2 style="color:#444">
        <router-link :to="`pod/${pod._id}`">{{pod.name}}</router-link>
      </h2>
      <hr>
    </div>
  </div>
</template>

<script>
import podClient from "../lib/podClient";
impot;

export default {
  data() {
    return {
      pods: ""
    };
  },
  created() {
    podClient()
      .request(
        `
        {
          posts {
            title, 
            content, 
            _id
          }
        }
      `
      )
      .then(r => {
        this.posts = r.posts;
      });
  }
};
</script>
