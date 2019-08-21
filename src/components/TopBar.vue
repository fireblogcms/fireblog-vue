<template>
  <div class="topbar">
    <div class="container">
      <div class="columns">
        <div class="column">
          <span class="pod-name item tag is-medium" v-if="podQueryState === 'FINISHED_OK'">
            <em>
              <img
                style="position:relative;height:20px !important;top:4px;"
                src="/images/book-closed.png"
              />
              {{ pod.name }}
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
          <a :href="VUE_APP_GRAPHQL_URL" target="_blank" class="item button is-outlined">
            <img style="height:20px !important;padding-right:10px" src="/images/graphql.svg" />API
          </a>

          <div v-if="meQueryState === 'FINISHED_OK'" id="profile-dropdown" class="item">
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
                  <!--
                  <span class="icon is-small">
                    <i class="fas fa-angle-down" aria-hidden="true"></i>
                  </span>
                  -->
                </div>
              </div>
              <div class="dropdown-menu" role="menu">
                <div class="dropdown-content">
                  <router-link :to="{name:'pods'}" class="dropdown-item">
                    <strong>My pods</strong>
                  </router-link>
                  <router-link
                    v-for="edge in me.pods.edges"
                    :key="edge.node._id"
                    :to="`/pod/${edge.node._id}`"
                    class="dropdown-item"
                  >{{ edge.node.name }}</router-link>
                  <router-link to="/pod/create" style class="dropdown-item">
                    <button class="button is-outlined is-primary is-small">Create new Pod</button>
                  </router-link>
                  <hr class="dropdown-divider" />

                  <router-link to="/profile" class="dropdown-item">My account</router-link>
                  <router-link to="/logout" class="dropdown-item">Logout</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div :class="{ 'is-active': showApiDocModal }" class="modal">
      <div class="modal-background"></div>
      <div class="modal-card">
        <div class="modal-card-body">
          <h1 class="title is-uppercase">GRAPHQL API</h1>
          <pre>{{ apiDocContent }}</pre>
        </div>
        <!-- Any other Bulma elements you want -->
      </div>
      <button @click="showApiDocModal = false" class="modal-close is-large" aria-label="close"></button>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import apolloClient from "../lib/apolloClient";
import { print } from "graphql/language/printer";

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
  data() {
    return {
      dropdownMenuActive: false,
      podQueryState: "NOT_STARTED",
      meQueryState: "NOT_STARTED",
      pod: null,
      me: null,
      error: null,
      showApiDocModal: false,
      apiDocContent: null
    };
  },
  created() {
    // get account infos
    this.VUE_APP_GRAPHQL_URL = process.env.VUE_APP_GRAPHQL_URL;
    this.meQueryState = "PENDING";
    apolloClient
      .query({
        query: meQuery,
        variables: {
          id: this.$route.params.podId
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

    if (
      this.$route.name === "PostsView" ||
      this.$route.name === "PostFormView" ||
      this.$route.name === "postEdit"
    ) {
      this.podQueryState = "PENDING";

      apolloClient
        .query({
          query: podQuery,
          variables: {
            _id: this.$route.params.podId
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
    onProfileDropdownOutsideClick() {
      if (this.dropdownMenuActive === true) {
        this.dropdownMenuActive = false;
      }
    },
    getApiDoc() {
      this.showApiDocModal = true;
      //if (this.$route.name === "pods") {
      this.apiDocContent = print(apiDocPods);
      //}
    }
  }
};
</script>

<style>
.topbar {
  background: white;
  padding: 1rem;
}
.topbar .vue-portal-target {
  display: inline;
}
.topbar .item {
  margin-left: 1rem;
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
