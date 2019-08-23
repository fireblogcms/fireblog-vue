<template>
  <AdminLayout>
    <Notify :errors="notifications.errors" :info="notifications.info" />
    <div class="pod-list-view container">
      <template v-if="myPodsRequestState === 'PENDING'">
        <PodLoader />
      </template>
      <template v-if="myPodsRequestState === 'FINISHED_OK'">
        <template v-if="pods.edges.length === 0">
          <div class="pod-container">
            <PodCreateForm :first="true" />
          </div>
        </template>
        <template v-if="pods && pods.edges.length > 0">
          <div>
            <h1 style="padding-bottom:2rem;" class="title is-1 is-uppercase">
              <img
                style="height:70px !important;position:relative;top:25px;padding-right:1rem"
                src="/images/books.webp"
              />
              MY BLOGS
              <ButtonLink
                style="margin-top:20px"
                class="is-pulled-right"
                type="primary"
                :to="{name:'blogCreate'}"
              >CREATE A NEW BLOG</ButtonLink>
            </h1>
          </div>
          <div class="pod-container">
            <div v-for="edge in pods.edges" :key="edge.node._id">
              <router-link :to="{name:'postList', params: {blogId: edge.node._id}}">
                <div style="padding-bottom:30px" class="columns">
                  <div class="column">
                    <div class="content">
                      <h2>
                        {{ edge.node.name }}
                        <em class="subtitle">
                          - created
                          {{ Number(edge.node.createdAt) | moment("from") }}
                        </em>
                      </h2>
                      <em>{{ edge.node.description }}</em>
                    </div>
                  </div>
                </div>
              </router-link>
            </div>
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
import { REQUEST_STATE } from "../lib/helpers";
import Notify from "../components/Notify";
import ButtonLink from "../components/ButtonLink";

const myPodsQuery = gql`
  query myPodsQuery {
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
    PodLoader,
    Notify,
    ButtonLink
  },
  data() {
    return {
      pods: null,
      myPodsRequestState: REQUEST_STATE.NOT_STARTED,
      notifications: {
        errors: [],
        info: []
      }
    };
  },
  methods: {
    getPods() {
      this.myPodsRequestState = REQUEST_STATE.PENDING;
      return apolloClient
        .query({ query: myPodsQuery })
        .then(result => {
          this.myPodsRequestState = REQUEST_STATE.FINISHED_OK;
          this.pods = result.data.me.pods;
        })
        .catch(e => {
          this.myPodsRequestState = REQUEST_STATE.FINISHED_ERROR;
          this.notifications.errors.push("getPods() " + e.message);
        });
    }
  },
  created() {
    this.getPods();
  }
};
</script>
