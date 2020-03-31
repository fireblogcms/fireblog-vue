<template>
  <div>
    <p class="plan-name has-text-weight-bold">
      Plan: firestarter ({{
        $t("views.blogList.oneMonthFreeTrial")
      }})
    </p>
    <ApiUsage :blogId="blogId"></ApiUsage>
  </div>
</template>

<script>
import ApiUsage from "../components/ApiUsage";
import { getBlog } from "../utils/helpers";

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
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.blog = await getBlog(this.blogId);
    }
  }
};
</script>

<style scoped>
.plan-name {
  margin: 0 0 1rem 0;
}
</style>
