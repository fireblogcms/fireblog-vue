<template>
  <div class="topbar">
    <div class="container">
      <div class="columns">
        <div class="column">
          <span
            class="item tag is-medium"
            v-if="podQueryState === 'FINISHED_OK' && backToPodIsVisible()"
          >
            <em>
              <img style="position:relative;height:20px !important;top:4px;" src="/images/book.png" />
              <router-link :to="{name: 'postList', params:{blogId:$route.params.blogId}}">
                <i style="margin-left:10px" class="fas fa-chevron-left"></i>
                {{ pod.name }}
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
          <ApiButton v-show="apiHelpIsVisible()" @click="onApiClick" />
          <!--
          <a @click="onApiClick" target="_blank" class="item button is-outlined">
            <img style="height:20px !important;padding-right:10px" src="/images/graphql.svg" />API
          </a>
          -->

          <div v-if="meQueryState === 'FINISHED_OK'" id="profile-dropdown" class="item">
            <div
              v-click-outside="onProfileDropdownOutsideClick"
              class="dropdown is-right animated zoomIn"
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
                  <!--
                  <span class="icon is-small">
                    <i class="fas fa-angle-down" aria-hidden="true"></i>
                  </span>
                  -->
                </div>
              </div>
              <div class="dropdown-menu" role="menu">
                <div class="dropdown-content">
                  <router-link :to="{name:'blogList'}" class="dropdown-item">
                    <strong>My blogs</strong>
                  </router-link>
                  <router-link
                    v-for="edge in me.pods.edges"
                    :key="edge.node._id"
                    :to="{name:'postList', params:{blogId:edge.node._id}}"
                    class="dropdown-item"
                  >{{ edge.node.name }}</router-link>
                  <router-link :to="{name:'blogCreate'}" style class="dropdown-item">
                    <button class="button is-outlined is-primary is-small">Create new Pod</button>
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

    <div :class="{ 'is-active': showApiModal }" class="modal animated fadeIn">
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
              <input readonly="true" class="input" type="text" :value="podApiUrl" />
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
import getAllPostsApiExample from "../apiExamples/getAllPosts";
import getSinglePostApiExample from "../apiExamples/getSinglePostApiExample";
import ApiButton from "../components/ApiButton";

const meQuery = gql`
  query meQuery {
    me {
      name
      email
      picture
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

const podQuery = gql`
  query podQuery($_id: ID!) {
    pod(_id: $_id) {
      name
    }
  }
`;

export default {
  components: {
    ApiButton
  },
  data() {
    return {
      dropdownMenuActive: false,
      podQueryState: "NOT_STARTED",
      meQueryState: "NOT_STARTED",
      pod: null,
      me: null,
      error: null,
      showApiModal: false,
      apiModalExampleTitle: null,
      apiModalExample: null,
      tryItLink: null
    };
  },
  computed: {
    podApiUrl() {
      return `${process.env.VUE_APP_GRAPHQL_POD_BASE_URL}/${
        this.$route.params.blogId
      }`;
    }
  },
  created() {
    // get account infos
    this.VUE_APP_GRAPHQL_URL = process.env.VUE_APP_GRAPHQL_URL;
    this.VUE_APP_GRAPHQL_POD_BASE_URL =
      process.env.VUE_APP_GRAPHQL_POD_BASE_URL;
    this.meQueryState = "PENDING";
    apolloClient
      .query({
        query: meQuery,
        variables: {
          id: this.$route.params.blogId
        }
      })
      .then(result => {
        this.me = result.data.me;
        this.meQueryState = "FINISHED_OK";
      })
      .catch(error => {
        this.error = error;
        this.meQueryState = "FINISHED_ERROR";
      });
    // get currend pod data
    const authorizedNames = ["postList", "postCreate", "postUpdate"];
    if (authorizedNames.includes(this.$route.name)) {
      this.podQueryState = "PENDING";
      apolloClient
        .query({
          query: podQuery,
          variables: {
            _id: this.$route.params.blogId
          }
        })
        .then(result => {
          this.pod = result.data.pod;
          this.podQueryState = "FINISHED_OK";
        })
        .catch(error => {
          this.error = error;
          this.podQueryState = "FINISHED_ERROR";
        });
    }
  },
  methods: {
    backToPodIsVisible() {
      if (["postUpdate", "postCreate"].includes(this.$route.name)) {
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
        this.tryItLink = `${this.podApiUrl}?query=${encodeURI(
          getAllPostsApiExample()
        )}`;
      }
      if (this.$route.name === "postUpdate") {
        this.apiModalExampleTitle = "get a single post";
        this.apiModalExample = getSinglePostApiExample({
          _id: this.$route.params.postId
        });
        this.tryItLink = `${this.podApiUrl}?query=${encodeURI(
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
