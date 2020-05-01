<template>
  <AppPanel class="py-0">
    <h2 class="text-4xl font-bold">
      {{ $t("views.blogSettings.planSettings.title") }}
    </h2>
    <PlanInformations :blog="blog" class="my-10" />
    <AppButton
      color="primary-outlined"
      @click="onSubscribeClick(blog, $event)"
    >
      <span v-if="!blog.subscription.trialEnd">
        {{ $t("global.changePlanButton") }}
      </span>
      <span v-if="blog.subscription.trialEnd">
        {{ $t("global.subscribeButton") }}
      </span>
    </AppButton>
  </AppPanel>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppPanel from "@/ui-kit/AppPanel";
import PlanInformations from "@/components/PlanInformations";

export default {
  components: {
    AppButton,
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
