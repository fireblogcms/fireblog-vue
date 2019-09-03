<template>
  <AdminLayout>
    <AppNotify :errors="errors" />

    <template v-if="initState === 'PENDING'">
      <AppLoader>Loading profile</AppLoader>
    </template>

    <template v-if="initState === 'COMPLETE_OK'">
      <div class="container section animated fadeIn">
        <LayoutBody>
          <div style="padding:40px">
            <div class="col-md-2">
              <img width="200" :src="me.picture" alt="User's profile picture" />
            </div>
            <div class="column">
              <div class="content">
                <h2>identifiant: {{ me.name }}</h2>
                <p>email: {{ me.email }}</p>
              </div>
            </div>
          </div>
        </LayoutBody>
      </div>
    </template>
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/layouts/AdminLayout";
import apolloClient from "../lib/apolloClient";
import LayoutBody from "../components/LayoutBody";
import AppLoader from "../components/AppLoader";
import AppNotify from "../components/AppNotify";
import { LOADING_STATE } from "../lib/helpers";
import gql from "graphql-tag";
import * as Sentry from "@sentry/browser";

export default {
  components: {
    AdminLayout,
    LayoutBody,
    AppLoader,
    AppNotify
  },
  data() {
    return {
      initState: LOADING_STATE.NOT_STARTED,
      errors: [],
      me: null
    };
  },
  methods: {
    init() {
      this.initState = LOADING_STATE.PENDING;
      return Promise.all([this.getProfile()])
        .then(() => {
          this.initState = LOADING_STATE.COMPLETE_OK;
        })
        .catch(error => {
          this.initState = LOADING_STATE.COMPLETE_ERROR;
          this.errors.push(error);
          Sentry.captureException(new Error(error));
        });
    },
    getProfile() {
      return apolloClient
        .query({
          query: gql`
            query profileQuery {
              me {
                _id
                name
                email
                createdAt
                updatedAt
                picture
              }
            }
          `
        })
        .then(result => {
          this.me = result.data.me;
          return result;
        })
        .catch(error => {
          this.errors.push(
            "Sorry, an error occured while fetching your profile." + error
          );
          Sentry.captureException(new Error(error));
        });
    }
  },
  created() {
    this.init();
  }
};
</script>
