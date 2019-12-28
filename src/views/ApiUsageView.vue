<template>
  <div class="container is-small section">
    <AppPanel style="padding:40px">
      <AppLoader v-if="initDataState === 'PENDING'">Loading stats...</AppLoader>
      <template v-if="initDataState ==='FINISHED_OK'">
        <div class="has-text-centered">
          <h1 class="title is-3">API USAGE - {{blog.name}}</h1>
          <h2 class="subtitle is-3">{{ new Date().toLocaleDateString(undefined, { month: 'long' })}}</h2>
          <p class="section">
            <span class="title is-4">{{apiUsage.count}}/220 000 API calls</span>
          </p>
        </div>
      </template>
    </AppPanel>
  </div>
</template>

<script>
import AppLoader from "../components/AppLoader";
import { REQUEST_STATE, appNotification } from "../utils/helpers";
import AppPanel from "../components/AppPanel";
import apolloClient from "../utils/apolloClient";
import { getBlogApiUsageQuery } from "../utils/queries";
import { getBlog } from "../utils/helpers";

export default {
  components: {
    AppLoader,
    AppPanel
  },
  data() {
    return {
      error: null,
      initDataState: REQUEST_STATE.NOT_STARTED,
      apiStats: null,
      blog: null
    };
  },
  async created() {
    this.initData();
  },
  methods: {
    async initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      this.blog = await getBlog(this.$route.params.blogId);
      // get stats for current month
      var date = new Date();
      var from = new Date(date.getFullYear(), date.getMonth(), 1);
      var to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return apolloClient
        .query({
          query: getBlogApiUsageQuery,
          variables: {
            blog: this.$route.params.blogId,
            from,
            to
          }
        })
        .then(results => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
          this.apiUsage = results.data.apiUsage;
        })
        .catch(e => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          throw new Error(e);
        });
    }
  }
};
</script>
