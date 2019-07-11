<template>
  <AdminLayout>
    <PodLoader v-if="podAndPostsQueryState === 'PENDING'" />
    <div v-if="requestError">{{requestError}}</div>

    <template
      v-if="podAndPostsQueryState === 'FINISHED_OK' && allPostsQueryState === 'FINISHED_OK'"
    >
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
              v-if="allPosts.edges.length > 0"
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
        <template v-if="allPosts.edges.length === 0">
          <div class="pod-container">
            <h2
              style="font-weight:200"
              class="title has-text-centered"
            >Write your first post in this pod !</h2>
            <div class="has-text-centered">
              <div style="margin:2rem">
                <!--
                <router-link
                  style="position: relative; top:3px;text-transform: uppercase"
                  class="button is-large is-info"
                  :to="`/pod/${$route.params.podId}/write/post`"
                >Write</router-link>
                -->
                <router-link
                  style="box-shadow: 0px 4px 5px rgba(229, 229, 229, 1);position: relative; top:30px;text-transform: uppercase"
                  class="button is-large is-outlined"
                  :to="`/pod/${$route.params.podId}/write/post`"
                >
                  Write
                  <img style="height:70px" src="/images/feather.webp" />
                </router-link>
              </div>
              <img style="padding-top:3rem" width="100px" src="@/assets/pod-mascot.png" />
            </div>
          </div>
        </template>
      </div>

      <template v-if="allPosts.edges.length > 0">
        <div class="container tabs is-medium" style="position:relative;margin-bottom:0;top:1px">
          <ul style="border-bottom:0">
            <li
              @click="onStatusClick('PUBLISHED')"
              :class="{'is-active': activeStatus == 'PUBLISHED' }"
            >
              <a>
                <img style="height:30px;padding-right:5px" src="/images/published.png" /> Published
              </a>
            </li>
            <li @click="onStatusClick('DRAFT')" :class="{'is-active': activeStatus == 'DRAFT' }">
              <a>
                <img style="height:30px;padding-right:5px" src="/images/draft.png" /> Draft
              </a>
            </li>
            <li @click="onStatusClick('BIN')" :class="{'is-active': activeStatus == 'BIN' }">
              <a>
                <img style="height:30px;padding-right:5px" src="/images/bin.png" /> Bin
              </a>
            </li>
          </ul>
        </div>
        <div class="container content pod-container">
          <template v-if="pod.posts.edges.length === 0">
            No post are in {{activeStatus}} status for now. Check your
            <a
              @click.prevent="onStatusClick('DRAFT')"
            >draft</a> posts ?
          </template>
          <template v-if="pod.posts.edges.length > 0">
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
          </template>
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

// get allPosts, with any publication status
const allPostsQuery = gql`
  query allPostsQuery($pod: ID!) {
    posts(filter: { pod: $pod }, last: 1) {
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
`;

const podAndPostsQuery = gql`
  query podAndPosts($id: ID!, $status: PostPublicationStatus) {
    pod(_id: $id) {
      name
      posts(last: 100, filter: { status: $status }) {
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
      allPosts: null,
      activeStatus: "PUBLISHED",
      pod: null,
      podAndPostsQueryState: "NOT_STARTED",
      allPostsQueryState: "NOT_STARTED",
      requestError: null
    };
  },
  created() {
    this.getAllPosts();
    this.getPodAndPosts();
  },
  methods: {
    async getAllPosts() {
      this.allPostsQueryState = "PENDING";
      const result = await apolloClient
        .query({
          query: allPostsQuery,
          variables: { pod: this.$route.params.podId }
        })
        .then(result => {
          this.allPostsQueryState = "FINISHED_OK";
          this.allPosts = result.data.posts;
        })
        .catch(error => {
          this.allPostsQueryState = "FINISHED_ERROR";
          this.allPostsQueryError = error;
        });
    },
    getPodAndPosts() {
      return apolloClient
        .query({
          query: podAndPostsQuery,
          variables: { id: this.$route.params.podId, status: this.activeStatus }
        })
        .then(result => {
          console.log("result", result);
          this.podAndPostsQueryState = "FINISHED_OK";
          this.pod = result.data.pod;
        })
        .catch(error => {
          this.podAndPostsQueryState = "FINISHED_ERROR";
          this.requestError = error;
        });
    },
    onStatusClick(status) {
      this.activeStatus = status;
      apolloClient
        .query({
          query: podAndPostsQuery,
          variables: { id: this.$route.params.podId, status: status }
        })
        .then(result => {
          this.podAndPostsQueryState = "FINISHED_OK";
          this.pod = result.data.pod;
        })
        .catch(error => {
          this.podAndPostsQueryState = "FINISHED_ERROR";
          this.requestError = error;
        });
    }
  },
  // trigger again graphql request when podId change in url.
  watch: {
    $route(to, from) {
      this.getAllPosts();
      this.getPodAndPosts();
    }
  }
};
</script>
