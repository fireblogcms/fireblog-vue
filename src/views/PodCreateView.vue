<template>
  <div class="pod-view">
    <div class="container child-is-vertical-centered">
      <div class="content has-text-centered">
        <h2>
          It's good to see you here, {{ user.name }} 🤗
          <br>
          <br>First let's create your first blog. Give it a name to your pod or let
          <a
            ref="randomNameLink"
            @click.prevent="onGenerateCLick"
          >use suggest one for you</a>
        </h2>
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
  </div>
</template>

<script>
import { generate } from "../lib/fantasyName.js";
import graphqlClient from "../lib/graphqlClient";

export default {
  data() {
    return {
      name: ""
    };
  },
  created() {
    this.user = this.$auth.getUser();
  },
  methods: {
    onCreateClick() {
      graphqlClient.request(
        `
      mutation($podInput: PodInput!) {
        createPod(podInput: $podInput) {
          name
          description
        }
      }
    `,
        { podInput: { auth0_user_id: this.user.sub, name: this.name } }
      );
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
