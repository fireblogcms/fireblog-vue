<template>
  <div>
    <template v-if="initDataState ==='PENDING'">
      Loading stats...
    </template>
    <template v-if="initDataState ==='FINISHED_OK'">
      <p>{{apiUsage.count}}/{{apiUsage.countTotal}} API calls</p>
      <p>{{apiUsage.size}}/{{apiUsage.sizeTotal}} GB</p>
    </template>
  </div>
</template>

<script>
import { REQUEST_STATE, appNotification } from "../utils/helpers";
import apolloClient from "../utils/apolloClient";
import { getBlogApiUsageQuery } from "../utils/queries";
import { getBlog } from "../utils/helpers";

export default {
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
            // No need for the blog id, right ?
            // Add total to apiUsage object but how ?
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
