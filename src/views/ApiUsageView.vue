<template>
  <div class="container section">
    <AppPanel>
      <AppLoader v-if="initDataState === 'PENDING'">Loading stats...</AppLoader>
      <template v-if="initDataState ==='FINISHED_OK'">{{apiStats}}</template>
    </AppPanel>
  </div>
</template>

<script>
import AppLoader from "../components/AppLoader";
import { REQUEST_STATE, appNotification } from "../utils/helpers";
import AppPanel from "../components/AppPanel";
import apolloClient from "../utils/apolloClient";
import { getBlogStatsQuery } from "../utils/queries";

export default {
  components: {
    AppLoader,
    AppPanel
  },
  data() {
    return {
      error: null,
      initDataState: REQUEST_STATE.NOT_STARTED,
      apiStats: null
    };
  },
  async created() {
    this.initData();
  },
  methods: {
    initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      var date = new Date();
      var from = new Date(date.getFullYear(), date.getMonth(), 1);
      var to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return apolloClient
        .query({
          query: getBlogStatsQuery,
          variables: {
            blog: this.$route.params.blogId,
            from,
            to
          }
        })
        .then(results => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
          this.apiStats = results.data.apiStats;
          return results.data.apiStats;
        })
        .catch(e => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          throw new Error(e);
        });
    }
  }
};
</script>
