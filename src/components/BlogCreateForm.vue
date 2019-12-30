<template>
  <div class="blog-create-form section">
    <template v-if="initDataState === 'PENDING'">
      <AppLoader>Loading</AppLoader>
    </template>

    <template v-if="initDataState === 'FINISHED_ERROR'">
      <div class="notification is-danger">{{ initStateError }}</div>
    </template>

    <template v-if="initDataState === 'FINISHED_OK'">
      <AppPanel>
        <div class="section">
          <div class="content has-text-centered">
            <!-- special text if this is the very first blog :) -->
            <template v-if="isMyFirstBlog">
              <h2>Glad to see you here, {{ user.name }} 🤗</h2>
              <h2 style="font-weight:200;">Let's create your first blog.</h2>
            </template>

            <br />

            <div class="field">
              <div class="label-wrapper">
                <label class="label is-large">{{$t("views.blogCreate.fields.title.label")}}</label>
                <p class="description">{{$t("views.blogCreate.fields.title.help")}}</p>
              </div>
              <div class="control">
                <input
                  v-model="inputs.name"
                  class="input is-large"
                  :class="{ 'is-danger': formErrors.name }"
                  type="text"
                  maxlength="250"
                  placeholder="Blog's Name"
                />
              </div>
              <p class="help is-danger" v-if="formErrors.name">{{ formErrors.name }}</p>
            </div>

            <div class="field">
              <div class="control has-text-centered">
                <div class="label-wrapper">
                  <label class="label is-large">{{$t("views.blogCreate.fields.description.label")}}</label>
                  <p class="description">{{$t("views.blogCreate.fields.description.help")}}</p>
                </div>
                <textarea
                  v-model="inputs.description"
                  class="input is-large textarea"
                  :class="{ 'is-danger': formErrors.description }"
                  type="text"
                  maxlength="250"
                ></textarea>
              </div>
              <p class="help is-danger" v-if="formErrors.description">{{ formErrors.description }}</p>
            </div>

            <br />

            <div class="buttons are-medium is-centered">
              <button
                v-if="!isMyFirstBlog"
                class="button is-outlined"
                @click="$router.push('/')"
              >{{$t("views.blogCreate.cancelButton").toUpperCase()}}</button>
              <button
                :disabled="savingBlogState === 'PENDING'"
                :class="{ 'is-loading': savingBlogState === 'PENDING' }"
                class="button is-primary"
                @click="onCreateClick"
              >{{$t("views.blogCreate.createButton").toUpperCase()}}</button>
            </div>

            <!-- Any other Bulma elements you want -->
          </div>
        </div>
      </AppPanel>
    </template>
  </div>
</template>

<script>
import { generate } from "../utils/fantasyName.js";
import apolloClient from "../utils/apolloClient";
import { getUser, REQUEST_STATE } from "../utils/helpers";
import gql from "graphql-tag";
import {
  getMyBlogsQuery,
  getUserQuery,
  createBlogMutation
} from "../utils/queries";
import AppLoader from "../components/AppLoader";
import AppPanel from "../components/AppPanel";
import logger from "../utils/logger";

export default {
  components: {
    AppLoader,
    AppPanel
  },
  props: {
    isMyFirstBlog: {
      type: Boolean
    }
  },
  data() {
    return {
      errors: [],
      formErrors: [],
      initDataState: REQUEST_STATE.NOT_STARTED,
      initStateError: null,
      savingBlogState: REQUEST_STATE.NOT_STARTED,
      user: null,
      languageList: null,
      inputs: {
        name: "",
        blogContentDefaultLocale: null
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
      Promise.all([getUser()])
        .then(([user]) => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
          this.user = user;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          this.initStateError = "initData() : " + error;
          throw new Error(error);
        });
    },
    getFormErrors() {
      const errors = [];
      if (!this.inputs.name.trim()) {
        errors["name"] = "Name is required";
      }
      return errors;
    },
    onCreateClick() {
      this.formErrors = this.getFormErrors();
      if (Object.keys(this.formErrors).length > 0) {
        return false;
      }
      this.savingBlogState = REQUEST_STATE.PENDING;
      apolloClient
        .mutate({
          mutation: createBlogMutation,
          variables: {
            blog: {
              name: this.inputs.name,
              description: this.inputs.description
            }
          }
        })
        .then(async result => {
          await apolloClient.resetStore();
          this.savingBlogState = REQUEST_STATE.FINISHED_OK;
          this.$router.push({
            name: "postList",
            params: { blogId: result.data.createBlog._id }
          });
        })
        .catch(error => {
          this.savingBlogState = REQUEST_STATE.FINISHED_ERROR;
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
