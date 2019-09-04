<template>
  <div class="topbar">
    <div class="container">
      <div class="columns">
        <div class="column">
          <span class="item tag is-medium" v-if="backToBlogsIsVisible()">
            <router-link class="item" :to="{name:'blogList'}">
              <img
                class="is-hidden-mobile"
                style="position:relative;height:20px !important;top:4px;"
                src="/images/books.webp"
              />
              <span style="padding-left:10px;"><</span> All blogs
            </router-link>
          </span>
          <span v-if="blog && backToBlogIsVisible()" class="item tag is-medium">
            <em>
              <img style="position:relative;height:20px !important;top:4px;" src="/images/book.png" />
              <router-link :to="{name: 'postList', params:{blogId:$route.params.blogId}}">
                <span style="padding-left:10px;"><</span>
                {{ blog.name }}
              </router-link>
            </em>
          </span>

          <portal-target name="topbar-left">
            <!--
            This component can be located anywhere in your App.
            The slot content of the above portal component will be rendered here.
            -->
          </portal-target>
        </div>
        <div class="column column-right">
          <portal-target name="topbar-right">
            <!--
            This component can be located anywhere in your App.
            The slot content of the above portal component will be rendered here.
            -->
          </portal-target>
          <ApiButton v-if="apiHelpIsVisible()" @click="onApiClick" />
          <!--
          <a @click="onApiClick" target="_blank" class="item button is-outlined">
            <img style="height:20px !important;padding-right:10px" src="/images/graphql.svg" />API
          </a>
          -->

          <div v-if="me" class="item" id="profile-dropdown">
            <div
              v-click-outside="onProfileDropdownOutsideClick"
              class="dropdown is-right"
              :class="{ 'is-active': dropdownMenuActive }"
            >
              <div class="dropdown-trigger" @click="dropdownMenuActive = !dropdownMenuActive">
                <div class aria-haspopup="true">
                  <span>
                    <img
                      v-if="me.picture"
                      :src="me.picture"
                      style="height: 40px;border-radius:20px; margin-right:1rem"
                    />
                    <span v-if="!me.picture">{{ me.name }}</span>
                  </span>
                </div>
              </div>
              <div class="dropdown-menu" role="menu">
                <div class="dropdown-content">
                  <router-link :to="{name:'blogList'}" class="dropdown-item">
                    <strong>My blogs</strong>
                  </router-link>
                  <router-link
                    v-for="edge in me.blogs.edges"
                    :key="edge.node._id"
                    :to="{name:'postList', params:{blogId:edge.node._id}}"
                    class="dropdown-item"
                  >{{ edge.node.name }}</router-link>
                  <router-link :to="{name:'blogCreate'}" style class="dropdown-item">
                    <button class="button is-outlined is-primary is-small">Create new blog</button>
                  </router-link>
                  <hr class="dropdown-divider" />

                  <router-link :to="{name:'profile'}" class="dropdown-item">My account</router-link>
                  <router-link :to="{name: 'logout'}" class="dropdown-item">Logout</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div :class="{ 'is-active': showApiModal }" class="modal">
      <div class="modal-background"></div>
      <div class="modal-card">
        <div class="modal-card-body">
          <h1 class="title is-uppercase">
            GRAPHQL API
            <a
              :href="tryItLink"
              target="_blank"
              class="button is-info is-pulled-right"
            >Open GraphQL Explorer</a>
          </h1>

          <div class="field">
            <div class="control">
              <input readonly="true" class="input" type="text" :value="blogApiUrl" />
            </div>
          </div>
          <div class="field" v-show="apiModalExample">
            <label class="label">{{apiModalExampleTitle}}</label>
            <pre class="language-graphql"><code>{{apiModalExample}}</code></pre>
          </div>
        </div>
        <!-- Any other Bulma elements you want -->
      </div>
      <button @click="showApiModal = false" class="modal-close is-large" aria-label="close"></button>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import apolloClient from "../lib/apolloClient";
