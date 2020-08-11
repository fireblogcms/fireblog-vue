<template>
  <div class="flex flex-col md:flex-row items-center" v-if="plan">
    <div class="text-center font-bold">
      <span>
        {{ $t("components.planInformations.name") }}
        {{ plan.productName }}
      </span>
      <span v-if="blog.subscription.trialEnd">
        ({{ $t("components.planInformations.freeTrial") }}
        {{ numberDaysLeftTrial }}
        {{ $t("components.planInformations.daysLeftTrial") }})
      </span>
    </div>
    <ResourcesUse
      :blogSetId="blog.blogSet"
      :callsPerMonth="plan.metadata.API_CALLS_MONTH"
      :sizePerMonth="plan.metadata.STORAGE_GB"
    />
    <span
      class="ml-6 text-primary font-bold cursor-pointer"
      @click="
        $router.push({
          name: 'plans',
          params: { blogId: blog._id },
        })
      "
    >
      <template v-if="!blog.subscription.trialEnd">
        {{ $t("global.changePlanButton") }}
      </template>
      <template v-if="blog.subscription.trialEnd">
        {{ $t("global.subscribeButton") }}
      </template>
    </span>
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
    blog: {
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
    },
  },
};
</script>
