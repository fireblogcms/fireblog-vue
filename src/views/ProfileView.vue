<template>
  <DefaultLayout>
    <AppLoader v-if="initDataState === 'PENDING'">Loading profile</AppLoader>
    <AppPanel v-if="initDataState === 'FINISHED_OK'" class="container section is-small">
      <div style="padding:40px" class="has-text-centered">
        <div class="col-md-2">
          <img
            style="border-radius:200px;"
            width="200"
            :src="me.picture"
            alt="User's profile picture"
          />
        </div>
        <div class="column">
          <div class="content">
            <h2>name: {{ me.name }}</h2>
            <p>email: {{ me.email }}</p>
          </div>
        </div>
      </div>
    </AppPanel>
  </DefaultLayout>
</template>

<script>
import apolloClient from "../utils/apolloClient";
import AppPanel from "../components/AppPanel";
import AppLoader from "../components/AppLoader";
import { REQUEST_STATE, getUser } from "../utils/helpers";
import gql from "graphql-tag";
import logger from "../utils/logger";
import DefaultLayout from "../layouts/DefaultLayout";

export default {
  components: {
    AppPanel,
    AppLoader,
    DefaultLayout
  },
  data() {
    return {
      initDataState: REQUEST_STATE.NOT_STARTED,
      me: null
    };
  },
  methods: {
    initData() {
      this.errors = [];
      this.initDataState = REQUEST_STATE.PENDING;
      return getUser()
        .then(user => {
          this.me = user;
          this.initDataState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          appNotification(
            "Sorry, an error occured while loading page.",
            "error"
          );
          throw new Error(error);
        });
    }
  },
  created() {
    this.initData();
  }
};
</script>
