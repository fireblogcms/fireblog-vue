<template>
  <div class="pod-create-form section">
    <template v-if="initState === 'PENDING'">
      <AppLoader>Loading</AppLoader>
    </template>

    <template v-if="initState === 'COMPLETED_ERROR'">
      <div class="notification is-danger">{{initStateError}}</div>
    </template>

    <template v-if="initState === 'COMPLETED_OK'">
      <div class="content has-text-centered">
        <!-- special text if this is the very first blog :) -->
        <template v-if="first">
          <h2>Glad to see you here, {{ user.name }} 🤗</h2>
          <h2 style="font-weight:200;">
            Let's create your first blog.
            <br />Give it a name, or let
            <a
              ref="randomNameLink"
              @click.prevent="onGenerateCLick"
            >us suggest a nice one for you</a>
          </h2>
        </template>

        <!-- text is this is not the first pod -->
        <template v-if="!first">
          <h2>
            <br />Create a new Blog. Give it a name or let
            <a
              ref="randomNameLink"
              @click.prevent="onGenerateCLick"
            >us suggest a nice one for you</a>
          </h2>
        </template>
        <br />

        <div class="field">
          <div class="control">
            <input
              v-model="inputs.name"
              class="input is-large"
              :class="{'is-danger': formErrors.name}"
              type="text"
              placeholder="Blog's Name"
            />
          </div>
          <p class="help is-danger" v-if="formErrors.name">{{formErrors.name}}</p>
        </div>

        <div class="field">
          <h2>
            <br />In which language will you write by default ?
          </h2>
          <div class="control">
            <div
              class="select is-large is-fullwidth"
              :class="{'is-danger': formErrors.blogContentDefaultLanguage}"
            >
              <select v-model="inputs.blogContentDefaultLanguage">
                <option value>Select a language</option>
                <option
                  class="has-text-centered"
                  :value="language.code"
                  v-for="language in languageList"
                  :key="language.code"
                >{{language.nativeName}} - {{language.englishName}}</option>
              </select>
            </div>
            <p
              class="has-text-centered help is-danger"
              v-if="formErrors.blogContentDefaultLanguage"
            >{{formErrors.blogContentDefaultLanguage}}</p>
          </div>
        </div>
        <br />

        <div class="buttons are-medium is-centered">
          <a class="button is-outlined is-primary" @click="$router.push('/')">CANCEL</a>
          <button class="button is-primary" @click="onCreateClick">CREATE MY BLOG</button>
        </div>

        <!-- Any other Bulma elements you want -->
      </div>
    </template>
  </div>
</template>

<script>
import { generate } from "../lib/fantasyName.js";
import apolloClient from "../lib/apolloClient";
import { getUser } from "../lib/helpers";
import gql from "graphql-tag";
import { LOADING_STATE } from "../lib/helpers";
import AppLoader from "../components/AppLoader";
import logger from "../lib/logger";

const createBlogMutation = gql`
  mutation createPod($pod: CreatePodInput!) {
    createPod(pod: $pod) {
      name
      description
      _id
    }
  }
`;

const languageListQuery = gql`
  query languageListQuery {
    languages {
      code
      nativeName
      englishName
    }
  }
`;

export default {
  components: {
    AppLoader
  },
  props: {
    first: {
      type: Boolean
    }
  },
  data() {
    return {
      errors: [],
      formErrors: [],
      initState: LOADING_STATE.NOT_STARTED,
      initStateError: null,
      user: null,
      languageList: null,
      inputs: {
        name: "",
        blogContentDefaultLanguage: null
      }
    };
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      this.initStateError = null;
      this.initState = LOADING_STATE.PENDING;
      Promise.all([getUser(), this.getLanguageList()])
        .then(([user, languageListResult]) => {
          const languages = languageListResult.data.languages;
          this.initState = LOADING_STATE.COMPLETED_OK;
          this.user = user;
          this.languageList = Object.keys(languages).map(i => {
            return {
              code: languages[i].code,
              englishName: languages[i].englishName,
              nativeName: languages[i].nativeName
            };
          });
          // set browser language by default
          this.inputs.blogContentDefaultLanguage =
            navigator.language || navigator.userLanguage;
        })
        .catch(e => {
          this.initState = LOADING_STATE.COMPLETED_ERROR;
          this.initStateError = "init() : " + e;
          logger.error(new Error(e));
        });
    },
    getLanguageList() {
      return apolloClient.query({
        query: languageListQuery
      });
    },
    formGetErrors() {
      const errors = [];
      logger.info(this.inputs);
      if (!this.inputs.name.trim()) {
        errors["name"] = "Name is required";
      }
      if (!this.inputs.blogContentDefaultLanguage.trim()) {
        errors["blogContentDefaultLanguage"] = "Language is required";
      }
      return errors;
    },
    onCreateClick() {
      this.formErrors = this.formGetErrors();
      if (Object.keys(this.formErrors).length > 0) {
        return false;
      }
      apolloClient
        .mutate({
          mutation: createBlogMutation,
          variables: {
            pod: {
              owner: this.user._id,
              name: this.inputs.name,
              language: this.inputs.blogContentDefaultLanguage.replace("-", "_")
            }
          }
        })
        .then(result => {
          apolloClient.resetStore();
          logger.info("result", result);
          this.$router.push({
            name: "postList",
            params: { blogId: result.data.createPod._id }
          });
        })
        .catch(error => {
          this.errors.push(
            "Blog created failed with following message: " + error
          );
        });
    },
    onGenerateCLick() {
      this.$refs.randomNameLink.addEventListener("mousedown", function(e) {
        if (e.detail > 1) {
          e.preventDefault();
        }
      });
      this.inputs.name = generate();
    }
  }
};
</script>
