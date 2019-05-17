<template>
  <div class="pod-view">
    <div class="content container child-is-vertical-centered">
      <div class="has-text-centered">
        <h2>
          Glad to see you there {{ user.name }} 🤗
          <br>
          <br>First let's create a new Pod. Give it a name or let me
          <a
            @click.prevent="onGenerateCLick"
          >suggest you one</a>
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
          <button class="button is-info" @click="showPublishBlogModal = false">CREATE MY POD</button>
        </div>

        <!-- Any other Bulma elements you want -->
      </div>
      <button @click="showPublishBlogModal = false" class="modal-close is-large" aria-label="close"></button>
    </div>
  </div>
</template>

<script>
import { generate } from "../lib/fantasyName.js";

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
    onGenerateCLick() {
      this.name = generate();
    }
  }
};
</script>
