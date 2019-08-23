<template>
  <AdminLayout>
    <Notify :errors="notifications.errors" :infos="notifications.infos" />
    <portal to="topbar-left">
      <router-link class="item" :to="{name:'blogList'}">
        <img style="position:relative;height:20px !important;top:4px;" src="/images/books.webp" />
        <i style="margin-left:10px" class="fas fa-chevron-left"></i>
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
        {{pod.name}} - POSTS
        <BulmaButtonLink
          style="margin-top:20px"
          class="is-large is-pulled-right is-primary"
          v-if="!isFirstPost"
          :to="{name: 'postCreate', params:{blogId:$route.params.blogId}}"
        >
          <span>WRITE NEW POST</span>
        </BulmaButtonLink>
      </h1>
    </header>

    <template v-if="initRequestsState === 'PENDING'">
      <PodLoader />
    </template>
    <template v-if="isFirstPost === true">
      <div class="container">
        <LayoutBody>
          <h2
            style="font-weight:200"
            class="title has-text-centered"
          >Write your first post in this blog !</h2>
          <div class="has-text-centered">
            <div style="margin:2rem">
              <BulmaButtonLink
                class="is-large is-primary"
                :to="{name: 'postCreate', params:{blogId:$route.params.blogId}}"
              >Write</BulmaButtonLink>
            </div>
          </div>
        </LayoutBody>
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
              <a>Draft</a>
            </li>
            <li @click="onStatusClick('BIN')" :class="{ 'is-active': activeStatus == 'BIN' }">
              <a>
                <img style="height:30px;padding-right:5px" src="/images/bin.png" />
                Bin
              </a>
            </li>
          </ul>
        </div>
        <LayoutBody style="border-top-left-radius:0">
          <div class="container" style="border-top-left-radius:0;">
            <!--POST PENDING-->
            <template v-if="postsRequestState === 'PENDING'">
              <PodLoader />
            </template>
            <!--NO PUBLISHED POST FOUND-->
            <template v-if="postsRequestState === 'FINISHED_OK' && posts.edges.length === 0">
              <div class="content section has-text-centered">
                <p>No post found with {{ activeStatus }} status for now.</p>
              </div>
            </template>
            <template v-if="postsRequestState === 'FINISHED_OK' && posts.edges.length > 0">
              <LayoutList
                :onRowClick="onRowClick"
                :items="posts.edges"
                :itemUniqueKey="(item) => item.node._id"
              >
                <template v-slot="{item}">
                  <div class="content">
                    <h2>
                      <div class="columns">
                        <div class="column">
                          <router-link
                            :to="{name: 'postUpdate', params:{ blogId:$route.params.blogId, postId: item.node._id }}"
                          >{{ item.node.title }}</router-link>
                          <br />
                          <span class="subtitle">{{ Number(item.node.createdAt) | moment("from") }}</span>
                        </div>
                      </div>
                    </h2>
                  </div>
                </template>
              </LayoutList>
            </template>
            <!---->
          </div>
        </LayoutBody>
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
import BulmaButtonLink from "../components/BulmaButtonLink";
import LayoutBody from "../components/LayoutBody";
import LayoutList from "../components/LayoutList";

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
    ButtonLink,
    LayoutBody,
    LayoutList,
    BulmaButtonLink
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
    buildLinkToPost(item) {
      return {
        name: "postUpdate",
        params: { blogId: this.$route.params.blogId, postId: item.node._id }
      };
    },
    onRowClick(item) {
      this.$router.push(this.buildLinkToPost(item));
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