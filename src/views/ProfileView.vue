<template>
  <DefaultLayout>
    <div class="container is-small">
      <template v-if="initDataState === 'PENDING'">
        <AppLoader>Loading profile</AppLoader>
      </template>
      <template v-if="initDataState === 'FINISHED_OK'">
        <div class="section">
          <AppPanel>
            <div class="section">
              <div class="content has-text-centered">
                <div class="column">
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
            </div>
          </AppPanel>
        </div>
      </template>
    </div>
  </DefaultLayout>
</template>

<script>
import apolloClient from "../utils/apolloClient";
import AppPanel from "../components/AppPanel";
import AppLoader from "../components/AppLoader";
import {
  REQUEST_STATE,
  getUser,
  toast
} from "../utils/helpers";
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
          toast(this, "Sorry, an error occured while loading page.", "error");
          throw new Error(error);
        });
    }
  },
  created() {
    this.initData();
  }
};
</script>
