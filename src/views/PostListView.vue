<template>
  <AdminLayout>
    <AppNotify :errors="notifications.errors" :infos="notifications.infos" />

    <template v-if="initState === 'PENDING'">
      <AppLoader>Loading posts</AppLoader>
    </template>
    <template v-if="initState === 'COMPLETED_OK'">
      <div class="animated fadeIn">
        <header class="container" style="padding: 0 1rem 2rem 1rem">
          <div class="columns">
            <div class="column">
              <h1 class="title is-uppercase">
                <img
                  class="is-hidden-mobile"
                  style="height:70px !important;position:relative;top:20px;padding-right:1rem"
                  src="/images/book.png"
                />
                {{blog.name}} - POSTS
              </h1>
            </div>
            <div class="column is-4">
              <BulmaButtonLink
                class="is-large is-primary main-call-to-action"
                v-if="!isFirstPost"
                :to="{name: 'postCreate', params:{blogId:$route.params.blogId}}"
              >
                <span>WRITE NEW POST</span>
              </BulmaButtonLink>
            </div>
          </div>
        </header>

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
                <li
                  @click="onStatusClick('DRAFT')"
                  :class="{ 'is-active': activeStatus == 'DRAFT' }"
                >
                  <a>Draft</a>
                </li>
              </ul>
            </div>
            <LayoutBody style="border-top-left-radius:0">
              <div class="container" style="border-top-left-radius:0;">
                <LayoutList
                  style="height:200px"
                  :items="posts.edges"
                  :itemUniqueKey="(item) => item.node._id"
                >
                  <!--POST PENDING-->
                  <template v-if="postsRequestState === 'PENDING'">
                    <AppLoader />
                  </template>

                  <!--NO PUBLISHED POST FOUND-->
                  <template v-if="postsRequestState === 'COMPLETED_OK' && posts.edges.length === 0">
                    <div class="content section has-text-centered">
                      <p>No post found with {{ activeStatus }} status for now.</p>
                    </div>
                  </template>
                  <!-- POST LIST -->

                  <template v-if="postsRequestState === 'COMPLETED_OK'" v-slot="{item}">
                    <div class="columns">
                      <div @click="onRowClick(item)" class="column is-10">
                        <h2 class="title">
                          {{ item.node.title + " " }}
                          <span
                            v-if="item.node.status === 'PUBLISHED'"
                            class="subtitle"
                          >published {{ Number(item.node.publishedAt) | moment("from") }}</span>
                          <span
                            v-if="item.node.status === 'DRAFT'"
                            class="subtitle"
                          >updated {{ Number(item.node.updatedAt) | moment("from") }}</span>
                        </h2>

                        <p v-if="item.node.content.length > 0">
                          <em>{{striptags(item.node.content.substr(0, 200))}}...</em>
                        </p>
                      </div>
                      <div class="column is-2">
                        <div class="actions">
                          <!--
                            <div
                              @click="onUnpublishClick"
                              v-show="activeStatus === 'PUBLISHED'"
                              style="min-width:100px"
                              class="button is-outlined"
                            >Unpublish</div>
                          -->
                          <div
                            @click="onDeleteClick(item.node._id)"
                            style="min-width:100px"
                            class="button is-outlined"
                          >Delete</div>
                        </div>
                      </div>
                    </div>
                  </template>
                </LayoutList>
                <!---->
              </div>
            </LayoutBody>
          </section>
        </template>
      </div>
    </template>
  </AdminLayout>
</template>

<script>
import apolloClient from "../lib/apolloClient";
import AdminLayout from "../layouts/AdminLayout";
import gql from "graphql-tag";
import AppLoader from "../components/AppLoader";
import { LOADING_STATE } from "../lib/helpers";
import AppNotify from "../components/AppNotify";
import BulmaButtonLink from "../components/BulmaButtonLink";
import LayoutBody from "../components/LayoutBody";
import LayoutList from "../components/LayoutList";
import striptags from "striptags";
import logger from "../lib/logger";

const postsQuery = gql`
  query postsQuery($blog: ID!, $status: PostPublicationStatus!) {
    posts(language: "fr", filter: { blog: $blog, status: $status }, last: 100) {
      edges {
        node {
          _id
          title
          updatedAt
          createdAt
          publishedAt
          status
          content
        }
      }
    }
  }
`;

const blogQuery = gql`
  query blogQuery($_id: ID!) {
    blog(_id: $_id) {
      name
      description
    }
  }
`;

/**
 * We need to know if this is the first post for this blog.
 */
