<template>
  <div class="pod-create-form section">
    <div v-if="errors.length > 0" class="notification is-danger">{{errors.join(';')}}</div>

    <template v-if="initState === 'PENDING'"></template>
    <template v-if="initState === 'FINISHED_OK'">
      <div class="content has-text-centered">
        <!-- special text if this is the very first blog :) -->
        <template v-if="first">
          <h2>Glad to see you here, {{ user.name }} 🤗</h2>
          <h2 style="font-weight:200;">
            First, let's create your first Pod that will hold your articles.
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
            <p v-if="formErrors.name" class="help is-danger">{{formErrors.name}}</p>
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
import { REQUEST_STATE } from "../lib/helpers";
import AppLoader from "../components/AppLoader";

const createPostMutation = gql`
  mutation createPod($pod: CreatePodInput!) {
    createPod(pod: $pod) {
      name
      description
      _id
    }
  }
`;

export default {
  props: {
    first: {
      type: Boolean
    }
  },
  data() {
    return {
      errors: [],
      formErrors: [],
      initState: REQUEST_STATE.NOT_STARTED,
      user: null,
      inputs: {
        name: ""
      }
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.initState = REQUEST_STATE.PENDING;
      getUser().then(user => {
        this.initState = REQUEST_STATE.FINISHED_OK;
        this.user = user;
      });
    },
    formGetErrors() {
      const errors = [];
      if (!this.inputs.name.trim()) {
        errors["name"] = "Field name is required";
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
          mutation: createPostMutation,
          variables: { pod: { owner: this.user._id, name: this.inputs.name } }
        })
        .then(result => {
          apolloClient.resetStore();
          console.log("result", result);
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
