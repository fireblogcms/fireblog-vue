<template>
  <div>
    <p class="mb-4 font-bold" v-if="plan">
      {{ $t("components.planInformations.name") }}
      {{ plan.productName }}
      <template v-if="blog.subscription.trialEnd">
        ({{ $t("components.planInformations.freeTrial") }}
        {{ numberDaysLeftTrial }}
        {{ $t("components.planInformations.daysLeftTrial") }})
      </template>
    </p>
    <ResourcesUse
      v-if="plan"
      :blogId="blog._id"
      :callsPerMonth="plan.metadata.API_CALLS_MONTH"
      :sizePerMonth="plan.metadata.STORAGE_GB"
    />
  </div>
</template>

<script>
import ResourcesUse from "@/components/ResourcesUse";
import { getPlan } from "@/utils/helpers";

export default {
  components: {
    ResourcesUse
  },
  props: {
    blog: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      plan: null,
      numberDaysLeftTrial: null
    };
  },
  mounted() {
    this.fetchData();
    if (this.blog.subscription.trialEnd) {
      this.numberDaysLeftTrial = Math.round(
        (new Date(this.blog.subscription.trialEnd) - new Date()) /
          (1000 * 60 * 60 * 24)
      );
      if (this.numberDaysLeftTrial < 0) {
        this.numberDaysLeftTrial = 0;
      }
    }
  },
  methods: {
    async fetchData() {
      this.plan = await getPlan(this.blog.subscription.planId);
    }
  }
};
</script>
