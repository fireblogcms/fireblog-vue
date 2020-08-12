<template>
  <div>
    <div class="flex flex-col md:flex-row" v-if="initDataState === 'FINISHED_OK'">
      <div class="flex items-center mt-2 md:mt-0">
        <div class="flex w-8 h-8 md:ml-5 mr-3">
          <div class="w-full">
            <svg viewBox="0 0 36 36">
              <path
                fill="none"
                stroke="#eee"
                stroke-width="3.8"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="circle"
                fill="none"
                stroke="#4cc790"
                stroke-linecap="round"
                stroke-width="2.8"
                :stroke-dasharray="countPercentage + ', 100'"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
        <span
          >{{ resourcesUse.count }}/{{ callsPerMonth }}
          {{ $t("views.plans.apiCalls") }}</span
        >
      </div>
      <div class="flex items-center my-2 md:my-0">
        <div class="flex w-8 h-8 md:ml-5 mr-3">
          <div class="w-full">
            <svg viewBox="0 0 36 36">
              <path
                fill="none"
                stroke="#eee"
                stroke-width="3.8"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="circle"
                fill="none"
                stroke="#ff6600"
                stroke-linecap="round"
                stroke-width="2.8"
                :stroke-dasharray="sizePercentage + ', 100'"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
        <span>
          {{ formatBytes(resourcesUse.size) }}/{{ sizePerMonth }}
          {{ $t("views.plans.storageUnitGB") }}
          {{ $t("views.plans.storage") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { REQUEST_STATE } from "@/utils/helpers";
import apolloClient from "@/utils/apolloClient";
import { getBlogResourcesUseQuery } from "@/utils/queries";

export default {
  props: {
    blogSetId: {
      type: String,
      required: true,
    },
    callsPerMonth: {
      type: String,
      required: true,
    },
    sizePerMonth: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      error: null,
      initDataState: REQUEST_STATE.NOT_STARTED,
      countPercentage: 0,
      sizePercentage: 0,
    };
  },
  async created() {
    this.initData();
  },
  methods: {
    async initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      // get stats for current month
      var date = new Date();
      var from = new Date(date.getFullYear(), date.getMonth(), 1);
      var to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return apolloClient
        .query({
          query: getBlogResourcesUseQuery,
          variables: {
            blogSet: this.blogSetId,
            from,
            to,
          },
        })
        .then(results => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
          this.resourcesUse = results.data.resourcesUse;
          this.countPercentage =
            (this.resourcesUse.count / this.callsPerMonth) * 100;
          this.sizePercentage =
            (this.resourcesUse.size / (1073741824 * this.sizePerMonth)) * 100;
        })
        .catch(e => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          throw new Error(e);
        });
    },
    formatBytes(bytes) {
      if (bytes === 0) {
        return bytes;
      } else {
        let i = Math.floor(Math.log(bytes) / Math.log(1024));
        let sizes = [
          "views.plans.storageUnitB",
          "views.plans.storageUnitKB",
          "views.plans.storageUnitMB",
          "",
        ];
        return `${(bytes / Math.pow(1024, i)).toFixed(2) * 1} ${this.$t(
          sizes[i]
        )}`;
      }
    },
  },
};
</script>

<style>
.circle {
  animation: progress 1s ease-out forwards;
}
@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}
</style>
