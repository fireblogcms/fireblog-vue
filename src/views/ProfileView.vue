<template>
  <AdminLayout>
    <AppNotify :errors="errors" />

    <template v-if="initDataState === 'PENDING'">
      <AppLoader>Loading profile</AppLoader>
    </template>

    <template v-if="initDataState === 'FINISHED_OK'">
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
import apolloClient from "../utils/apolloClient";
import LayoutBody from "../components/LayoutBody";
import AppLoader from "../components/AppLoader";
import AppNotify from "../components/AppNotify";
import { REQUEST_STATE } from "../utils/helpers";
import gql from "graphql-tag";
import logger from "../utils/logger";

export default {
  components: {
    AdminLayout,
    LayoutBody,
    AppLoader,
    AppNotify
  },
  data() {
    return {
      initDataState: REQUEST_STATE.NOT_STARTED,
      errors: [],
      me: null
    };
  },
  methods: {
    initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      return Promise.all([this.getProfile()])
        .then(() => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          this.errors.push(error);
          logger.error(new Error(error));
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
          logger.error(new Error(error));
        });
    }
  },
  created() {
    this.initData();
  }
};
</script>
