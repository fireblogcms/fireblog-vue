<template>
  <div class="flex flex-col md:flex-row md:items-center" v-if="plan">
    <ResourcesUse
      :blogSetId="blogSet._id"
      :callsPerMonth="plan.metadata.API_CALLS_MONTH"
      :sizePerMonth="plan.metadata.STORAGE_GB"
    />
    <div class="flex flex-col mt-2 md:mt-0 md:ml-10">
      <div class="font-bold mb-1 md:mb-3">
        <span>
          {{ $t("components.planInformations.name") }}
          {{ plan.productName }}
        </span>
        <span v-if="blogSet.subscription.trialEnd">
          ({{ $t("components.planInformations.freeTrial") }}
          {{ numberDaysLeftTrial }}
          {{ $t("components.planInformations.daysLeftTrial") }})
        </span>
      </div>
      <router-link
        class="text-primary font-bold"
        :to="{
          name: 'plans',
          params: { blogSetId: blogSet._id },
        }"
      >
        <template v-if="!blogSet.subscription.trialEnd">
          {{ $t("global.changePlanButton") }}
        </template>
        <template v-if="blogSet.subscription.trialEnd">
          {{ $t("global.subscribeButton") }}
        </template>
      </router-link>
    </div>
  </div>
</template>

<script>
import ResourcesUse from "@/components/ResourcesUse";
import { getPlan } from "@/utils/helpers";

export default {
  components: {
    ResourcesUse,
  },
  props: {
    blogSet: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      plan: null,
      numberDaysLeftTrial: null,
    };
  },
  mounted() {
    this.fetchData();
    if (this.blogSet.subscription.trialEnd) {
      this.numberDaysLeftTrial = Math.round(
        (new Date(this.blogSet.subscription.trialEnd) - new Date()) /
          (1000 * 60 * 60 * 24)
      );
      if (this.numberDaysLeftTrial < 0) {
        this.numberDaysLeftTrial = 0;
      }
    }
  },
  methods: {
    async fetchData() {
      this.plan = await getPlan(this.blogSet.subscription.planId);
    },
  },
};
</script>
