<template>
  <AdminLayout>
    <Notify :errors="notifications.errors" :infos="notifications.infos" />
    <portal to="topbar-left">
      <router-link class="item" :to="{name:'blogList'}">
        <span><</span>
        Back to my blogs
      </router-link>
    </portal>

    <header
      v-if="initRequestsState === 'FINISHED_OK'"
      class="container"
      style="padding: 0 0 2rem 0"
    >
      <h1 class="title is-uppercase">
        <img
          style="height:70px !important;position:relative;top:20px;padding-right:1rem"
          src="/images/book.png"
        />
        {{pod.name}}
        <ButtonLink
          style="margin-top:20px"
          class="is-pulled-right"
          type="primary"
          :to="{name: 'postCreate', params:{blogId:$route.params.blogId}}"
        >
          <span>WRITE NEW POST</span>
        </ButtonLink>
      </h1>
    </header>

    <template v-if="initRequestsState === 'PENDING'">
      <PodLoader />
    </template>
    <template v-if="isFirstPost === true">
      <div class="container pod-container">
        <h2
          style="font-weight:200"
          class="title has-text-centered"
        >Write your first post in this pod !</h2>
        <div class="has-text-centered">
          <div style="margin:2rem">
            <router-link
              style="box-shadow: 0px 4px 5px rgba(229, 229, 229, 1);position: relative; top:30px;text-transform: uppercase"
              class="button is-large is-outlined"
              :to="{name: 'postCreate', params:{blogId:$route.params.blogId}}"
            >
              Write
              <img style="height:70px" src="/images/feather.webp" />
            </router-link>
          </div>
          <img style="padding-top:3rem" width="100px" src="@/assets/pod-mascot.png" />
        </div>
      </div>
    </template>
    <template v-if="!isFirstPost">
      <section class="container">
        <div class="tabs is-boxed is-medium" style="position:relative;margin-bottom:0;">
          <ul style="border-bottom:0">
            <li
              @click="onStatusClick('PUBLISHED')"
              :class="{ 'is-active': activeStatus == 'PUBLISHED' }"
            >
              <a>
                <img style="height:30px;padding-right:5px" src="/images/published.png" />
                Published
              </a>
            </li>
            <li @click="onStatusClick('DRAFT')" :class="{ 'is-active': activeStatus == 'DRAFT' }">
              <a>
                <img style="height:30px;padding-right:5px" src="/images/draft.png" />
                Draft
              </a>
            </li>
            <li @click="onStatusClick('BIN')" :class="{ 'is-active': activeStatus == 'BIN' }">
              <a>
                <img style="height:30px;padding-right:5px" src="/images/bin.png" />
                Bin
              </a>
            </li>
          </ul>
        </div>
        <div class="container content pod-container" style="border-top-left-radius:0;">
          <template v-if="postsRequestState === 'PENDING'">
            <PodLoader />
          </template>
          <template v-if="postsRequestState === 'FINISHED_OK'">
            <template
              v-if="posts.edges.length === 0"
            >No post are in {{ activeStatus }} status for now.</template>
            <template v-if="posts.edges.length > 0">
              <div v-for="edge in posts.edges" :key="edge.node._id">
                <h2 style="color:#444">
                  <div class="columns">
                    <div class="column">
                      <router-link
                        :to="{name: 'postUpdate', params:{ blogId:$route.params.blogId, postId: edge.node._id }}"
                      >{{ edge.node.title }}</router-link>
                      <br />
                      <span class="subtitle">{{ Number(edge.node.createdAt) | moment("from") }}</span>
                    </div>
                  </div>
                </h2>
              </div>
            </template>
          </template>
        </div>
      </section>
    </template>
  </AdminLayout>
</template>

<script>
import podClient from "../lib/podClient";
import AdminLayout from "../layouts/AdminLayout";
import apolloClient from "../lib/apolloClient";
import gql from "graphql-tag";
import PodLoader from "../components/PodLoader";
import { REQUEST_STATE } from "../lib/helpers";
import Notify from "../components/Notify";
import ButtonLink from "../components/ButtonLink";

