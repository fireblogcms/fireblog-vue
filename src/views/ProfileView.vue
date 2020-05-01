<template>
  <DefaultLayout>
    <template v-if="initDataState === 'PENDING'">
      <AppLoader />
    </template>
    <template v-if="initDataState === 'FINISHED_OK'">
      <AppPanel>
        <div class="flex flex-col items-center">
          <img
            class="w-64 h-64 mb-10 rounded-full"
            :src="me.picture"
            alt="User's profile picture"
          />
          <p class="text-3xl font-bold mb-2">{{ $t("global.label.name") }} {{ me.name }}</p>
          <p class="text-2xl">{{ $t("global.label.email") }} {{ me.email }}</p>
        </div>
      </AppPanel>
    </template>
  </DefaultLayout>
</template>

<script>
import AppLoader from "@/ui-kit/AppLoader";
import AppPanel from "@/ui-kit/AppPanel";
import apolloClient from "@/utils/apolloClient";
import {
  REQUEST_STATE,
  getUser,
  toast
} from "@/utils/helpers";
import gql from "graphql-tag";
import DefaultLayout from "@/layouts/DefaultLayout";

export default {
  components: {
    AppLoader,
    AppPanel,
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
