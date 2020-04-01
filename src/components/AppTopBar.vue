<template>
  <div class="topbar" :class="`route-${$route.name}`">
    <div class="container">
      <div class="topbar-left">
        <figure @click="onLogoClick" style="float:left;cursor:pointer;" class="image">
          <img style="width:60px" src="/logo-solo.png" alt />
        </figure>
        <span
          style="position:relative;top:5px;margin-right:20px;"
          class="tag is-warning"
        >Bêta version</span>

        <portal-target name="topbar-left">
          <!--
            This component can be located anywhere in your App.
            The slot content of the above portal component will be rendered here.
          -->
        </portal-target>
      </div>
      <div class="topbar-right">
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
              <div class="dropdown-trigger-image" aria-haspopup="true">
                <img v-if="me.picture" :src="me.picture" style="height: 40px;border-radius:20px" />
                <span v-if="!me.picture">{{ me.name }}</span>
              </div>
            </div>
            <div class="dropdown-menu" role="menu">
              <div class="dropdown-content">
                <router-link
                  :to="{ name: 'blogList' }"
                  class="dropdown-item dropdown-item-important"
                >My blogs</router-link>
                <router-link
                  v-for="edge in me.blogs.edges"
                  :key="edge.node._id"
                  :to="{
                    name: 'postList',
                    params: { blogId: edge.node._id }
                  }"
                  class="dropdown-item"
                >{{ edge.node.name }}</router-link>
                <hr class="dropdown-divider" />
                <router-link :to="{ name: 'profile' }" class="dropdown-item">
                  {{
                  $t("topbar.accountMenu.myAccount")
                  }}
                </router-link>
                <router-link :to="{ name: 'logout' }" class="dropdown-item">
                  {{
                  $t("topbar.accountMenu.logout")
                  }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- GRAPHQL API DOCUMENTATION -->
    <BulmaModal class="api-modal" v-model="showApiModal">
      <template #title>
        <span class="title is-2">API</span>
        <a
          :href="blogApiUrl"
          target="_blank"
          class="button is-primary is-pulled-right"
        >{{ $t("apiModal.openGraphQLExplorer") }}</a>
        <button
          :href="blogApiUrl"
          target="_blank"
          @click="showApiModal = false"
          class="button is-pulled-right"
          style="margin-right:20px;"
        >{{ $t("global.close") }}</button>
      </template>
      <template #body>
        <div class="container">
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
              {{ example.label }}
              <a
                style="margin-left:10px;position:relative;top:-2px"
                :href="`${blogApiUrl}?query=${encodeURI(example.snippet)}`"
                target="_blank"
                class="button is-info is-outlined"
              >{{ $t("apiModal.tryItButton") }}</a>
            </h2>
            <pre class="locale-graphql"><code>{{example.snippet}}</code></pre>
          </div>
        </div>
      </template>
    </BulmaModal>
  </div>
</template>

<script>
import gql from "graphql-tag";
import apolloClient from "../utils/apolloClient";
import {
  getUser,
  REQUEST_STATE,
  getBlog,
  getPost,
  toast
} from "../utils/helpers";
import apiExamples from "../apiExamples";
import ApiButton from "../components/ApiButton";
import BulmaModal from "../components/BulmaModal";
import logger from "../utils/logger";

export default {
  components: {
    BulmaModal,
    ApiButton
  },
  data() {
    return {
      initDataState: REQUEST_STATE.NOT_STARTED,
      me: null,
      blog: null,
      dropdownMenuActive: false,
      showApiModal: false,
      apiModalExampleList: []
    };
  },
  computed: {
    blogApiUrl() {
      return `${process.env.VUE_APP_GRAPHQL_POD_BASE_URL}/${
        this.$route.params.blogId
      }`;
    }
  },
  mounted() {
    this.initData();
  },
  watch: {
    $route: function() {
      this.dropdownMenuActive = false;
    }
  },
  methods: {
    onLogoClick() {
      this.$router.push("/");
    },
    async initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      getUser()
        .then(user => {
          this.me = user;
          this.initDataState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          toast(this, error, "error");
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
.topbar > .container {
  display: flex;
  justify-content: space-between;
}

.topbar-left {
  display: flex;
}

.topbar-right {
  display: flex;
}

.topbar .item {
  margin-right: 10px;
}

.dropdown-trigger:hover {
  cursor: pointer;
}
.dropdown-trigger-image {
  display: flex;
}
.dropdown-item-important {
  font-weight: bold;
}
</style>
