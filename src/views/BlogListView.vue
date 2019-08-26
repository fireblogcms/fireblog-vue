<template>
  <AdminLayout>
    <AppNotify :errors="notifications.errors" :info="notifications.info" />

    <template v-if="initViewState === 'PENDING'">
      <AppLoader>Loading blogs</AppLoader>
    </template>
    <template v-if="initViewState === 'FINISHED_OK'">
      <template v-if="pods.edges.length === 0">
        <LayoutBody class="container" style="margin-top:60px">
          <BlogCreateForm :first="true" />
        </LayoutBody>
      </template>
      <template v-if="pods && pods.edges.length > 0">
        <div class="container">
          <div class="animated fadeIn">
            <header style="padding: 0 1rem 2rem 1rem">
              <div class="columns">
                <div class="column">
                  <h1 style="padding-bottom:2rem;" class="title is-1">
                    <img
                      height="70"
                      style="position:relative;top:25px;padding-right:1rem"
                      src="/images/books-icon.png"
                    />
                    My blogs
                  </h1>
                </div>
                <div class="column">
                  <BulmaButtonLink
                    class="is-primary is-large main-call-to-action"
                    :to="{name:'blogCreate'}"
                  >
                    <img width="40" style="margin-right:10px" src="/images/book.png" /> CREATE A NEW BLOG
                  </BulmaButtonLink>
                </div>
              </div>
            </header>
            <LayoutBody>
              <LayoutList
                :onRowClick="onRowClick"
                :items="pods.edges"
                :itemUniqueKey="(edge) => edge.node._id"
              >
                <template v-slot="{item}">
                  <div class="columns fade-in">
                    <div class="column">
                      <div class="content">
                        <h2>
                          <router-link :to="buildLinkToPostList(item)">{{ item.node.name }}</router-link>
                          <em class="subtitle">
                            - created
                            {{ Number(item.node.createdAt) | moment("from") }}
                          </em>
                        </h2>
                        <p>
                          <em>{{ item.node.description }}</em>
                        </p>
                      </div>
                    </div>
                  </div>
                </template>
              </LayoutList>
            </LayoutBody>
          </div>
        </div>
      </template>
    </template>
  </AdminLayout>
</template>

<script>
import apolloClient from "../lib/apolloClient";
import BlogCreateForm from "../components/BlogCreateForm";
import BulmaGrid from "../components/BulmaGrid";
import AdminLayout from "../layouts/AdminLayout";
import AppLoader from "../components/AppLoader";
import gql from "graphql-tag";
import BulmaButtonLink from "../components/BulmaButtonLink";
import { REQUEST_STATE } from "../lib/helpers";
import AppNotify from "../components/AppNotify";
import ButtonLink from "../components/ButtonLink";
import LayoutBody from "../components/LayoutBody";
import LayoutList from "../components/LayoutList";

const myPodsQuery = gql`
  query myPodsQuery {
    me {
      pods(last: 100) {
        edges {
          node {
            name
            description
            createdAt
            updatedAt
            _id
          }
        }
      }
    }
  }
`;

export default {
  components: {
    LayoutBody,
    BulmaButtonLink,
    BlogCreateForm,
    BulmaGrid,
    AdminLayout,
    AppLoader,
    AppNotify,
    ButtonLink,
    LayoutList
  },
  data() {
    return {
      pods: null,
      initViewState: REQUEST_STATE.NOT_STARTED,
      notifications: {
        errors: [],
        info: []
      }
    };
  },
  methods: {
    initView() {
      this.initViewState = REQUEST_STATE.PENDING;
      Promise.all([this.getBlogs()])
        .then(() => {
          this.initViewState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.initViewState = REQUEST_STATE.FINISHED_ERROR;
          this.notifications.errors.push("initView(): " + error.message);
        });
    },
    buildLinkToPostList(item) {
      return { name: "postList", params: { blogId: item.node._id } };
    },
    onRowClick(item) {
      this.$router.push(this.buildLinkToPostList(item));
    },
    getBlogs() {
      return apolloClient
        .query({ query: myPodsQuery })
        .then(result => {
          this.pods = result.data.me.pods;
        })
        .catch(e => {
          this.notifications.errors.push("getBlogs() " + e.message);
        });
    }
  },
  created() {
    this.initView();
  }
};
</script>

<style scoped>
.main-call-to-action {
  border: solid red 1px;
  float: right;
  margin-top: 30px;
}
@media screen and (max-width: 768px) {
  .main-call-to-action {
    float: none;
    margin-top: 0px;
  }
}
</style>