import { error } from "util";

const postsQuery = gql`
  query postsQuery($pod: ID!, $status: PostPublicationStatus!) {
    posts(filter: { pod: $pod, status: $status }, last: 100) {
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

const podQuery = gql`
  query podQuery($_id: ID!) {
    pod(_id: $_id) {
      name
      description
    }
  }
`;

/**
 * We need to know if this is the first post for this pod.
 */
const allPostsQuery = gql`
  query allPostsQuery($pod: ID!) {
    posts(filter: { pod: $pod }, last: 1) {
      edges {
        node {
          _id
          title
        }
      }
    }
  }
`;

export default {
  components: {
    AdminLayout,
    PodLoader,
    Notify,
    ButtonLink
  },
  data() {
    return {
      notifications: {
        errors: [],
        info: []
      },
      initRequestsState: REQUEST_STATE.NOT_STARTED,
      allPostsRequestState: REQUEST_STATE.NOT_STARTED,
      postsRequestState: REQUEST_STATE.NOT_STARTED,
      blogRequestState: REQUEST_STATE.NOT_STARTED,
      pod: null,
      posts: null,
      activeStatus: "PUBLISHED",
      // will be true or false, once we have counted all existing posts
      isFirstPost: null
    };
  },
  created() {
    this.init();
  },
  methods: {
    /**
     * We need to run two requests, to know what user has to see;
     * - All existing post (is this user first post ?)
     * - All published post (displayed in the "published" tab)
     * We will display a loader until this two requests are finished
     */
    init() {
      this.initRequestsState = REQUEST_STATE.PENDING;
      Promise.all([this.getPod(), this.getPosts(), this.getAllPosts()])
        .then(() => {
          this.initRequestsState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.initRequestsState = REQUEST_STATE.FINISHED_ERROR;
          this.notifications.errors.push("init(): " + error.message);
        });
    },
    async getAllPosts() {
      this.allPostsRequestState === REQUEST_STATE.PENDING;
      return apolloClient
        .query({
          query: allPostsQuery,
          variables: { pod: this.$route.params.blogId }
        })
        .then(result => {
          this.allPostsRequestState = REQUEST_STATE.FINISHED_OK;
          this.isFirstPost =
            result.data.posts.edges.length === 0 ? true : false;
          return result;
        })
        .catch(error => {
          this.allPostsRequestState = REQUEST_STATE.FINISHED_ERROR;
          this.notifications.errors.push("getAllPosts() " + error.message);
        });
    },
    getPod() {
      return apolloClient
        .query({
          query: podQuery,
          variables: {
            _id: this.$route.params.blogId
          }
        })
        .then(result => {
          console.log("result", result);
          this.blogRequestState = REQUEST_STATE.FINISHED_OK;
          this.pod = result.data.pod;
          return result;
        })
        .catch(error => {
          this.blogRequestState = REQUEST_STATE.FINISHED_ERROR;
          this.notifications.errors.push("getPod() " + error.message);
        });
    },
    getPosts() {
      this.postsRequestState = REQUEST_STATE.PENDING;
      this.notifications = {
        errors: [],
        info: []
      };
      return apolloClient
        .query({
          query: postsQuery,
          variables: {
            pod: this.$route.params.blogId,
            status: this.activeStatus
          }
        })
        .then(result => {
          this.postsRequestState = REQUEST_STATE.FINISHED_OK;
          this.posts = result.data.posts;
          return result;
        })
        .catch(error => {
          this.postsRequestState = REQUEST_STATE.FINISHED_ERROR;
          this.notifications.errors.push("getPosts() " + error.message);
        });
    },
    onStatusClick(status) {
      this.activeStatus = status;
      this.getPosts();
    }
  }
};
</script>
