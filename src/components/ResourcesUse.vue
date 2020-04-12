<template>
  <div>
    <template v-if="initDataState === 'PENDING'">
      Loading stats...
    </template>
    <template v-if="initDataState === 'FINISHED_OK'">
      <div class="data-container">
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
                :stroke-dasharray="countPercentage + ', 100'"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
        <span>{{ resourcesUse.count }}/{{ callsPerMonth }} {{ $t("views.plans.apiCalls") }}</span>
      </div>
      <div class="data-container">
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
                stroke="#FF6600"
                :stroke-dasharray="sizePercentage + ', 100'"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
        <span>{{ resourcesUse.size }}/{{ sizePerMonth }} {{ $t("views.plans.storage") }}</span>
      </div>
    </template>
  </div>
</template>

<script>
import { REQUEST_STATE } from "../utils/helpers";
import apolloClient from "../utils/apolloClient";
import { getBlogResourcesUseQuery } from "../utils/queries";
import { getBlog } from "../utils/helpers";
export default {
  props: {
    blogId: {
      type: String,
      required: true
    },
    callsPerMonth: {
      type: String,
      required: true
    },
    sizePerMonth: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      error: null,
      initDataState: REQUEST_STATE.NOT_STARTED,
      blog: null,
      countPercentage: 0,
      sizePercentage: 0
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
          query: getBlogResourcesUseQuery,
          variables: {
            blog: this.blogId,
            from,
            to
          }
        })
        .then(results => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
          this.resourcesUse = results.data.resourcesUse;
          this.countPercentage = this.resourcesUse.count / this.callsPerMonth * 100;
          this.sizePercentage = this.resourcesUse.size / this.sizePerMonth * 100;
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
.data-container {
  display: flex;
  align-items: center;
}
.data-container + .data-container {
  margin-top: .5rem;
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
  justify-content: space-around;
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