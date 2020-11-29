<template>
  <div>
    <ContentLoader
      class="md:hidden"
      :height="170"
      v-if="!plan || !resourcesUseData"
    >
      <rect x="0" y="0" rx="100%" ry="100%" width="9%" height="23%" />
      <rect x="0" y="27%" rx="100%" ry="100%" width="9%" height="23%" />
      <rect x="12%" y="5%" rx="2" ry="2" width="45%" height="12%" />
      <rect x="12%" y="32%" rx="2" ry="2" width="35%" height="12%" />
      <rect x="0" y="60%" rx="2" ry="2" width="45%" height="15%" />
      <rect x="0" y="80%" rx="2" ry="2" width="30%" height="15%" />
    </ContentLoader>
    <ContentLoader
      class="hidden md:block"
      :height="40"
      v-if="!plan || !resourcesUseData"
    >
      <rect x="0" y="0" rx="100%" ry="100%" width="5%" height="44%" />
      <rect x="0" y="50%" rx="100%" ry="100%" width="5%" height="44%" />
      <rect x="25" y="10%" rx="2" ry="2" width="80" height="24%" />
      <rect x="25" y="60%" rx="2" ry="2" width="60" height="24%" />
      <rect x="125" y="10%" rx="2" ry="2" width="90" height="24%" />
      <rect x="125" y="60%" rx="2" ry="2" width="70" height="24%" />
    </ContentLoader>
    <!-- v-show necessary and not v-if to instantiate ResourcesUse and get onViewData event -->
    <div
      class="flex flex-col md:flex-col md:items-start"
      v-show="plan && resourcesUseData"
    >
      <div v-if="plan">
        <div class="mb-5 font-bold text-xl">
          {{ $t("components.planInformations.name") }}
          {{ plan.productName }}
        </div>
        <div v-if="blogSet.subscription.status === 'TRIAL'">
          ({{ $t("components.planInformations.freeTrial") }}
          {{ blogSet.subscription.numberDaysLeftTrial }}
          {{ $t("components.planInformations.daysLeftTrial") }})
        </div>
      </div>
      <ResourcesUse
        v-if="plan"
        :blogSetId="blogSet._id"
        :callsPerMonth="plan.metadata.API_CALLS_MONTH"
        :sizePerMonth="plan.metadata.STORAGE_GB"
        @onViewData="resourcesUseData = true"
      />
    </div>
    <div class="flex justify-end">
      <AppButton
        v-if="!isFirstBlog"
        class="mt-5"
        @click="
          $router.push({
            name: 'plans',
            params: { blogSetId: blogSet._id },
          })
        "
      >
        <template v-if="blogSet.subscription.status === 'ACTIVE'">
          {{ $t("global.changePlanButton") }}
        </template>
        <template v-if="blogSet.subscription.status !== 'ACTIVE'">
          {{ $t("global.subscribeButton") }}
        </template>
      </AppButton>
    </div>
  </div>
</template>

<script>
import ResourcesUse from "@/components/ResourcesUse";
import AppButton from "@/ui-kit/AppButton";
import { getPlan } from "@/utils/helpers";
import { ContentLoader } from "vue-content-loader";
export default {
  components: {
    ContentLoader,
    ResourcesUse,
    AppButton,
  },
  props: {
    blogSet: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      resourcesUseData: false,
      plan: null,
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.plan = await getPlan(this.blogSet.subscription.planId);
    },
  },
};
</script>
