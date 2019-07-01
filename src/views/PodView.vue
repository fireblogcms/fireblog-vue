<template>
  <AdminLayout>
    <div class="pod-list-view content container section">
      <div class="columns">
        <div class="column">
          <h1 class="title is-1 is-uppercase">{{pod.name}}</h1>
        </div>
        <div class="column">
          <router-link
            style="position: relative; top:3px;text-transform: uppercase"
            class="button is-large is-info is-pulled-right"
            :to="`/pod/${$route.params.podId}/write/post`"
          >Create a new Post</router-link>
        </div>
      </div>

      <template v-if="loadingPostsState === 'FINISHED_OK'">
        <div class="has-text-centered">
          <br />
          <br />
        </div>

        <template v-if="posts.length > 0">
          <div v-for="post in posts" :key="post._id">
            <h2 style="color:#444">
              <div class="columns">
                <div class="column">
                  <router-link :to="`/pod/${pod._id}/write/post/${post._id}`">{{post.title}}</router-link>
                  <br />
                  <span class="subtitle">{{Number(post.createdAt) | moment('from')}}</span>
                  <hr />
                </div>
              </div>
            </h2>
          </div>
        </template>
      </template>
    </div>
  </AdminLayout>
</template>

<script>
import podClient from "../lib/podClient";
import AdminLayout from "../layouts/AdminLayout";

export default {
  components: {
    AdminLayout
  },
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
      podClient()
        .request(
          `
            query($id: ID!){
              pod(_id: $id) {
                name
                description
                createdAt
                _id
              }
            }
          `,
          { id: this.$route.params.podId }
        )
        .then(r => {
          this.loadingPodState = "FINISHED_OK";
          this.pod = r.pod;
        })
        .catch(e => {
          this.loadingPodState = "FINISHED_ERROR";
        });
    },
    loadPosts() {
      this.loadingPostsState = "PENDING";
      podClient()
        .request(
          `
          query($filter: PostsFilter){
            posts(filter: $filter) {
              edges {
                node {
                  title
                  createdAt
                  _id
                }
              }
            }
          }
          `,
          { filter: { pod: this.$route.params.podId } }
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
