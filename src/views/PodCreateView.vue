<template>
  <div class="pod-view">
    <div class="container child-is-vertical-centered">
      <div class="content has-text-centered">
        <template v-if="$route.query.first">
          <h2>
            It's good to see you here, {{ user.name }} 🤗
            <br>
            <br>First let's create together your first Pod. Give it a name or let
            <a
              ref="randomNameLink"
              @click.prevent="onGenerateCLick"
            >us suggest a nice one for you</a>
          </h2>
        </template>
        <template v-if="!$route.query.first">
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
  </div>
</template>

<script>
import { generate } from "../lib/fantasyName.js";
import podClient from "../lib/podClient";

export default {
  data() {
    return {
      name: ""
    };
  },
  created() {
    console.log(this.$route);
    this.user = this.$auth.getUser();
  },
  methods: {
    onCreateClick() {
      podClient
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
          { podInput: { auth0_user_id: this.user.sub, name: this.name } }
        )
        .then(r => {
          this.$router.push("/pod/5ce94ee60d4b309dc36e2d5b/write");
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
