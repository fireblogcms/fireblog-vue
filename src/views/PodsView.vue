<template>
  <AdminLayout>
    <div class="pod-list-view content container section">
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
          <div class="columns">
            <div class="column is-two-thirds">
              <h1 class="title is-1 is-uppercase">
                <img
                  style="height:80px !important;position:relative;top:25px;padding-right:1rem"
                  src="/images/books.webp"
                />
                MY PODS
              </h1>
            </div>
            <div class="column">
              <BulmaButtonLink to="pod/create" class="is-pulled-right">
                Create a new Pod
                <img style="height:70px !important" src="/images/book-closed-3.png" />
              </BulmaButtonLink>
            </div>
          </div>
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
                        <p>created {{Number(edge.node.createdAt) | moment("from")}}</p>
                      </div>
                    </div>
                    <div class="column is-one-quarter">
                      <BulmaButtonLink
                        class="is-pulled-right"
                        :to="`pod/${edge.node._id}/write/post`"
                      >Write</BulmaButtonLink>
                    </div>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
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
import BulmaButtonLink from "../components/BulmaButtonLink";

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
    BulmaButtonLink,
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
  methods: {
    getPods() {
      this.loadingState = "PENDING";
      return apolloClient
        .query({ query: myPodsQuery })
        .then(result => {
          this.loadingState = "FINISHED_OK";
          this.pods = result.data.me.pods;
        })
        .catch(e => {
          this.loadingState = "FINISHED_ERROR";
        });
    }
  },
  created() {
    this.getPods();
  }
};
</script>
