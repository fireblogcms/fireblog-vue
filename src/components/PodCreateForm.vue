<template>
  <div class="pod-create-form">
    <div class="content has-text-centered">
      <!-- special text if this is the very first POD :) -->
      <template v-if="first">
        <h2>
          Welcome here, {{ user.name }} 🤗
          <br>
          <br>First let's create together your first Pod that will hold your articles.
          <br>Give it a name or let
          <a
            ref="randomNameLink"
            @click.prevent="onGenerateCLick"
          >us suggest a nice one for you</a>
        </h2>
      </template>
      <!-- text is this is not the first pod -->
      <template v-if="!first">
        <h2>
          <br>Create a new Pod. Give it a name or let
          <a
            ref="randomNameLink"
            @click.prevent="onGenerateCLick"
          >us suggest a nice one for you</a>
        </h2>
      </template>
      <br>

      <div class="field">
        <div class="control">
          <input v-model="name" class="input is-large" type="text" placeholder="Pod's Name">
        </div>
      </div>

      <br>

      <div class="buttons are-medium is-centered">
        <button class="button is-outline" @click="$router.push('/')">CANCEL</button>
        <button class="button is-info" @click="onCreateClick">CREATE MY POD</button>
      </div>

      <!-- Any other Bulma elements you want -->
    </div>
    <button @click="showPublishBlogModal = false" class="modal-close is-large" aria-label="close"></button>
  </div>
</template>

<script>
import { generate } from "../lib/fantasyName.js";
import podClient from "../lib/podClient";
import { getUser } from "../lib/auth";

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
      podClient()
        .request(
          `
            mutation($podInput: PodInput!) {
              createPod(podInput: $podInput) {
                name
                description
                _id
              }
            }
          `,
          { podInput: { owner: this.user.sub, name: this.name } }
        )
        .then(result => {
          console.log("result", result);
          this.$router.push(`/pod/${result.createPod._id}`);
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
