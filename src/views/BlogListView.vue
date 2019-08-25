<template>
  <AdminLayout>
    <AppNotify :errors="notifications.errors" :info="notifications.info" />
    <div class="container">
      <template v-if="myPodsRequestState === 'PENDING'">
        <AppLoader />
      </template>
      <template v-if="myPodsRequestState === 'FINISHED_OK'">
        <template v-if="pods.edges.length === 0">
          <LayoutBody>
            <BlogCreateForm :first="true" />
          </LayoutBody>
        </template>
        <template v-if="pods && pods.edges.length > 0">
          <div>
            <h1 style="padding-bottom:2rem;" class="title is-1">
              <img
                height="70"
                style="position:relative;top:25px;padding-right:1rem"
                src="/images/books.webp"
              />
              My blogs
              <BulmaButtonLink
                style="margin-top:30px"
                class="is-primary is-large is-pulled-right"
                :to="{name:'blogCreate'}"
              >CREATE A NEW BLOG</BulmaButtonLink>
            </h1>
          </div>
          <LayoutBody>
            <LayoutList
              :onRowClick="onRowClick"
              :items="pods.edges"
              :itemUniqueKey="(edge) => edge.node._id"
            >
              <template v-slot="{item}">
                <div class="columns">
                  <div class="column">
                    <div class="content">
                      <h2>
                        <router-link :to="buildLinkToPostList(item)">{{ item.node.name }}</router-link>
                        <em class="subtitle">
                          - created
                          {{ Number(item.node.createdAt) | moment("from") }}
                        </em>
                      </h2>
                      <p>
                        <em>{{ item.node.description }}</em>
                      </p>
                    </div>
                  </div>
                </div>
              </template>
            </LayoutList>
          </LayoutBody>
        </template>
      </template>
    </div>
  </AdminLayout>
</template>

<script>
import apolloClient from "../lib/apolloClient";
import BlogCreateForm from "../components/BlogCreateForm";
import BulmaGrid from "../components/BulmaGrid";
import AdminLayout from "../layouts/AdminLayout";
import AppLoader from "../components/AppLoader";
import gql from "graphql-tag";
import BulmaButtonLink from "../components/BulmaButtonLink";
import { REQUEST_STATE } from "../lib/helpers";
import AppNotify from "../components/AppNotify";
import ButtonLink from "../components/ButtonLink";
import LayoutBody from "../components/LayoutBody";
import LayoutList from "../components/LayoutList";
import ApiButton from "../components/ApiButton";

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
    LayoutBody,
    BulmaButtonLink,
    BlogCreateForm,
    BulmaGrid,
    AdminLayout,
    AppLoader,
    AppNotify,
    ButtonLink,
    LayoutList,
    ApiButton
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
    buildLinkToPostList(item) {
      return { name: "postList", params: { blogId: item.node._id } };
    },
    onRowClick(item) {
      this.$router.push(this.buildLinkToPostList(item));
    },
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
