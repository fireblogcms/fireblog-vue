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
      :blogId="blogId"
      :callsPerMonth="plan.productMetadata.API_CALLS_MONTH"
    ></ApiUsage>
  </div>
</template>

<script>
import ApiUsage from "../components/ApiUsage";
import { getBlog, getPlan } from "../utils/helpers";

export default {
  components: {
    ApiUsage
  },
  props: {
    blogId: {
      type: String,
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
      const blog = await getBlog(this.blogId);
      this.plan = await getPlan(blog.subscription);
    }
  }
};
</script>

<style scoped>
.plan-name {
  margin: 0 0 1rem 0;
}
</style>
