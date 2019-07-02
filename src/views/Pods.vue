<template>
  <AdminLayout>
    <div class="pod-list-view content container section">
      <h1 v-if="pods && pods.edges.length > 0" class="title is-1">MY BLOGS</h1>

      <template v-if="loadingState === 'PENDING'">
        <PodLoader />
      </template>
      <template v-if="loadingState === 'FINISHED_OK'">
        <template v-if="pods.edges.length === 0">
          <div class="pod-container">
            <PodCreateForm :first="true" />
          </div>
        </template>
        <template v-if="pods && pods.edges.length > 0">
          <BulmaGrid :items="pods.edges" :itemsByRow="3" :itemKey="(item, index) => item._id">
            <template slot-scope="{item}">
              <router-link :to="`/pod/${item.node._id}`">
                <div class="card">
                  <div class="card-content">
                    <div class="content">
                      <h2>{{item.node.name}}</h2>
                      <br />
                      <p>Crée il y a {{Number(item.node.createdAt) | moment("from")}}</p>
                    </div>
                  </div>
                </div>
              </router-link>
            </template>
          </BulmaGrid>
        </template>
      </template>
    </div>
  </AdminLayout>
</template>

<script>
import apolloClient from "../lib/apolloClient";
import PodCreateForm from "../components/PodCreateForm";
import BulmaGrid from "../components/BulmaGrid";
import AdminLayout from "../layouts/AdminLayout";
import PodLoader from "../components/PodLoader";
import gql from "graphql-tag";

export default {
  components: {
    PodCreateForm,
    BulmaGrid,
    AdminLayout,
    PodLoader
  },
  data() {
    return {
      pods: null,
      loadingState: "NOT_STARTED"
    };
  },
  created() {
    this.loadingState = "PENDING";
    apolloClient
      .query({
        query: gql`
          query getPods {
            pods(first: 100) {
              edges {
                node {
                  name
                  description
                  createdAt
                  updatedAt
                  _id
                }
              }
            }
          }
        `
      })
      .then(result => {
        this.loadingState = "FINISHED_OK";
        this.pods = result.data.pods;
      })
      .catch(e => {
        this.loadingState = "FINISHED_ERROR";
      });
  }
};
</script>
