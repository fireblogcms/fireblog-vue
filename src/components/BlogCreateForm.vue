<template>
  <div class="blog-create-form section">
    <template v-if="initDataState === 'PENDING'">
      <AppLoader>Loading</AppLoader>
    </template>

    <template v-if="initDataState === 'FINISHED_ERROR'">
      <div class="notification is-danger">{{initStateError}}</div>
    </template>

    <template v-if="initDataState === 'FINISHED_OK'">
      <LayoutBody>
        <div class="section">
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

            <!-- text is this is not the first blog -->
            <template v-if="!first">
              <h2>Which is your blog name ?</h2>
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
              <a class="button is-outlined" @click="$router.push('/')">CANCEL</a>
              <button class="button is-primary" @click="onCreateClick">CREATE MY BLOG</button>
            </div>

            <!-- Any other Bulma elements you want -->
          </div>
        </div>
      </LayoutBody>
    </template>
  </div>
</template>

<script>
import { generate } from "../utils/fantasyName.js";
import apolloClient from "../utils/apolloClient";
import { getUser } from "../utils/helpers";
import gql from "graphql-tag";
import { REQUEST_STATE } from "../utils/helpers";
import AppLoader from "../components/AppLoader";
import LayoutBody from "../components/LayoutBody";
import logger from "../utils/logger";

const createBlogMutation = gql`
  mutation createBlog($blog: CreateBlogInput!) {
    createBlog(blog: $blog) {
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
    AppLoader,
    LayoutBody
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
      initDataState: REQUEST_STATE.NOT_STARTED,
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
    this.initData();
  },
  methods: {
    async initData() {
      this.initStateError = null;
      this.initDataState = REQUEST_STATE.PENDING;
      Promise.all([getUser(), this.getLanguageList()])
        .then(([user, languageListResult]) => {
          const languages = languageListResult.data.languages;
          this.initDataState = REQUEST_STATE.FINISHED_OK;
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
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          this.initStateError = "initData() : " + error;
          throw new Error(error);
        });
    },
    getLanguageList() {
      return apolloClient.query({
        query: languageListQuery
      });
    },
    getFormErrors() {
      const errors = [];
      if (!this.inputs.name.trim()) {
        errors["name"] = "Name is required";
      }
      if (!this.inputs.blogContentDefaultLanguage.trim()) {
        errors["blogContentDefaultLanguage"] = "Language is required";
      }
      return errors;
    },
    onCreateClick() {
      this.formErrors = this.getFormErrors();
      if (Object.keys(this.formErrors).length > 0) {
        return false;
      }
      apolloClient
        .mutate({
          mutation: createBlogMutation,
          variables: {
            blog: {
              owner: this.user._id,
              name: this.inputs.name,
              language: this.inputs.blogContentDefaultLanguage.replace("-", "_")
            }
          }
        })
        .then(result => {
          logger.info("result", result);
          this.$router.push({
            name: "postList",
            params: { blogId: result.data.createBlog._id }
          });
        })
        .catch(error => {
          this.errors.push(
            "Blog created failed with following message: " + error
          );
          throw new Error(error);
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
