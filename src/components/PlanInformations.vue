<template>
  <div>
    <p
      class="plan-name has-text-weight-bold"
      v-if="plan"
    >
      {{ $t("components.planInformations.name") }} 
      {{ plan.productName }} 
      <template v-if="plan.productMetadata.SUBTITLE.includes('freeTrial')">
        ({{ $t(plan.productMetadata.SUBTITLE) }})
      </template>
    </p>
    <ApiUsage
      v-if="plan"
      :blogId="blog._id"
      :callsPerMonth="plan.productMetadata.API_CALLS_MONTH"
    ></ApiUsage>
  </div>
</template>

<script>
import ApiUsage from "../components/ApiUsage";
import { getPlan } from "../utils/helpers";

export default {
  components: {
    ApiUsage
  },
  props: {
    blog: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      plan: null
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.plan = await getPlan(this.blog.subscription.planId || process.env.VUE_APP_STRIPE_FREE_TRIAL_ID);
    }
  }
};
</script>

<style scoped>
.plan-name {
  margin: 0 0 1rem 0;
}
</style>
