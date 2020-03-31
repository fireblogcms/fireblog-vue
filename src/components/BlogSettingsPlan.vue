<template>
  <AppPanel
    style="margin-top:40px;margin-bottom:40px;padding:40px;"
    class="container is-small"
  >
    <h2 class="title is-2">
      {{ $t("views.blogSettings.planSettings.title") }}
    </h2>
    <div class="plans-informations">
      <p class="plans-name">
        Firestarter ({{
          $t("views.blogList.oneMonthFreeTrial")
        }})
      </p>
      <ApiUsage :blogId="blog._id"></ApiUsage>
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
import ApiUsage from "../components/ApiUsage";

export default {
  props: {
    blog: {
      type: Object,
      required: true
    }
  },
  components: {
    AppPanel,
    ApiUsage
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
.plans-informations {
  margin-bottom: 2rem;
}
.plans-name {
  margin: 0 0 1rem 0;
  font-weight: 500;
}
</style>
