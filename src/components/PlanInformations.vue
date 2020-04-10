<template>
  <div>
    <p
      class="plan-name has-text-weight-bold"
      v-if="plan"
    >
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
      :callsPerMonth="plan.productMetadata.API_CALLS_MONTH"
    ></ResourcesUse>
  </div>
</template>

<script>
import ResourcesUse from "../components/ResourcesUse";
import { getPlan } from "../utils/helpers";

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
    }
  },
  mounted() {
    this.fetchData();

    if (this.blog.subscription.trialEnd) {
      this.numberDaysLeftTrial = Math.round(
        (this.blog.subscription.trialEnd - Math.floor(new Date() / 1000)) / (3600 * 24)
      );
    }
  },
  methods: {
    async fetchData() {
      this.plan = await getPlan(this.blog.subscription.planId);
    }
  }
};
</script>

<style scoped>
.plan-name {
  margin: 0 0 1rem 0;
}
</style>
