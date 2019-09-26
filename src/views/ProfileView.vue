<template>
  <DefaultLayout>
    <AppError v-if="errorMessage">{{errorMessage}}</AppError>

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
  </DefaultLayout>
</template>

<script>
import DefaultLayout from "@/layouts/DefaultLayout";
import apolloClient from "../utils/apolloClient";
import LayoutBody from "../components/LayoutBody";
import AppLoader from "../components/AppLoader";
import AppError from "../components/AppError";
import { REQUEST_STATE } from "../utils/helpers";
import gql from "graphql-tag";
import logger from "../utils/logger";

export default {
  components: {
    DefaultLayout,
    LayoutBody,
    AppLoader,
    AppError
  },
  data() {
    return {
      initDataState: REQUEST_STATE.NOT_STARTED,
      errorMessage: null,
      me: null
    };
  },
  methods: {
    initData() {
      this.errors = [];
      this.initDataState = REQUEST_STATE.PENDING;
      return Promise.all([this.getProfile()])
        .then(() => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          this.errorMessage = "Sorry, an error occured while loading page.";
          throw new Error(error);
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
          this.errorMessage =
            "Sorry, an error occured while fetching your profile.";
          throw new Error(error);
        });
    }
  },
  created() {
    this.initData();
  }
};
</script>
