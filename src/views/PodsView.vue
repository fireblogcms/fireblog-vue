<template>
  <div class="pod-list-view content container section">
    <h1 v-if="pods && pods.edges.length > 0" class="title is-1">
      <img
        style="position:relative;top:10px;padding-right:20px"
        width="100"
        src="/images/books.webp"
      />
      MY PODS
    </h1>

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
        <div v-for="edge in pods.edges" :key="edge.node._id">
          <router-link :to="`/pod/${edge.node._id}`">
            <div class="card">
              <div class="card-content">
                <div class="columns">
                  <div class="column">
                    <div class="content">
                      <h2>{{edge.node.name}}</h2>
                      <em>{{edge.node.description}}</em>
                      <br />
                      <!--<p>Crée il y a {{Number(edge.node.createdAt) | moment("from")}}</p>-->
                    </div>
                  </div>
                  <div class="column is-one-quarter">
                    <img style="height:100px !important;" src="/images/book-closed-3.png" />
                  </div>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import apolloClient from "../lib/apolloClient";
import PodCreateForm from "../components/PodCreateForm";
import BulmaGrid from "../components/BulmaGrid";
import AdminLayout from "../layouts/AdminLayout";
import PodLoader from "../components/PodLoader";
import gql from "graphql-tag";

const myPodsQuery = gql`
  query myPods {
    me {
      pods(last: 100) {
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
  }
`;

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
      .query({ query: myPodsQuery })
      .then(result => {
        this.loadingState = "FINISHED_OK";
        this.pods = result.data.me.pods;
      })
      .catch(e => {
        this.loadingState = "FINISHED_ERROR";
      });
  }
};
</script>