const allPostsQuery = gql`
  query allPostsQuery($blog: ID!) {
    posts(filter: { blog: $blog }, last: 1) {
      edges {
        node {
          _id
          title
        }
      }
    }
  }
`;

const deletePostMutation = gql`
  mutation deletePostMutation($id: ID!) {
    deletePost(_id: $id) {
      slug
      _id
      title
    }
  }
`;

export default {
  components: {
    AdminLayout,
    AppLoader,
    AppNotify,
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
      initState: LOADING_STATE.NOT_STARTED,
      allPostsRequestState: LOADING_STATE.NOT_STARTED,
      postsRequestState: LOADING_STATE.NOT_STARTED,
      blogRequestState: LOADING_STATE.NOT_STARTED,
      deletePostRequestState: LOADING_STATE.NOT_STARTED,
      blog: null,
      posts: null,
      activeStatus: "PUBLISHED",
      // will be true or false, once we have counted all existing posts
      isFirstPost: null
    };
  },
  created() {
    this.striptags = striptags;
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
      this.initState = LOADING_STATE.PENDING;
      Promise.all([this.getBlog(), this.getPosts(), this.getAllPosts()])
        .then(() => {
          this.initState = LOADING_STATE.COMPLETED_OK;
        })
        .catch(error => {
          this.initState = LOADING_STATE.COMPLETED_ERROR;
          this.notifications.errors.push("init(): " + error.message);
          logger.error(new Error(error));
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
      this.allPostsRequestState === LOADING_STATE.PENDING;
      return apolloClient
        .query({
          query: allPostsQuery,
          variables: { blog: this.$route.params.blogId }
        })
        .then(result => {
          this.allPostsRequestState = LOADING_STATE.COMPLETED_OK;
          this.isFirstPost =
            result.data.posts.edges.length === 0 ? true : false;
          return result;
        })
        .catch(error => {
          this.allPostsRequestState = LOADING_STATE.COMPLETED_ERROR;
          this.notifications.errors.push("getAllPosts() " + error.message);
          logger.error(new Error(error));
          return error;
        });
    },
    getBlog() {
      return apolloClient
        .query({
          query: blogQuery,
          variables: {
            _id: this.$route.params.blogId
          }
        })
        .then(result => {
          this.blogRequestState = LOADING_STATE.COMPLETED_OK;
          this.blog = result.data.blog;
          return result;
        })
        .catch(error => {
          this.blogRequestState = LOADING_STATE.COMPLETED_ERROR;
          this.notifications.errors.push("getBlog() " + error.message);
          logger.error(new Error(error));
        });
    },
    getPosts() {
      this.postsRequestState = LOADING_STATE.PENDING;
      this.notifications = {
        errors: [],
        info: []
      };
      return apolloClient
        .query({
          query: postsQuery,
          variables: {
            blog: this.$route.params.blogId,
            status: this.activeStatus
          }
        })
        .then(result => {
          this.postsRequestState = LOADING_STATE.COMPLETED_OK;
          this.posts = result.data.posts;
          return result;
        })
        .catch(error => {
          this.postsRequestState = LOADING_STATE.COMPLETED_ERROR;
          this.notifications.errors.push("getPosts() " + error.message);
          logger.error(new Error(error));
        });
    },
    onStatusClick(status) {
      this.activeStatus = status;
      this.getPosts();
    },
    onDeleteClick(postId) {
      const confirmed = confirm(
        "Are your sure you want to delete this article ? This action can not be reverted !"
      );
      if (!confirmed) {
        return;
      }
      this.deletePostRequestState = LOADING_STATE.PENDING;
      return apolloClient
        .mutate({
          mutation: deletePostMutation,
          variables: { id: postId }
        })
        .then(result => {
          this.deletePostRequestState = LOADING_STATE.COMPLETED_OK;
          console.log("result", result);
          const post = result.data.deletePost;
          alert(`${post.title} has been deleted !`);
          return this.getPosts();
          return result;
        })
        .catch(error => {
          this.deletePostRequestState = LOADING_STATE.COMPLETED_ERROR;
          this.notifications.errors.push("onDeleteClick() " + error.message);
          logger.error(new Error(error));
          return error;
        });
    },
    onUnpublishClick(status) {
      alert("unpublish");
    }
  }
};
</script>

<style scoped>
.main-call-to-action {
  float: right;
  margin-top: 30px;
}
@media screen and (min-width: 1024px) {
  .actions .button {
    margin-bottom: 15px;
  }
}

@media screen and (max-width: 768px) {
  .actions {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
  .actions .button {
    margin-left: 20px;
  }
  .main-call-to-action {
    margin-top: 0px;
    float: none;
  }
}
</style>


