<template>
  <div class="pod-create-form section">
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
          <input v-model="name" class="input is-large" type="text" placeholder="Blog's Name" />
        </div>
      </div>

      <br />

      <div class="buttons are-medium is-centered">
        <a class="button is-outlined is-primary" @click="$router.push('/')">CANCEL</a>
        <button class="button is-primary" @click="onCreateClick">CREATE MY BLOG</button>
      </div>

      <!-- Any other Bulma elements you want -->
    </div>
    <button @click="showPublishBlogModal = false" class="modal-close is-large" aria-label="close"></button>
  </div>
</template>

<script>
import { generate } from "../lib/fantasyName.js";
import apolloClient from "../lib/apolloClient";
import { getUser } from "../lib/auth";
import gql from "graphql-tag";

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
      name: ""
    };
  },
  created() {
    this.user = getUser();
  },
  methods: {
    onCreateClick() {
      apolloClient
        .mutate({
          mutation: createPostMutation,
          variables: { pod: { owner: this.user.sub, name: this.name } }
        })
        .then(result => {
          apolloClient.resetStore();
          this.$router.push({
            name: "postList",
            params: { blogId: result.data.createPod._id }
          });
        });
    },
    onGenerateCLick() {
      this.$refs.randomNameLink.addEventListener("mousedown", function(e) {
        if (e.detail > 1) {
          e.preventDefault();
        }
      });
      this.name = generate();
    }
  }
};
</script>
