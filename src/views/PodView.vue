<template>
  <div class="pod-list-view content container section">
    <h1>Pod - {{pod.name}}</h1>
    <hr>
    <template v-if="loadingPostsState === 'FINISHED_OK'">
      <template v-if="posts.length === 0">
        <div class="card">
          <div class="card-content">
            <div class="content has-text-centered">
              No created posts yet.
              <br>
              <br>
              <router-link
                class="button is-large is-info is-outlined"
                :to="`/pod/${$route.params.podId}/write`"
              >Create a new Post</router-link>
            </div>
          </div>
        </div>
      </template>
      <template v-if="posts.length > 0">
        <div v-for="post in posts" :key="post._id">
          <h2 style="color:#444">
            <div class="columns">
              <div class="column">
                <router-link :to="`/pod/${pod._id}/post/${post._id}`">{{post.title}}</router-link>
              </div>
            </div>
          </h2>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import podClient from "../lib/podClient";

export default {
  data() {
    return {
      pod: "",
      loadingPodState: "NOT_STARTED",
      loadingPostsState: "NOT_STARTED"
    };
  },
  created() {
    this.loadPod();
    this.loadPosts();
  },
  methods: {
    loadPod() {
      this.loadingPodState = "PENDING";
      podClient
        .request(
          `
    query($id: ID!){
      pod(id: $id) {
        name, 
        description, 
        _id
      }
    }
    `,
          { id: this.$route.params.podId }
        )
        .then(r => {
          this.loadingPodState = "FINISHED_OK";
          console.log(r);
          this.pod = r.pod;
        })
        .catch(e => {
          this.loadingPodState = "FINISHED_ERROR";
        });
    },
    loadPosts() {
      this.loadingPostsState = "PENDING";
      podClient
        .request(
          `
          query($filter: PostsFilter){
            posts(filter: $filter) {
              title
            }
          }
          `,
          { filter: { pod_id: this.$route.params.podId } }
        )
        .then(r => {
          this.loadingPostsState = "FINISHED_OK";
          this.posts = r.posts;
        })
        .catch(e => {
          this.loadingPostsState = "FINISHED_ERROR";
        });
    }
  }
};
</script>
