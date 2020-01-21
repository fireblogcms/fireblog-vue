<template>
  <div class="api-usage-container">
    <template v-if="initDataState ==='PENDING'">
      Loading stats...
    </template>
    <template v-if="initDataState ==='FINISHED_OK'">
      <div class="flex-wrapper">
        <div class="single-chart">
          <svg viewBox="0 0 36 36">
            <path
              class="circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              class="circle"
              stroke="#4CC790"
              :stroke-dasharray="percentage + ', 100'"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>
      </div>
      <span>{{apiUsage.count}}/{{apiUsage.countTotal}} API calls</span>
    </template>
  </div>
</template>

<script>
import { REQUEST_STATE, appNotification } from "../utils/helpers";
import apolloClient from "../utils/apolloClient";
import { getBlogApiUsageQuery } from "../utils/queries";
import { getBlog } from "../utils/helpers";
export default {
  props: {
    blogId: {
      type: String,
      default: () => ""
    }
  },
  data() {
    return {
      error: null,
      initDataState: REQUEST_STATE.NOT_STARTED,
      apiStats: null,
      blog: null,
      percentage: 0
    };
  },
  async created() {
    this.initData();
  },
  methods: {
    async initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      this.blog = await getBlog(this.blogId);
      // get stats for current month
      var date = new Date();
      var from = new Date(date.getFullYear(), date.getMonth(), 1);
      var to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return apolloClient
        .query({
          query: getBlogApiUsageQuery,
          variables: {
            blog: this.blogId,
            from,
            to
          }
        })
        .then(results => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
          this.apiUsage = results.data.apiUsage;
          this.percentage = this.apiUsage.count / this.apiUsage.countTotal * 100;
        })
        .catch(e => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          throw new Error(e);
        });
    }
  }
};
</script>

<style scoped>
.api-usage-container {
  display: flex;
  align-items: center;
}
.flex-wrapper {
  display: flex;
  flex-flow: row nowrap;
  width: 40px;
  height: 40px;
  margin-right: 1rem;
}
.single-chart {
  width: 100%;
  justify-content: space-around ;
}
.circle-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 3.8;
}
.circle {
  fill: none;
  stroke-width: 2.8;
  stroke-linecap: round;
  animation: progress 1s ease-out forwards;
}
@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}
</style>