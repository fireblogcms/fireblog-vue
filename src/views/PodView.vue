<template>
  <AdminLayout>
    <portal to="navbar-start">
      <router-link class="navbar-item" :to="`/pod/${$route.params.podId}`">MY POSTS</router-link>
    </portal>

    <PodLoader v-if="requestState === 'PENDING'" />
    <div v-if="requestError">{{requestError}}</div>

    <template v-if="requestState === 'FINISHED_OK'">
      <div class="container section">
        <div class="columns">
          <div class="column">
            <h1 class="title is-1 is-uppercase">{{pod.name}}</h1>
          </div>
          <div class="column">
            <router-link
              v-if="pod.posts.edges.length > 0"
              style="position: relative; top:3px;text-transform: uppercase"
              class="button is-large is-info is-pulled-right"
              :to="`/pod/${$route.params.podId}/write/post`"
            >✏️ Write</router-link>
          </div>
        </div>

        <!-- if this is the FIRST post for this pod -->
        <template v-if="pod.posts.edges.length === 0">
          <div class="pod-container">
            <h2
              style="font-weight:200"
              class="title has-text-centered"
            >Write your first post in this pod !</h2>
            <div class="has-text-centered">
              <div style="margin:2rem">
                <router-link
                  style="position: relative; top:3px;text-transform: uppercase"
                  class="button is-large is-info"
                  :to="`/pod/${$route.params.podId}/write/post`"
                >Write</router-link>
              </div>
              <img width="100px" src="@/assets/pod-mascot.png" />
            </div>
          </div>
        </template>
      </div>

      <template v-if="pod.posts.edges.length > 0">
        <div class="container content pod-container">
          <div v-for="edge in pod.posts.edges" :key="edge.node._id">
            <h2 style="color:#444">
              <div class="columns">
                <div class="column">
                  <router-link
                    :to="`/pod/${$route.params.podId}/write/post/${edge.node._id}`"
                  >{{edge.node.title}}</router-link>
                  <br />
                  <span class="subtitle">{{Number(edge.node.createdAt) | moment('from')}}</span>
                </div>
              </div>
            </h2>
          </div>
        </div>
      </template>
    </template>
  </AdminLayout>
</template>

<script>
import podClient from "../lib/podClient";
import AdminLayout from "../layouts/AdminLayout";
import apolloClient from "../lib/apolloClient";
import gql from "graphql-tag";
import PodLoader from "../components/PodLoader";

const podAndPostsQuery = gql`
  query podAndPosts($id: ID!) {
    pod(_id: $id) {
      name
      posts {
        edges {
          node {
            _id
            title
            updatedAt
            createdAt
          }
        }
      }
    }
  }
`;

export default {
  components: {
    AdminLayout,
    PodLoader
  },
  data() {
    return {
      pod: null,
      requestState: "NOT_STARTED",
      requestError: null
    };
  },
  created() {
    apolloClient
      .query({
        query: podAndPostsQuery,
        variables: { id: this.$route.params.podId }
      })
      .then(result => {
        console.log("result", result);
        this.requestState = "FINISHED_OK";
        this.pod = result.data.pod;
      })
      .catch(error => {
        this.requestState = "FINISHED_ERROR";
        this.requestError = error;
      });
  }
};
</script>