import { getUser, LOADING_STATE } from "../lib/helpers";
import getAllPostsApiExample from "../apiExamples/getAllPosts";
import getSinglePostApiExample from "../apiExamples/getSinglePostApiExample";
import ApiButton from "../components/ApiButton";
import logger from "../lib/logger";

const meWithMyBlogsQuery = gql`
  query meWithMyBlogsQuery {
    me {
      name
      email
      picture
      blogs(last: 100) {
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
    ApiButton
  },
  data() {
    return {
      initState: "NOT_STARTED",
      me: null,
      blog: null,
      dropdownMenuActive: false,
      error: null,
      showApiModal: false,
      apiModalExampleTitle: null,
      apiModalExample: null,
      tryItLink: null
    };
  },
  computed: {
    blogApiUrl() {
      return `${process.env.VUE_APP_GRAPHQL_POD_BASE_URL}/${
        this.$route.params.blogId
      }`;
    }
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      this.initState = LOADING_STATE.PENDING;
      const promises = [];
      promises.push(this.getMeWithMyBlogs());
      // if we are inside a blog, fetch it.
      if (["postList", "postCreate", "postUpdate"].includes(this.$route.name)) {
        promises.push(this.getCurrentBlog());
      }
      Promise.all(promises)
        .then(r => {
          this.initState = LOADING_STATE.COMPLETED_OK;
        })
        .catch(e => {
          this.initState = LOADING_STATE.COMPLETED_ERROR;
          logger.error(e);
        });
    },
    getMeWithMyBlogs() {
      return apolloClient
        .query({
          query: meWithMyBlogsQuery
        })
        .then(result => {
          this.me = result.data.me;
        });
    },
    getCurrentBlog() {
      return apolloClient
        .query({
          query: gql`
            query topBarBlogQuery($_id: ID!) {
              blog(_id: $_id) {
                name
              }
            }
          `,
          variables: {
            _id: this.$route.params.blogId
          }
        })
        .then(result => {
          this.blog = result.data.blog;
        })
        .catch(error => {
          this.error = error;
          logger.error(error);
        });
    },
    backToBlogIsVisible() {
      if (["postUpdate", "postCreate"].includes(this.$route.name)) {
        return true;
      }
      return false;
    },
    backToBlogsIsVisible() {
      if (["postList", "profile"].includes(this.$route.name)) {
        return true;
      }
      return false;
    },
    apiHelpIsVisible() {
      const authorizedNames = ["postList", "postUpdate", "postCreate"];
      if (authorizedNames.includes(this.$route.name)) {
        return true;
      }
      return false;
    },
    onProfileDropdownOutsideClick() {
      if (this.dropdownMenuActive === true) {
        this.dropdownMenuActive = false;
      }
    },
    onApiClick() {
      if (this.$route.name === "postList") {
        this.apiModalExampleTitle = "get all posts, with pagination support";
        this.apiModalExample = getAllPostsApiExample();
        this.tryItLink = `${this.blogApiUrl}?query=${encodeURI(
          getAllPostsApiExample()
        )}`;
      }
      if (this.$route.name === "postUpdate") {
        this.apiModalExampleTitle = "get a single post";
        this.apiModalExample = getSinglePostApiExample({
          _id: this.$route.params.postId
        });
        this.tryItLink = `${this.blogApiUrl}?query=${encodeURI(
          getSinglePostApiExample({ _id: this.$route.params.postId })
        )}`;
      }
      this.showApiModal = true;
    }
  }
};
</script>

<style>
.topbar {
  background: white;
  padding: 1rem;
  min-height: 78px;
}
.topbar .vue-portal-target {
  display: inline;
}
.topbar .item {
  margin-right: 1rem;
}
.topbar .column-right {
  text-align: right;
}
.topbar #profile-dropdown:hover {
  cursor: pointer;
}
.topbar #profile-dropdown {
  display: inline;
}
</style>
