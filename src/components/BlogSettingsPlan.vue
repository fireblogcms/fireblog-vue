<template>
  <AppPanel
    style="margin-top:40px;margin-bottom:40px;padding:40px;"
    class="container is-small"
  >
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
      <span>{{
        $t("global.subscribeButton")
      }}</span>
    </button>
  </AppPanel>
</template>

<script>
import AppPanel from "../components/AppPanel";
import PlanInformations from "../components/PlanInformations";

export default {
  props: {
    blog: {
      type: Object,
      required: true
    }
  },
  components: {
    AppPanel,
    PlanInformations
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
