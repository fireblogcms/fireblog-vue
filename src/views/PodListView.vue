<template>
  <div class="pod-list-view content container section">
    <h1 v-if="pods.length > 0" class="title is-1">MY PODS</h1>

    <template v-if="loadingState === 'PENDING'">loading</template>
    <template v-if="loadingState === 'FINISHED_OK'">
      <template v-if="pods.length === 0">
        <PodCreateForm :first="true"/>
      </template>
      <template v-if="pods.length > 0">
        <BulmaGrid :items="pods" :itemsByRow="3" :itemKey="(item, index) => item._id">
          <template slot-scope="{item}">
            <router-link :to="`/pod/${item._id}`">
              <div class="card">
                <div class="card-content">
                  <div class="content">
                    <h2>{{item.name}}</h2>
                    <br>
                    <p>Crée il y a {{Number(item.createdAt) | moment("from")}}</p>
                  </div>
                </div>
              </div>
            </router-link>
          </template>
        </BulmaGrid>
      </template>
    </template>
  </div>
</template>

<script>
import podClient from "../lib/podClient";
import PodCreateForm from "../components/PodCreateForm";
import BulmaGrid from "../components/BulmaGrid";

export default {
  components: {
    PodCreateForm,
    BulmaGrid
  },
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
              name
              description
              createdAt
              updatedAt
              _id
            }
          }
        `
      )
      .then(r => {
        this.loadingState = "FINISHED_OK";
        this.pods = r.pods;
      })
      .catch(e => {
        this.loadingState = "FINISHED_ERROR";
      });
  }
};
</script>
