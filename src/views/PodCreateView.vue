<template>
  <div class="pod-view">
    <div class="content container child-is-vertical-centered">
      <div class="has-text-centered">
        <h2>
          Glad to see you there {{ user.name }} ! 🤗 <br />First let's create a
          new Pod.
        </h2>
        <br />

        <div class="field">
          <div class="label">Give a name for your Pod {{ randomName }}</div>
          <div class="control">
            <input
              class="input is-info is-large"
              type="text"
              placeholder="Pod's name"
              value
            />
          </div>
        </div>

        <br />
        <div class="buttons are-medium is-centered">
          <button class="button is-outline" @click="$router.push('/')">
            CANCEL
          </button>
          <button class="button is-info" @click="showPublishBlogModal = false">
            CREATE
          </button>
        </div>

        <!-- Any other Bulma elements you want -->
      </div>
      <button
        @click="showPublishBlogModal = false"
        class="modal-close is-large"
        aria-label="close"
      ></button>
    </div>
  </div>
</template>

<script>
import { generate } from "../lib/fantasyName.js";

export default {
  created() {
    this.user = this.$auth.getUser();
    this.randomName = generate();
  }
};
</script>
