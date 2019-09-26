<template>
  <AdminLayout>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <span class="item tag is-medium">
        <router-link class="item" :to="{name:'blogList'}">
          <img
            class="is-hidden-mobile"
            style="position:relative;height:20px !important;top:4px;"
            src="/images/books.webp"
          />
          <IconBack />All blogs
        </router-link>
      </span>
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

    <AppError v-if="errorMessage">{{errorMessage}}</AppError>
    <template v-if="initDataState === 'PENDING'">
      <AppLoader />
    </template>
    <template v-if="initDataState === 'FINISHED_OK'">
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

            <LayoutBody style="border-top-left-radius:0;min-height:200px">
              <div class="container" style="border-top-left-radius:0;">
                <AppLoader v-show="postsRequestState === 'PENDING'" />
                <template v-if="postsRequestState === 'FINISHED_OK' && posts.edges.length === 0">
                  <div class="content section has-text-centered">
                    <p>No post found with {{ activeStatus }} status for now.</p>
                  </div>
                </template>
                <template v-if="postsRequestState === 'FINISHED_OK' && posts.edges.length > 0">
                  <LayoutList :items="posts.edges" :itemUniqueKey="(item) => item.node._id">
                    <template v-slot="{item}">
                      <div class="columns">
                        <div @click="onRowClick(item)" class="column is-10 content">
                          <h2 style="margin-bottom:0;padding:0">{{ item.node.title + " " }}</h2>
                          <span
                            style="color:rgba(0, 0, 0, 0.5);"
                            v-if="item.node.status === 'PUBLISHED'"
                          >published {{ Number(item.node.publishedAt) | moment("from") }}</span>
                          <span
                            style="color:rgba(0, 0, 0, 0.5);"
                            v-if="item.node.status === 'DRAFT'"
                          >updated {{ Number(item.node.updatedAt) | moment("from") }}</span>

                          <p
                            style="padding-top:10px;font-style:italic"
                            v-if="item.node.content.length > 0"
                          >{{striptags(item.node.content.substr(0, 200))}}...</p>
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
                              @click="onDeleteClick(item.node)"
                              style="min-width:100px"
                              class="button is-outlined"
                            >Delete</div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </LayoutList>
                </template>
                <!---->
              </div>
            </LayoutBody>
          </section>
        </template>
      </div>
    </template>
    <BulmaModal v-model="deleteModal.show">
      <template #title>{{deleteModal.title}}</template>
      <template #body>
        <p>This action cannot be undone</p>
      </template>
      <template #footer>
        <div @click="deleteModal.show = false" class="button is-success">OUPS NO, CANCEL !</div>
        <div @click="onDeleteModalConfirmClick" class="button is-danger">DELETE IT. FOREVER.</div>
      </template>
    </BulmaModal>
  </AdminLayout>
</template>

<script>
import apolloClient from "../utils/apolloClient";
import AdminLayout from "../layouts/AdminLayout";
import IconBack from "../components/IconBack";
import gql from "graphql-tag";
import AppLoader from "../components/AppLoader";
import { REQUEST_STATE } from "../utils/helpers";
import AppError from "../components/AppError";
import BulmaButtonLink from "../components/BulmaButtonLink";
import LayoutBody from "../components/LayoutBody";
import LayoutList from "../components/LayoutList";
import striptags from "striptags";
import logger from "../utils/logger";
import BulmaModal from "../components/BulmaModal";

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
    AppError,
    LayoutBody,
    LayoutList,
    BulmaButtonLink,
    BulmaModal,
    IconBack
  },
  data() {
    return {
      errorMessage: null,
      initDataState: REQUEST_STATE.NOT_STARTED,
      postsRequestState: REQUEST_STATE.NOT_STARTED,
      deletePostRequestState: REQUEST_STATE.NOT_STARTED,
      deleteModal: {
        show: false,
        title: null,
        data: null
      },
      blog: null,
      posts: null,
      activeStatus: "PUBLISHED",
      // will be true or false, once we have counted all existing posts
      isFirstPost: null
    };
  },
  created() {
    this.striptags = striptags;
    this.initData();
  },
  methods: {
    /**
     * We need to run two requests, to know what user has to see;
     * - All existing post (is this user first post ?)
     * - All published post (displayed in the "published" tab)
     * We will display a loader until this two requests are finished
     */
    initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      Promise.all([
        this.getBlog(),
        this.getPosts(this.activeStatus),
        this.getAllPosts()
      ])
        .then(() => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          throw new Error(error);
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
      this.errorMessage = null;
      return apolloClient
        .query({
          query: allPostsQuery,
          variables: { blog: this.$route.params.blogId }
        })
        .then(result => {
          this.isFirstPost =
            result.data.posts.edges.length === 0 ? true : false;
          return result;
        })
        .catch(error => {
          this.errorMessage = "Sorry, an error occured while fetching posts";
          throw new Error(error);
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
          this.blog = result.data.blog;
          return result;
        });
    },
    getPosts(status) {
      this.postsRequestState = REQUEST_STATE.PENDING;
      return apolloClient
        .query({
          query: postsQuery,
          variables: {
            blog: this.$route.params.blogId,
            status: status
          }
        })
        .then(result => {
          this.postsRequestState = REQUEST_STATE.FINISHED_OK;
          this.posts = result.data.posts;
          return result;
        })
        .catch(error => {
          this.postsRequestState = REQUEST_STATE.FINISHED_ERROR;
          this.errorMessage = "Sorry, an error occured while fetching posts";
          throw new Error(error);
        });
    },
    deletePost(post) {
      this.deletePostRequestState = REQUEST_STATE.PENDING;
      return apolloClient
        .mutate({
          mutation: deletePostMutation,
          variables: { id: post._id }
        })
        .then(result => {
          this.deletePostRequestState = REQUEST_STATE.FINISHED_OK;
          const post = result.data.deletePost;
          return this.getPosts(this.activeStatus);
        })
        .then(r => {
          this.deleteModal.show = false;
        })
        .catch(error => {
          this.deletePostRequestState = REQUEST_STATE.FINISHED_ERROR;
          this.errorMessage = "Sorry an error occured while deleting post";
          this.deleteModal.show = false;
          throw new Error(error);
        });
    },
    onStatusClick(status) {
      this.activeStatus = status;
      this.getPosts(status);
    },
    onDeleteClick(post) {
      this.deleteModal.post = post;
      this.deleteModal.show = true;
      this.deleteModal.title = `Delete "${post.title}"`;
    },
    onUnpublishClick(status) {
      alert("unpublish");
    },
    onDeleteModalConfirmClick() {
      this.deletePost(this.deleteModal.post).then(r => {
        this.deleteModal.show = false;
      });
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


