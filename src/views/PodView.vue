<template>
  <AdminLayout>
    <PodLoader v-if="requestState === 'PENDING'" />
    <div v-if="requestError">{{requestError}}</div>

    <template v-if="requestState === 'FINISHED_OK'">
      <div class="container" style="padding:0 0px 30px">
        <div class="columns">
          <div class="column is-two-thirds">
            <h1 class="title is-1 is-uppercase">
              <img
                style="height:80px !important;position:relative;top:25px;padding-right:1rem"
                src="/images/book.png"
              />
              {{pod.name}}
            </h1>
          </div>
          <div class="column">
            <router-link
              v-if="pod.posts.edges.length > 0"
              style="position: relative; top:30px;text-transform: uppercase"
              class="button is-large is-pulled-right is-outlined"
              :to="`/pod/${$route.params.podId}/write/post`"
            >
              Write
              <img style="height:70px" src="/images/feather.webp" />
            </router-link>
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
        <div class="tabs is-medium is-centered" style="position:relative;margin-bottom:0;top:1px">
          <ul style="border-bottom:0">
            <li @click="onStatusClick('PUBLISHED')" class="is-active">
              <a>
                <img style="height:30px;padding-right:5px" src="/images/published.png" /> Published ( 18 )
              </a>
            </li>
            <li @click="onStatusClick('DRAFT')">
              <a>
                <img style="height:30px;padding-right:5px" src="/images/draft.png" /> Draft ( 4 )
              </a>
            </li>
          </ul>
        </div>
        <div class="container content pod-container">
          <div v-for="edge in pod.posts.edges" :key="edge.node._id">
            <h2 style="color:#444">
              <div class="columns">
                <div class="column">
                  <router-link :to="`/pod/${$route.params.podId}/write/post/${edge.node._id}`">
                    {{edge.node.title}}
                    <span class="subtitle">{{edge.node.status}}</span>
                  </router-link>
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
  query podAndPosts($id: ID!, $status: PostPublicationStatus) {
    pod(_id: $id) {
      name
      posts(last: 50, filter: { status: $status }) {
        edges {
          node {
            _id
            title
            updatedAt
            createdAt
            status
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
        variables: { id: this.$route.params.podId, status: "PUBLISHED" }
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
  },
  methods: {
    onStatusClick(status) {
      apolloClient
        .query({
          query: podAndPostsQuery,
          variables: { id: this.$route.params.podId, status: status }
        })
        .then(result => {
          this.requestState = "FINISHED_OK";
          this.pod = result.data.pod;
        })
        .catch(error => {
          this.requestState = "FINISHED_ERROR";
          this.requestError = error;
        });
    }
  }
};
</script>
