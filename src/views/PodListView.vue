<template>
  <div class="pod-list-view content container section">
    <h1>MY PODS</h1>
    <hr>
    <template v-if="loadingState === 'PENDING'">loading</template>
    <template v-if="loadingState === 'FINISHED_OK'">
      <template v-if="pods.length === 0">
        <div class="card">
          <div class="card-content">
            <div class="content has-text-centered">
              Looks like there is no created pod yet.
              <br>
              <br>
              <router-link
                class="button is-large is-info is-outlined"
                to="/pod/create"
              >Create a new Pod</router-link>
            </div>
          </div>
        </div>
      </template>
      <template v-if="pods.length > 0">
        <div v-for="pod in pods" :key="pod._id">
          <h2 style="color:#444">
            <div class="columns">
              <div class="column">
                <router-link :to="`/pod/${pod._id}`">{{pod.name}}</router-link>
              </div>
            </div>
          </h2>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import podClient from "../lib/podClient";

export default {
  data() {
    return {
      pods: "",
      loadingState: "NOT_STARTED"
    };
  },
  created() {
    this.loadingState = "PENDING";
    podClient()
      .request(
        `
    {
      pods {
        name, 
        description, 
        _id
      }
    }
    `
      )
      .then(r => {
        this.loadingState = "FINISHED_OK";
        console.log(r);
        this.pods = r.pods;
      })
      .catch(e => {
        this.loadingState = "FINISHED_ERROR";
      });
  }
};
</script>
