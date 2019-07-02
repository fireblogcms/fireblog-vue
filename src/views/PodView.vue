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
      <template v-if="loadingPostError === 'FINISHED_ERROR'">{{loadingPostError}}</template>
      <template v-if="loadingPostsState === 'FINISHED_OK'">
        <div class="has-text-centered">
          <br />
          <br />
        </div>

        <template v-if="posts">
          <div v-for="edge in posts.edges" :key="edge.node._id">
            <h2 style="color:#444">
              <div class="columns">
                <div class="column">
                  <router-link
                    :to="`/pod/${edge.node._id}/write/post/${edge.node._id}`"
                  >{{edge.node.title}}</router-link>
                  <br />
                  <span class="subtitle">{{Number(edge.node.createdAt) | moment('from')}}</span>
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
      posts: null,
      loadingPodState: "NOT_STARTED",
      loadingPostsState: "NOT_STARTED",
      loadingPostError: null
    };
  },
  created() {
    this.loadPod();
    this.loadPosts();
  },
  methods: {
    loadPod() {
      this.loadingPostError = null;
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
      return podClient()
        .request(
          `
          query($filter: PostsFilter){
            posts(last:100, filter: $filter) {
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
        .then(result => {
          this.loadingPostsState = "FINISHED_OK";
          this.posts = result.posts;
        })
        .catch(e => {
          console.error("An error occured loading posts: ", e);
          this.loadingPostError = e;
          this.loadingPostsState = "FINISHED_ERROR";
        });
    }
  }
};
</script>
