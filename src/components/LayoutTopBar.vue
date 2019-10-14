<template>
  <div class="topbar">
    <div class="container">
      <div class="columns">
        <div class="column">
          <AppError v-if="errorMessage">{{errorMessage}}</AppError>
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

          <!--Dropdown menu with profile, blog list, logout link etc-->
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

    <!-- GRAPHQL API DOCUMENTATION -->
    <BulmaModal class="api-modal" v-model="showApiModal">
      <template #title>
        GRAPHQL API
        <a
          :href="blogApiUrl"
          target="_blank"
          class="button is-info is-pulled-right"
        >Open GraphQL Explorer</a>
      </template>
      <template #body>
        <h2 class="title is-4">GraphQL endpoint</h2>
        <div class="field">
          <div class="control">
            <input readonly="true" class="input" type="text" :value="blogApiUrl" />
          </div>
        </div>
        <div
          ref="apiModal"
          :id="`example-${example.id}`"
          v-for="example in apiModalExampleList"
          :key="example.id"
        >
          <h2 style="margin-top:20px" class="title is-4">
            {{example.label}}
            <a
              :href="`${blogApiUrl}?query=${encodeURI(example.snippet)}`"
              target="_blank"
              class="is-pulled-right button is-primary"
            >Try it !</a>
          </h2>
          <pre class="locale-graphql"><code>{{example.snippet}}</code></pre>
        </div>
      </template>
    </BulmaModal>
  </div>
</template>

<script>
import gql from "graphql-tag";
import apolloClient from "../utils/apolloClient";
import { getUser, REQUEST_STATE, getBlog, getPost } from "../utils/helpers";
import apiExamples from "../apiExamples";
import ApiButton from "../components/ApiButton";
import BulmaModal from "../components/BulmaModal";
import AppError from "../components/AppError";
import logger from "../utils/logger";

export default {
  components: {
    BulmaModal,
    AppError,
    ApiButton
  },
  data() {
    return {
      initDataState: REQUEST_STATE.NOT_STARTED,
      me: null,
      blog: null,
      dropdownMenuActive: false,
      errorMessage: null,
      showApiModal: false,
      apiModalExampleList: []
    };
  },
  computed: {
    blogApiUrl() {
      return `${process.env.VUE_APP_GRAPHQL_POD_BASE_URL}/${this.$route.params.blogId}`;
    }
  },
  created() {
    this.initData();
  },
  methods: {
    async initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      const promises = [];
      promises.push(this.getMeWithMyBlogs());
      // if we are inside a blog, fetch blog informations.
      if (["postList", "postCreate", "postUpdate"].includes(this.$route.name)) {
        promises.push(getBlog(this.$route.params.blogId));
      }
      Promise.all(promises)
        .then(() => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          throw new Error(error);
        });
    },
    getMeWithMyBlogs() {
      return apolloClient
        .query({
          query: gql`
            query meWithMyBlogsQuery {
              me {
                name
                email
                picture
                blogs(last: 100) {
                  edges {
                    node {
                      _id
                      name
                      description
                      createdAt
                      updatedAt
                      contentDefaultLocale
                    }
                  }
                }
              }
            }
          `
        })
        .then(result => {
          this.me = result.data.me;
        })
        .catch(error => {
          this.errorMessage =
            "An error occured while fetching user information";
          throw new Error(error);
        });
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
    async onApiClick() {
      const context = {
        slug: "{{POST_SLUG}}",
        locale: navigator.language || navigator.userLanguage
      };
      if (this.$route.name === "postList") {
        const blog = await getBlog(this.$route.params.blogId);
        context.locale = blog.contentDefaultLocale;
      }
      if (this.$route.name === "postUpdate") {
        const [blog, post] = await Promise.all([
          getBlog(this.$route.params.blogId),
          getPost(this.$route.params.postId)
        ]);
        context.locale = blog.contentDefaultLocale;
        context.slug = post.slug;
      }
      this.apiModalExampleList = apiExamples(context);
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
