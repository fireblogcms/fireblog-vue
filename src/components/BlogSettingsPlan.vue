<template>
  <AppPanel class="py-0">
    <h2 class="title is-2">
      {{ $t("views.blogSettings.planSettings.title") }}
    </h2>
    <div class="plan-informations-container">
      <PlanInformations :blog="blog"></PlanInformations>
    </div>
    <button
      class="button is-outlined is-primary is-large"
      @click="onSubscribeClick(blog, $event)"
    >
      <span v-if="!blog.subscription.trialEnd">{{
        $t("global.changePlanButton")
      }}</span>
      <span v-if="blog.subscription.trialEnd">{{
        $t("global.subscribeButton")
      }}</span>
    </button>
  </AppPanel>
</template>

<script>
import AppPanel from "@/ui-kit/AppPanel";
import PlanInformations from "@/components/PlanInformations";

export default {
  components: {
    AppPanel,
    PlanInformations
  },
  props: {
    blog: {
      type: Object,
      required: true
    }
  },
  methods: {
    onSubscribeClick(blog) {
      this.$router.push({
        name: "plans",
        params: {
          blogId: blog._id
        }
      });
    }
  }
};
</script>

<style scoped>
.plan-informations-container {
  margin-bottom: 2rem;
}
</style>
